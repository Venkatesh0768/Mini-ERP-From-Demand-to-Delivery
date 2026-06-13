package org.odoo.backend.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.audit.model.AuditAction;
import org.odoo.backend.audit.model.AuditEntityType;
import org.odoo.backend.audit.service.AuditService;
import org.odoo.backend.auth.dto.*;
import org.odoo.backend.auth.exception.AccountLockedException;
import org.odoo.backend.auth.exception.EmailAlreadyExistsException;
import org.odoo.backend.auth.exception.EmailNotVerifiedException;
import org.odoo.backend.auth.exception.InvalidTokenException;
import org.odoo.backend.auth.exception.UserNotFoundException;
import org.odoo.backend.auth.model.ActivationToken;
import org.odoo.backend.auth.model.RefreshToken;
import org.odoo.backend.auth.model.Role;
import org.odoo.backend.auth.model.RoleType;
import org.odoo.backend.auth.model.User;
import org.odoo.backend.auth.repository.RoleRepository;
import org.odoo.backend.auth.repository.UserRepository;
import org.odoo.backend.auth.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final OTPService otpService;
    private final RefreshTokenService refreshTokenService;
    private final ActivationTokenService activationTokenService;
    private final AuditService auditService;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;


    @Transactional
    public ApiResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered");
        }

        Role userRole = roleRepository.findByName(RoleType.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Default role ROLE_USER not found — did DataInitializer run?"));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .emailVerified(false)
                .enabled(false)
                .provider("local")
                .build();

        user.getRoles().add(userRole);
        userRepository.save(user);

        otpService.generateAndSendOTP(user.getEmail());

        log.info("New user registered: {}", user.getEmail());
        return new ApiResponse(true,
                "Registration successful. Please check your email for the verification OTP.", null);
    }


    @Transactional
    public LoginResult login(LoginRequest request, String deviceInfo) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Invalid email or password"));

        // Brute-force check BEFORE attempting Spring Security authentication
        if (user.isAccountLocked()) {
            long minutesLeft = java.time.Duration.between(
                    LocalDateTime.now(), user.getAccountLockedUntil()).toMinutes() + 1;
            throw new AccountLockedException(
                    "Account temporarily locked due to too many failed attempts. " +
                            "Try again in " + minutesLeft + " minute(s).");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            // Reset counter on successful auth
            user.setFailedLoginAttempts(0);
            user.setAccountLockedUntil(null);
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            // Email must be verified for local accounts
            if (!user.isEmailVerified()) {
                throw new EmailNotVerifiedException("Please verify your email before logging in");
            }

            String accessToken = tokenProvider.generateToken(authentication);
            RefreshToken refresh = refreshTokenService.createRefreshToken(user, deviceInfo);

            log.info("User logged in: {} from device='{}'", user.getEmail(), deviceInfo);

            AuthResponse authResponse = AuthResponse.builder()
                    .accessToken(accessToken)
                    .expiresIn(jwtExpirationMs / 1000)
                    .user(convertToUserDTO(user))
                    .build();

            auditService.log(
                    AuditAction.LOGIN,
                    AuditEntityType.USER,
                    user.getId().toString(),
                    user.getEmail(),
                    "User Logged In"
            );

            return new LoginResult(authResponse, refresh.getToken());

        } catch (BadCredentialsException | DisabledException ex) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES));
                userRepository.save(user);
                log.warn("Account locked for user={} after {} failed attempts", user.getEmail(), attempts);
                throw new AccountLockedException(
                        "Account locked for " + LOCK_DURATION_MINUTES +
                                " minutes due to too many failed login attempts.");
            }

            userRepository.save(user);
            int remaining = MAX_FAILED_ATTEMPTS - attempts;
            throw new BadCredentialsException(
                    "Invalid email or password. " + remaining + " attempt(s) remaining before lockout.");
        }
    }

    @Transactional
    public ApiResponse verifyOTP(OTPVerificationRequest request) {
        otpService.validateOTPOrThrow(request.getEmail(), request.getOtp());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setEmailVerified(true);
        user.setEnabled(true);
        userRepository.save(user);

        log.info("Email verified for user={}", user.getEmail());
        return new ApiResponse(true, "Email verified successfully. You can now log in.", null);
    }

    // ─── OTP Verification ────────────────────────────────────────────────────

    @Transactional
    public ApiResponse resendOTP(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        otpService.assertEmailNotYetVerified(user);
        otpService.generateAndSendOTP(email);

        return new ApiResponse(true, "OTP sent to " + email, null);
    }


    @Transactional
    public LoginResult refreshAccessToken(String rawToken, String deviceInfo) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(rawToken);
        User user = refreshToken.getUser();

        // Rotate the refresh token (old invalidated, new issued)
        RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(refreshToken, deviceInfo);

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .toList();
        String newAccessToken = tokenProvider.generateTokenFromUsername(user.getEmail(), roles);

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(newAccessToken)
                .expiresIn(jwtExpirationMs / 1000)
                .user(convertToUserDTO(user))
                .build();

        return new LoginResult(authResponse, newRefreshToken.getToken());
    }


    @Transactional
    public ApiResponse logout(String rawToken) {
        refreshTokenService.deleteByTokenValue(rawToken);
        return new ApiResponse(true, "Logged out successfully", null);
    }


    @Transactional
    public ApiResponse logoutAll(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        refreshTokenService.deleteAllByUser(user);
        log.info("All sessions revoked for user={}", email);
        return new ApiResponse(true, "All sessions revoked successfully", null);
    }


    @Transactional
    public void requestPasswordReset(String email) {
        // Find user silently — do not reveal whether the email exists
        userRepository.findByEmail(email)
                .ifPresent(user -> otpService.generateAndSendPasswordResetOTP(email));
    }


    @Transactional
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        otpService.validateOTPOrThrow(request.getEmail(), request.getOtp());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        // Unlock account on password reset — good UX after lockout
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        userRepository.save(user);

        // Invalidate all existing sessions — credentials changed
        refreshTokenService.deleteAllByUser(user);
        log.info("Password reset for user={} — all sessions revoked", user.getEmail());

        return new ApiResponse(true, "Password reset successful. Please log in with your new password.", null);
    }

    @Transactional
    public ApiResponse changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Security best practice: revoke all other sessions on password change
        refreshTokenService.deleteAllByUser(user);
        log.info("Password changed for user={} — all sessions revoked", user.getEmail());

        return new ApiResponse(true, "Password changed successfully. Please log in again.", null);
    }

    // ─── Change Password ─────────────────────────────────────────────────────

    @Transactional
    public ApiResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName());
        }
        if (request.getProfileImageUrl() != null) {
            user.setProfileImageUrl(request.getProfileImageUrl());
        }
        userRepository.save(user);

        return new ApiResponse(true, "Profile updated successfully", convertToUserDTO(user));
    }


    // ─── Admin-created user account activation ───────────────────────────────

    /**
     * Activate a user account created by an admin.
     * The user clicks the link in their invitation email, which provides a
     * one-time activation token. They also supply their chosen password.
     *
     * <ul>
     *   <li>Validates and consumes the activation token (single-use, 72h TTL)</li>
     *   <li>Sets the user's password (bcrypt-encoded)</li>
     *   <li>Marks the account as email-verified and enabled</li>
     * </ul>
     */
    @Transactional
    public ApiResponse activateAccount(ActivateAccountRequest request) {
        ActivationToken activationToken = activationTokenService.validateAndConsume(request.getToken());

        User user = userRepository.findByEmail(activationToken.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found for activation token"));

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmailVerified(true);
        user.setEnabled(true);
        userRepository.save(user);

        log.info("Account activated for user={}", user.getEmail());
        return new ApiResponse(true,
                "Account activated successfully. You can now log in.", null);
    }

    // ─── Profile & password helpers ──────────────────────────────────────────

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return convertToUserDTO(user);
    }

    public UserDTO convertToUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .emailVerified(user.isEmailVerified())
                .enabled(user.isEnabled())
                .provider(user.getProvider())
                .profileImageUrl(user.getProfileImageUrl())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toSet()))
                .build();
    }



    public record LoginResult(AuthResponse authResponse, String rawRefreshToken) {
    }
}
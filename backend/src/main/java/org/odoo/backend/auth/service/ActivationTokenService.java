package org.odoo.backend.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.auth.exception.InvalidTokenException;
import org.odoo.backend.auth.model.ActivationToken;
import org.odoo.backend.auth.repository.ActivationTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Manages the lifecycle of {@link ActivationToken} entities used in the
 * admin-creates-user flow.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActivationTokenService {

    private final ActivationTokenRepository activationTokenRepository;

    /** Token validity in hours — defaults to 72. */
    @Value("${activation.token.expiration-hours:72}")
    private long expirationHours;

    // ─── Create ──────────────────────────────────────────────────────────────

    /**
     * Delete any existing unused token for the email and create a fresh one.
     *
     * @param email user's email address
     * @return the persisted {@link ActivationToken}
     */
    @Transactional
    public ActivationToken createToken(String email) {
        // Invalidate any previous token for this email
        activationTokenRepository.deleteByEmail(email);

        ActivationToken token = ActivationToken.builder()
                .email(email)
                .token(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plusHours(expirationHours))
                .build();

        ActivationToken saved = activationTokenRepository.save(token);
        log.debug("Created activation token for email={}", email);
        return saved;
    }

    // ─── Validate & Consume ──────────────────────────────────────────────────

    /**
     * Find, verify and consume the token in a single transaction.
     * Marks it as used so it cannot be replayed.
     *
     * @param tokenValue raw token string from the activation link
     * @return the validated (and now consumed) {@link ActivationToken}
     * @throws InvalidTokenException if unknown, already used, or expired
     */
    @Transactional
    public ActivationToken validateAndConsume(String tokenValue) {
        ActivationToken token = activationTokenRepository
                .findByTokenAndUsedFalse(tokenValue)
                .orElseThrow(() -> new InvalidTokenException(
                        "Activation link is invalid or has already been used."));

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            log.warn("Expired activation token used for email={}", token.getEmail());
            throw new InvalidTokenException(
                    "Activation link has expired. Please ask an admin to resend the invitation.");
        }

        token.setUsed(true);
        activationTokenRepository.save(token);
        log.info("Activation token consumed for email={}", token.getEmail());
        return token;
    }
}

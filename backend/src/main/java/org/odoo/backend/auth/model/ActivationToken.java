package org.odoo.backend.auth.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Short-lived token sent to admin-created users so they can set their password
 * and activate their account without going through the OTP flow.
 */
@Entity
@Table(
        name = "activation_tokens",
        indexes = {
                @Index(name = "idx_activation_token_token", columnList = "token"),
                @Index(name = "idx_activation_token_email", columnList = "email")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The email of the user this token belongs to. */
    @Column(nullable = false)
    private String email;

    /** Cryptographically-random UUID token included in the activation link. */
    @Column(nullable = false, unique = true, length = 512)
    private String token;

    /** When this token expires (default: 72 hours). */
    @Column(nullable = false)
    private LocalDateTime expiryDate;

    /** Marked true after the user successfully activates their account. */
    @Column(nullable = false)
    @Builder.Default
    private boolean used = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false,
            columnDefinition = "datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)")
    private LocalDateTime createdAt;
}

package org.odoo.backend.auth.repository;

import org.odoo.backend.auth.model.ActivationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActivationTokenRepository extends JpaRepository<ActivationToken, Long> {

    Optional<ActivationToken> findByTokenAndUsedFalse(String token);

    void deleteByEmail(String email);
}

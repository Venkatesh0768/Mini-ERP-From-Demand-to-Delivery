package org.odoo.backend.auth.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.odoo.backend.auth.repository.RefreshTokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;


@Slf4j
@Component
@RequiredArgsConstructor
public class TokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;


    @Scheduled(cron = "${app.scheduler.token-cleanup-cron:0 0 3 * * *}")
    @Transactional
    public void purgeExpiredRefreshTokens() {
        LocalDateTime now = LocalDateTime.now();
        int deleted = refreshTokenRepository.deleteAllExpiredBefore(now);
        if (deleted > 0) {
            log.info("Token cleanup: deleted {} expired refresh token(s) at {}", deleted, now);
        } else {
            log.debug("Token cleanup: no expired tokens found at {}", now);
        }
    }
}

package com.example.demo.digest;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "digest", name = "enabled", havingValue = "true")
public class WeeklyDigestScheduler {
    private final WeeklyDigestService digestService;

    public WeeklyDigestScheduler(WeeklyDigestService digestService) {
        this.digestService = digestService;
    }

    /** Defaults to Monday at 09:00 UTC; configure digest.cron and digest.zone per deployment. */
    @Scheduled(cron = "${digest.cron:0 0 9 * * MON}", zone = "${digest.zone:UTC}")
    public void sendDigest() {
        digestService.sendWeeklyDigests();
    }
}

package com.example.demo.digest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@ConditionalOnProperty(prefix = "digest", name = "enabled", havingValue = "true")
public class WeeklyDigestService {
    private static final Logger log = LoggerFactory.getLogger(WeeklyDigestService.class);
    private static final int UPCOMING_DAYS = 7;

    private final DigestRecipientSource recipientSource;
    private final DigestDataSource dataSource;
    private final DigestEmailService emailService;
    private final ZoneId zoneId;

    public WeeklyDigestService(DigestRecipientSource recipientSource,
                               DigestDataSource dataSource,
                               DigestEmailService emailService,
                               org.springframework.beans.factory.annotation.Value("${digest.zone:UTC}") String zone) {
        this.recipientSource = recipientSource;
        this.dataSource = dataSource;
        this.emailService = emailService;
        this.zoneId = ZoneId.of(zone);
    }

    /** Called by the scheduler; isolated failures allow other users to still receive their digest. */
    public void sendWeeklyDigests() {
        LocalDate today = LocalDate.now(zoneId);
        LocalDate through = today.plusDays(UPCOMING_DAYS);
        Instant createdAfter = Instant.now().minus(UPCOMING_DAYS, java.time.temporal.ChronoUnit.DAYS);

        for (DigestRecipient recipient : recipientSource.findDigestRecipients()) {
            try {
                WeeklyDigest digest = buildDigest(recipient, today, through, createdAfter);
                if (!digest.isEmpty()) {
                    emailService.send(digest);
                }
            } catch (RuntimeException exception) {
                log.error("Weekly digest failed for user {}", recipient.userId(), exception);
            }
        }
    }

    WeeklyDigest buildDigest(DigestRecipient recipient, LocalDate from, LocalDate through, Instant createdAfter) {
        return new WeeklyDigest(
                recipient.userId(),
                recipient.email(),
                safe(dataSource.upcomingInterviews(recipient.userId(), from, through)),
                safe(dataSource.applicationDeadlines(recipient.userId(), from, through)),
                safe(dataSource.newCareerEvents(recipient.userId(), createdAfter)),
                safe(dataSource.newMentorRecommendations(recipient.userId(), createdAfter)));
    }

    private List<DigestItem> safe(List<DigestItem> items) {
        return items == null ? List.of() : items;
    }
}

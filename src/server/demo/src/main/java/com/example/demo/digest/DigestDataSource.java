package com.example.demo.digest;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Adapter boundary for the Application Tracker, Events & Resources, and Mentor Matching APIs. */
public interface DigestDataSource {
    List<DigestItem> upcomingInterviews(String userId, LocalDate fromInclusive, LocalDate throughInclusive);

    List<DigestItem> applicationDeadlines(String userId, LocalDate fromInclusive, LocalDate throughInclusive);

    List<DigestItem> newCareerEvents(String userId, Instant createdAfter);

    List<DigestItem> newMentorRecommendations(String userId, Instant createdAfter);
}

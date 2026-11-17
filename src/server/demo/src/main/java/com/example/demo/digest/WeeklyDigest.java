package com.example.demo.digest;

import java.util.List;

/** Aggregated, per-user content for one digest email. */
public record WeeklyDigest(
        String userId,
        String recipientEmail,
        List<DigestItem> upcomingInterviews,
        List<DigestItem> applicationDeadlines,
        List<DigestItem> newCareerEvents,
        List<DigestItem> newMentorRecommendations) {

    public WeeklyDigest {
        upcomingInterviews = List.copyOf(upcomingInterviews);
        applicationDeadlines = List.copyOf(applicationDeadlines);
        newCareerEvents = List.copyOf(newCareerEvents);
        newMentorRecommendations = List.copyOf(newMentorRecommendations);
    }

    public boolean isEmpty() {
        return upcomingInterviews.isEmpty()
                && applicationDeadlines.isEmpty()
                && newCareerEvents.isEmpty()
                && newMentorRecommendations.isEmpty();
    }
}

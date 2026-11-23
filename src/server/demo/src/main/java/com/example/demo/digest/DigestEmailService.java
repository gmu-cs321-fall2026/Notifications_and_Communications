package com.example.demo.digest;

import com.example.demo.email.SendGridEmailSender;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@ConditionalOnProperty(prefix = "digest", name = "enabled", havingValue = "true")
public class DigestEmailService {
    private final SendGridEmailSender emailSender;

    public DigestEmailService(SendGridEmailSender emailSender) {
        this.emailSender = emailSender;
    }

    public void send(WeeklyDigest digest) {
        emailSender.send(
                digest.recipientEmail(),
                "Your weekly CareerLaunch digest",
                renderPlainText(digest),
                renderHtml(digest));
    }

    private String renderPlainText(WeeklyDigest digest) {
        StringBuilder text = new StringBuilder("Your weekly CareerLaunch digest\n\n");
        appendPlainSection(text, "Upcoming interviews", digest.upcomingInterviews());
        appendPlainSection(text, "Application deadlines", digest.applicationDeadlines());
        appendPlainSection(text, "New career events", digest.newCareerEvents());
        appendPlainSection(text, "New mentor recommendations", digest.newMentorRecommendations());
        return text.toString();
    }

    private void appendPlainSection(StringBuilder text, String heading, List<DigestItem> items) {
        text.append(heading).append('\n');
        if (items.isEmpty()) {
            text.append("  No updates this week.\n\n");
            return;
        }
        for (DigestItem item : items) {
            text.append("  - ").append(item.title()).append(": ").append(item.summary());
            if (isSafeHttpUrl(item.url())) text.append(" ( ").append(item.url()).append(" )");
            text.append('\n');
        }
        text.append('\n');
    }

    private String renderHtml(WeeklyDigest digest) {
        StringBuilder html = new StringBuilder("<!doctype html><html><body>")
                .append("<h1>Your weekly CareerLaunch digest</h1>");
        appendHtmlSection(html, "Upcoming interviews", digest.upcomingInterviews());
        appendHtmlSection(html, "Application deadlines", digest.applicationDeadlines());
        appendHtmlSection(html, "New career events", digest.newCareerEvents());
        appendHtmlSection(html, "New mentor recommendations", digest.newMentorRecommendations());
        return html.append("</body></html>").toString();
    }

    private void appendHtmlSection(StringBuilder html, String heading, List<DigestItem> items) {
        html.append("<h2>").append(escape(heading)).append("</h2>");
        if (items.isEmpty()) {
            html.append("<p>No updates this week.</p>");
            return;
        }
        html.append("<ul>");
        for (DigestItem item : items) {
            html.append("<li><strong>").append(escape(item.title())).append("</strong> — ")
                    .append(escape(item.summary()));
            if (isSafeHttpUrl(item.url())) {
                html.append(" <a href=\"").append(escape(item.url())).append("\">View details</a>");
            }
            html.append("</li>");
        }
        html.append("</ul>");
    }

    private boolean isSafeHttpUrl(String value) {
        if (value == null || value.isBlank()) return false;
        try {
            String scheme = java.net.URI.create(value).getScheme();
            return "http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private String escape(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}

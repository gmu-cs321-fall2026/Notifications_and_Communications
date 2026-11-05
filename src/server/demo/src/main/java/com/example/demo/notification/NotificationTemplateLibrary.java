package com.example.demo.notification;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.Collections;

@Component
public class NotificationTemplateLibrary {
    private final Map<String, NotificationTemplate> templates = new HashMap<>();

    public NotificationTemplateLibrary() {
        templates.put("interview", new NotificationTemplate(
            "interview",
            "Your interview with {employer} is in {days} days. {link}",
            Arrays.asList("employer", "days", "link")
        ));

        templates.put("due", new NotificationTemplate(
            "due",
            "Your application with {employer} is due in {days} days. {link}",
            Arrays.asList("employer", "days", "link")
        ));

        templates.put("assessment", new NotificationTemplate(
            "assessment",
            "Your online assessment with {employer} is due in {days} days. Check your email for more information.",
            Arrays.asList("employer", "days")
        ));

        templates.put("registration", new NotificationTemplate(
            "registration",
            "You have successfully registered for {title} on {date} at {time}. {link}",
            Arrays.asList("title", "date", "time", "link")
        ));

        templates.put("event_reminder", new NotificationTemplate(
            "event_reminder",
            "Your {title} is in {days} days at {location}. {link}",
            Arrays.asList("title", "days", "location", "link")
        ));

        templates.put("mentor_request", new NotificationTemplate(
            "mentor_request",
            "{name} has requested a mentorship with you.",
            Arrays.asList("name")
        ));

        templates.put("mentor_status", new NotificationTemplate(
            "mentor_status",
            "{name} has {status} your mentor request.",
            Arrays.asList("name", "status")
        ));

        templates.put("response", new NotificationTemplate(
            "response",
            "{name} responded to your post {title}. {link}",
            Arrays.asList("name", "title", "link")
        ));

        templates.put("flagged", new NotificationTemplate(
            "flagged",
            "{title} has been flagged for {flag}. {link}",
            Arrays.asList("title", "flag", "link")
        ));

        templates.put("practice_request", new NotificationTemplate(
            "practice_request",
            "{name} has requested an interview on {date} at {time}.",
            Arrays.asList("name", "date", "time")
        ));

        templates.put("practice_reminder", new NotificationTemplate(
            "practice_reminder",
            "You have a meeting scheduled with {name} on {date} at {time}.",
            Arrays.asList("name", "date", "time")
        ));

        templates.put("feedback", new NotificationTemplate(
            "feedback",
            "{name} has sent you feedback.",
            Arrays.asList("name")
        ));
    }

    public NotificationTemplate getTemplate(String templateId) {
        NotificationTemplate template = templates.get(templateId);
        if (template == null) {
            throw new IllegalArgumentException("Unknown notification template: " + templateId);
        }
        return template;
    }

    public Map<String, NotificationTemplate> getAllTemplates() {
        return Collections.unmodifiableMap(templates);
    }
}

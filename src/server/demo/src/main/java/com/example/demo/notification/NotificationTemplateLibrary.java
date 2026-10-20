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
            "Your interview with {employer} is in {days} days. {Link}",
            Arrays.asList("employer", "days", "Link")
        ));

        templates.put("due", new NotificationTemplate(
            "due",
            "Your application with {employer} is due in {days} days. {Link}",
            Arrays.asList("employer", "days", "Link")
        ));

        templates.put("assessment", new NotificationTemplate(
            "assesment",
            "Your online assessment with {employer} is due in {days} days. Check your email for more information.",
            Arrays.asList("employer", "days")
        ));

        templates.put("registration", new NotificationTemplate(
            "registration",
            "You have successfully registered for {title} at {time, date}. {Link}",
            Arrays.asList("title", "time, date", "Link")
        ));

        templates.put("event_reminder", new NotificationTemplate(
            "event_reminder",
            "Your {title} is in {days} days at {location}. {Link}",
            Arrays.asList("title", "date","location", "Link")
        ));

        templates.put("mentor_request", new NotificationTemplate(
            "mentor_request",
            "{Name} has requested a mentorship with you.",
            Arrays.asList("name")
        ));

        templates.put("mentor_status", new NotificationTemplate(
            "mentor_status",
            "{Name} has {status} your mentor request.",
            Arrays.asList("name", "status")
        ));

        templates.put("response", new NotificationTemplate(
            "response",
            "{Name} responded to your post {title}. {Link}",
            Arrays.asList("name", "title", "Link")
        ));

        templates.put("flagged", new NotificationTemplate(
            "flagged",
            "{Title} has been flagged for {flag}. {Link}",
            Arrays.asList("Title", "name", "Link")
        ));
        
        templates.put("practice_request", new NotificationTemplate(
            "practice_request",
            "{name} has requested an interview at {date, time}",
            Arrays.asList("name", "date, time")
        ));

        templates.put("practice_reminder", new NotificationTemplate(
            "practice_reminder",
            "You have a meeting scheduled with {name} at {date, time}",
            Arrays.asList("name", "date, time")
        ));

        templates.put("feedback", new NotificationTemplate(
            "feedback",
            "{Name} has sent you feedback.",
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

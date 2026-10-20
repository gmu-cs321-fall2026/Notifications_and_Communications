package com.example.demo.notification;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.Collections;

@Component 
public class NotificationTemplateRegistry {
    private final Map<String, NotificationTemplate> templates = new HashMap<>();

    public NotificationTemplateRegistry() {
        templates.put("interview", new NotificationTemplate(
            "interview",
            "Your interview with {employer} is in {days} days. [Link to application]",
            Arrays.asList("employer", "days")
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

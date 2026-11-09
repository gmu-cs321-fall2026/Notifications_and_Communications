package com.example.demo.notification;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private static final Pattern PLACEHOLDER = Pattern.compile("\\{([^{}]+)}");

    private final NotificationTemplateLibrary templateLibrary;

    public NotificationService(NotificationTemplateLibrary templateLibrary) {
        this.templateLibrary = templateLibrary;
    }

    /** Resolves a template by id and replaces its placeholders with supplied values. */
    public String resolveTemplate(String templateId, Map<String, String> params) {
        if (templateId == null || templateId.isBlank()) {
            throw new IllegalArgumentException("templateId must not be empty");
        }
        if (params == null) {
            throw new IllegalArgumentException("params must not be null");
        }

        NotificationTemplate template = templateLibrary.getTemplate(templateId);
        for (String requiredParam : template.getRequiredParams()) {
            if (findValue(params, requiredParam) == null) {
                throw new IllegalArgumentException(
                    "Missing required template parameter: " + requiredParam
                );
            }
        }

        Matcher matcher = PLACEHOLDER.matcher(template.getText());
        StringBuffer result = new StringBuffer();
        while (matcher.find()) {
            String parameterName = matcher.group(1).trim();
            String value = findValue(params, parameterName);
            if (value == null) {
                throw new IllegalArgumentException(
                    "Missing required template parameter: " + parameterName
                );
            }
            matcher.appendReplacement(result, Matcher.quoteReplacement(value));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    public NotificationPayload createFromTemplate(TemplateNotificationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        NotificationTemplate template = templateLibrary.getTemplate(request.templateId());
        String message = resolveTemplate(request.templateId(), request.params());
        String title = request.title();
        if (title == null || title.isBlank()) {
            title = toDisplayTitle(template.getId());
        }

        return new NotificationPayload(
            UUID.randomUUID().toString(),
            title.trim(),
            message,
            Instant.now().toString(),
            false
        );
    }

    private String findValue(Map<String, String> params, String name) {
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (entry.getKey() != null
                && entry.getKey().trim().equalsIgnoreCase(name.trim())) {
                return entry.getValue();
            }
        }
        return null;
    }

    private String toDisplayTitle(String templateId) {
        String title = templateId.replace('_', ' ').replace('-', ' ');
        return Character.toUpperCase(title.charAt(0)) + title.substring(1);
    }
}

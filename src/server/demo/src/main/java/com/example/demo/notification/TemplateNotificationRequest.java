package com.example.demo.notification;

import java.util.Map;

/** Request body for creating a notification using a registered template. */
public record TemplateNotificationRequest(
    String templateId,
    Map<String, String> params,
    String title
) {
}

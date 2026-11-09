package com.example.demo.notification;

/** Response shape compatible with the existing notification JSON fields. */
public record NotificationPayload(
    String id,
    String title,
    String message,
    String createdAt,
    boolean read
) {
}

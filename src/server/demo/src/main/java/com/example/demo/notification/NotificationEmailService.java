package com.example.demo.notification;

import com.example.demo.email.SendGridEmailSender;
import org.springframework.stereotype.Service;

/** Sends individual notification messages through the configured email provider. */
@Service
public class NotificationEmailService {
    private final SendGridEmailSender emailSender;

    public NotificationEmailService(SendGridEmailSender emailSender) {
        this.emailSender = emailSender;
    }

    public void send(String recipientEmail, NotificationPayload notification) {
        if (notification == null) {
            throw new IllegalArgumentException("Notification must not be null");
        }
        String title = notification.title() == null || notification.title().isBlank()
                ? "CareerLaunch notification"
                : notification.title();
        String message = notification.message() == null ? "" : notification.message();
        String escapedTitle = escape(title);
        String escapedMessage = escape(message).replace("\n", "<br>");
        emailSender.send(
                recipientEmail,
                title,
                title + "\n\n" + message,
                "<!doctype html><html><body><h1>" + escapedTitle
                        + "</h1><p>" + escapedMessage + "</p></body></html>");
    }

    private String escape(String value) {
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}

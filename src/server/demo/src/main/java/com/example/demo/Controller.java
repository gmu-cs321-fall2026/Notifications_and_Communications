package com.example.demo;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.example.demo.notification.NotificationPayload;
import com.example.demo.notification.NotificationService;
import com.example.demo.notification.TemplateNotificationRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Notification endpoints. The existing GET payload is preserved for current
 * clients; template-based creation is available through POST /template.
 */
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/notifications")
public class Controller {
    private final NotificationService notificationService;

    public Controller(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** Preserves the existing GET /api/notifications response shape and sample data. */
    @GetMapping
    public List<Map<String, Object>> getNotifications() {
        return List.of(
            Map.of(
                "id", "1",
                "title", "Welcome notification",
                "message", "This is a mock notification from the backend.",
                "createdAt", Instant.now().toString(),
                "pinned", false,
                "read", false
            ),
            Map.of(
                "id", "2",
                "title", "Project update",
                "message", "Your notification API is working!",
                "createdAt", Instant.now().toString(),
                "pinned", true,
                "read", false
            ),
            Map.of(
                "id", "3",
                "title", "Test notification",
                "message", "This notification has already been read.",
                "createdAt", Instant.now().toString(),
                "pinned", false,
                "read", true
            )
        );
    }

    /** Creates a notification from a template without changing the existing GET API. */
    @PostMapping("/template")
    public ResponseEntity<?> createFromTemplate(@RequestBody TemplateNotificationRequest request) {
        try {
            NotificationPayload payload = notificationService.createFromTemplate(request);
            return ResponseEntity.ok(payload);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", exception.getMessage()));
        }
    }
}

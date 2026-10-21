
package com.example.demo;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class Controller {

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
}

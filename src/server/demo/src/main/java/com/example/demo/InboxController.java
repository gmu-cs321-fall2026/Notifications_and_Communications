package com.example.demo;

import com.example.demo.java.Inbox;
import com.example.demo.java.Notification;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/inbox")
public class InboxController {

    private final Inbox inbox;

    public InboxController() {
        this.inbox = new Inbox("My Inbox");
    }

    // Hello World endpoint for testing
    @GetMapping("/hello")
    public String HelloWorld() {
        return "Hello, World";
    }

    // Get inbox information
    @GetMapping
    public ResponseEntity<Map<String, Object>> getInbox() {
        return ResponseEntity.ok(Map.of(
                "id", inbox.getId(),
                "name", inbox.getName(),
                "size", inbox.size(),
                "unreadCount", inbox.unreadCount(),
                "notifications", inbox.getAll()
        ));
    }

    // Add a notification
    @PostMapping("/notifications")
    public ResponseEntity<Notification> addNotification(
            @RequestBody NotificationRequest request) {

        Notification notification =
                inbox.add(request.title(), request.message());

        return ResponseEntity.ok(notification);
    }

    // Get all notifications
    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getAll() {
        return ResponseEntity.ok(inbox.getAll());
    }

    // Get pinned notifications
    @GetMapping("/notifications/pinned")
    public ResponseEntity<List<Notification>> getPinned() {
        return ResponseEntity.ok(inbox.getPinned());
    }

    // Get notification by ID
    @GetMapping("/notifications/{id}")
    public ResponseEntity<Notification> getNotification(
            @PathVariable String id) {

        return inbox.get(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Remove notification
    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<Boolean> removeNotification(
            @PathVariable String id) {

        boolean removed = inbox.remove(id);

        return removed
                ? ResponseEntity.ok(true)
                : ResponseEntity.notFound().build();
    }

    // Pin notification
    @PutMapping("/notifications/{id}/pin")
    public ResponseEntity<Boolean> pinNotification(
            @PathVariable String id) {

        boolean pinned = inbox.pin(id);

        return pinned
                ? ResponseEntity.ok(true)
                : ResponseEntity.notFound().build();
    }

    // Unpin notification
    @PutMapping("/notifications/{id}/unpin")
    public ResponseEntity<Boolean> unpinNotification(
            @PathVariable String id) {

        boolean unpinned = inbox.unpin(id);

        return unpinned
                ? ResponseEntity.ok(true)
                : ResponseEntity.notFound().build();
    }

    // Move notification to front
    @PutMapping("/notifications/{id}/move-to-front")
    public ResponseEntity<Boolean> moveToFront(
            @PathVariable String id) {

        boolean moved = inbox.moveToFront(id);

        return moved
                ? ResponseEntity.ok(true)
                : ResponseEntity.notFound().build();
    }

    // Mark notification as read/unread
    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Boolean> markRead(
            @PathVariable String id,
            @RequestParam boolean read) {

        boolean updated = inbox.markRead(id, read);

        return updated
                ? ResponseEntity.ok(true)
                : ResponseEntity.notFound().build();
    }

    // Get inbox size
    @GetMapping("/size")
    public ResponseEntity<Integer> getSize() {
        return ResponseEntity.ok(inbox.size());
    }

    // Get unread count
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(inbox.unreadCount());
    }

    // Rename inbox
    @PutMapping("/rename")
    public ResponseEntity<String> renameInbox(
            @RequestBody RenameRequest request) {

        inbox.rename(request.name());

        return ResponseEntity.ok(inbox.getName());
    }

    // Clear inbox
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearInbox() {
        inbox.clear();

        return ResponseEntity.noContent().build();
    }

    // Get inbox ID
    @GetMapping("/id")
    public ResponseEntity<String> getInboxId() {
        return ResponseEntity.ok(inbox.getId());
    }

    // Get inbox name
    @GetMapping("/name")
    public ResponseEntity<String> getInboxName() {
        return ResponseEntity.ok(inbox.getName());
    }

    // Get inbox string representation
    @GetMapping("/info")
    public ResponseEntity<String> getInboxInfo() {
        return ResponseEntity.ok(inbox.toString());
    }

    // Populate inbox with example notifications
    @PostMapping("/seed")
    public ResponseEntity<List<Notification>> seedInbox() {

        if (inbox.size() > 0) {
            return ResponseEntity.badRequest().build();
        }

        Notification n1 = inbox.add(
                "Welcome!",
                "Welcome to your notification inbox."
        );

        Notification n2 = inbox.add(
                "New Message",
                "You have received a new message."
        );

        Notification n3 = inbox.add(
                "System Update",
                "The system has been successfully updated."
        );

        Notification n4 = inbox.add(
                "Important Announcement",
                "Please review the latest announcement."
        );

        // Demonstrate pinning and read status
        inbox.pin(n4.getId());
        inbox.markRead(n2.getId(), true);

        return ResponseEntity.ok(inbox.getAll());
    }

    // Request DTOs
    public record NotificationRequest(
            String title,
            String message
    ) {}

    public record RenameRequest(
            String name
    ) {}
}

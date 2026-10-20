import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * A single notification. Identity is the generated id; title and message are
 * immutable, while pinned/read state is managed through the Inbox.
 */
public class Notification {

    private final String id;
    private final String title;
    private final String message;
    private final Instant createdAt;
    private boolean pinned;
    private boolean read;

    public Notification(String title, String message) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("title must not be empty");
        }
        this.id = UUID.randomUUID().toString();
        this.title = title;
        this.message = message == null ? "" : message;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public Instant getCreatedAt() { return createdAt; }
    public boolean isPinned() { return pinned; }
    public boolean isRead() { return read; }

    // Package-private: only the Inbox changes state, so ordering stays consistent.
    void setPinned(boolean pinned) { this.pinned = pinned; }
    void setRead(boolean read) { this.read = read; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Notification)) return false;
        return id.equals(((Notification) o).id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "Notification{id=" + id + ", title='" + title + "', pinned=" + pinned
                + ", read=" + read + ", createdAt=" + createdAt + "}";
    }
}
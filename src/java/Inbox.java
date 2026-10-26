import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Holds notifications in display order:
 *   1. pinned notifications (most recently pinned first)
 *   2. unpinned notifications (newest / most recently bumped first)
 *
 * Methods are synchronized so the structure is safe to share behind an API.
 */
public class Inbox {
    private final List<Notification> pinned = new ArrayList<>();
    private final List<Notification> unpinned = new ArrayList<>();
    private final String id;   
    private String name;      

    public Inbox() {
        this("Inbox");
    }

    public Inbox(String name) {
        this.id = UUID.randomUUID().toString();
        this.name = validateName(name);
    }

    /** Adds a new notification to the front of the unpinned section. */
    public synchronized Notification add(Notification notification) {
        if (notification == null) {
            throw new IllegalArgumentException("notification must not be null");
        }
        if (contains(notification.getId())) {
            throw new IllegalStateException("notification already in inbox: " + notification.getId());
        } 
        notification.setPinned(false);
        unpinned.add(0, notification);
        return notification;
    }

    /** Convenience overload for API callers. */
    public synchronized Notification add(String title, String message) {
        return add(new Notification(title, message));
    }

    /** Removes a notification. Returns true if it existed. */
    public synchronized boolean remove(String id) {
        return pinned.removeIf(n -> n.getId().equals(id))
                || unpinned.removeIf(n -> n.getId().equals(id));
    }

    /** Pins a notification and moves it to the very front of the inbox. */
    public synchronized boolean pin(String id) {
        Notification n = detach(id);
        if (n == null) return false;
        n.setPinned(true);
        pinned.add(0, n);
        return true;
    }

    /** Unpins a notification; it goes to the front of the unpinned section. */
    public synchronized boolean unpin(String id) {
        Notification n = find(pinned, id);
        if (n == null) return false;
        pinned.remove(n);
        n.setPinned(false);
        unpinned.add(0, n);
        return true;
    }

    /**
     * Pushes a notification to the front of its own section without changing
     * its pinned state (e.g. a pinned item moves to the top of the pinned group).
     */
    public synchronized boolean moveToFront(String id) {
        List<Notification> section = find(pinned, id) != null ? pinned : unpinned;
        Notification n = find(section, id);
        if (n == null) return false;
        section.remove(n);
        section.add(0, n);
        return true;
    }

    public synchronized boolean markRead(String id, boolean read) {
        Optional<Notification> n = get(id);
        n.ifPresent(x -> x.setRead(read));
        return n.isPresent();
    }

    public synchronized Optional<Notification> get(String id) {
        Notification n = find(pinned, id);
        return Optional.ofNullable(n != null ? n : find(unpinned, id));
    }

    /** Snapshot of all notifications in display order (pinned first). */
    public synchronized List<Notification> getAll() {
        List<Notification> all = new ArrayList<>(pinned.size() + unpinned.size());
        all.addAll(pinned);
        all.addAll(unpinned);
        return Collections.unmodifiableList(all);
    }

    public synchronized List<Notification> getPinned() {
        return Collections.unmodifiableList(new ArrayList<>(pinned));
    }

    public synchronized int size() { return pinned.size() + unpinned.size(); }

    public synchronized long unreadCount() {
        return getAll().stream().filter(n -> !n.isRead()).count();
    }

    public synchronized void clear() {
        pinned.clear();
        unpinned.clear();
    }

    public String getId() { return id; }

    public synchronized String getName() { return name; }

    public synchronized void rename(String newName) {
        this.name = validateName(newName);
    }

    // --- helpers ---

    private boolean contains(String id) {
        return find(pinned, id) != null || find(unpinned, id) != null;
    }

    private Notification detach(String id) {
        Notification n = find(pinned, id);
        if (n != null) { pinned.remove(n); return n; }
        n = find(unpinned, id);
        if (n != null) { unpinned.remove(n); return n; }
        return null;
    }

    private static Notification find(List<Notification> list, String id) {
        for (Notification n : list) {
            if (n.getId().equals(id)) return n;
        }
        return null;
    }

    private static String validateName(String name) {
    if (name == null || name.isBlank()) {
        throw new IllegalArgumentException("inbox name must not be empty");
    }
    return name.trim();
    }

    @Override
    public synchronized String toString() {
        return "Inbox{id=" + id + ", name='" + name + "', size=" + size() + "}";
    }
}
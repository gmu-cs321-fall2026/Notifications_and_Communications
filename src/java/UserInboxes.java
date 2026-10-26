import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * All inboxes belonging to one user, looked up by inbox id.
 *
 * Inboxes are kept in creation order so the frontend can list them
 * consistently. This class only locks while inboxes are created, removed or
 * listed; each Inbox keeps its own lock for notification work, so activity in
 * one inbox does not block another.
 */
public class UserInboxes {

    private final String userId;
    private final Map<String, Inbox> inboxes = new LinkedHashMap<>();

    public UserInboxes(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId must not be empty");
        }
        this.userId = userId;
    }

    public String getUserId() { return userId; }

    /** Creates a new, empty inbox with the given name and returns it. */
    public synchronized Inbox createInbox(String name) {
        Inbox inbox = new Inbox(name);
        inboxes.put(inbox.getId(), inbox);
        return inbox;
    }

    /** Looks up an inbox by id. Empty if this user has no such inbox. */
    public synchronized Optional<Inbox> getInbox(String inboxId) {
        return Optional.ofNullable(inboxes.get(inboxId));
    }

    /** Deletes an inbox and all its notifications. Returns true if it existed. */
    public synchronized boolean removeInbox(String inboxId) {
        return inboxes.remove(inboxId) != null;
    }

    /** Renames an inbox. Returns false if this user has no such inbox. */
    public synchronized boolean renameInbox(String inboxId, String newName) {
        Inbox inbox = inboxes.get(inboxId);
        if (inbox == null) return false;
        inbox.rename(newName);
        return true;
    }

    /** Read-only snapshot of this user's inboxes, in creation order. */
    public synchronized List<Inbox> listInboxes() {
        return Collections.unmodifiableList(new ArrayList<>(inboxes.values()));
    }

    public synchronized int inboxCount() { return inboxes.size(); }

    /** Unread notifications across all of this user's inboxes. */
    public long totalUnread() {
        long total = 0;
        for (Inbox inbox : listInboxes()) {
            total += inbox.unreadCount();
        }
        return total;
    }

    @Override
    public synchronized String toString() {
        return "UserInboxes{userId=" + userId + ", inboxes=" + inboxes.size() + "}";
    }
}
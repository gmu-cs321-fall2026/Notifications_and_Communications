# Notifications and Communications

Subsystem 6 of Mason CareerLaunch, developed by Team 1. This project provides an in-app notification inbox prototype: notifications can be added, listed, pinned, marked read or unread, and removed. It matters because users need a place to find and organize updates. The architecture decision record describes an event-driven approach for notifying users when other subsystems trigger events.

> **Current scope:** The repository contains an in-memory Spring Boot inbox API, a browser-based inbox mockup, and notification templates and channel types. It does not currently implement email delivery or connect the template library to the inbox API.

## What’s included

- **Inbox API:** A Spring Boot REST controller exposes operations for a single in-memory inbox.
- **Notification model:** Notifications have generated IDs, titles, messages, creation timestamps, and read/pinned state. Pinned notifications appear before unpinned notifications.
- **Inbox UI mockup:** A George Mason–branded HTML page displays sample messages and implements some selection controls.
- **Templates and channels:** Java classes define notification templates and the `EMAIL` and `IN_APP` channel values.
- **Architecture note:** `docs/architecture/ADR.txt` records the team’s decision to use an event-driven architecture as the subsystem’s foundation.

## Technology

- **Languages:** Java, HTML, CSS, and JavaScript
- **Backend:** Java 17 configuration, Spring Boot, and Maven
- **Frontend:** HTML/CSS and jQuery with Bootstrap 3.1.1

## Repository layout

```text
docs/
  architecture/ADR.txt       Event-driven architecture decision
src/
  index.html                 Inbox interface mockup
  components/inbox.css       George Mason–styled inbox appearance
  js/inbox.js                UI behavior and notification request
  server/demo/
    pom.xml                  Spring Boot Maven project
    src/main/java/            API controller, inbox models, templates
    src/test/java/             Spring application context test
```

## Run the backend

You’ll need Java 17 or later. From the repository root:

```bash
cd src/server/demo
./mvnw spring-boot:run
```

On Windows, use `mvnw.cmd spring-boot:run`. The application listens on port `8080` by default.

To build and run the test suite:

```bash
./mvnw verify
```

The CI workflow runs Maven verification with Java 21.

## Use the inbox API

The controller creates one in-memory inbox named `My Inbox`. Its data is reset when the application restarts. For example, seed it with sample notifications and list them:

```bash
curl -X POST http://localhost:8080/api/inbox/seed
curl http://localhost:8080/api/inbox/notifications
```

For all routes and request details, see [API reference](#api-reference).

## Preview the inbox page

From the repository root, serve the static frontend:

```bash
python3 -m http.server 5500 --directory src
```

Then open [http://localhost:5500](http://localhost:5500). The page uses external Bootstrap, jQuery, and Google Fonts resources.

The page currently displays sample inbox content. Its JavaScript requests `http://localhost:8080/api/notifications`, while the backend controller exposes notifications at `/api/inbox/notifications`; therefore, the frontend request does not match the implemented API route. The page’s selection controls should not be taken as evidence that all displayed actions are connected to backend behavior.

## Docker

The backend includes a Dockerfile and Compose configuration. From `src/server/demo`:

```bash
docker compose up --build
```

Compose maps port `8080` on your machine to the application’s port `8080` in the container.

## API reference

All routes below are relative to `/api/inbox` and are implemented by `InboxController`.

| Method | Path | Purpose | Request / response |
| --- | --- | --- | --- |
| `GET` | `/hello` | Simple test endpoint | Returns `Hello, World` as plain text. |
| `GET` | `/` | Get inbox summary | Returns `id`, `name`, `size`, `unreadCount`, and `notifications`. |
| `PUT` | `/rename` | Rename the inbox | JSON body: `{"name":"New Inbox Name"}`; returns the new name. |
| `DELETE` | `/clear` | Remove all notifications | Returns `204 No Content`. |
| `GET` | `/id` | Get inbox ID | Returns the ID string. |
| `GET` | `/name` | Get inbox name | Returns the name string. |
| `GET` | `/info` | Get a string summary | Returns the `Inbox.toString()` representation. |
| `GET` | `/size` | Count notifications | Returns an integer. |
| `GET` | `/unread-count` | Count unread notifications | Returns a number. |
| `POST` | `/notifications` | Add a notification | JSON body: `{"title":"Your title","message":"Your message"}`; returns the created notification. |
| `GET` | `/notifications` | List notifications | Returns all notifications in display order. |
| `GET` | `/notifications/pinned` | List pinned notifications | Returns pinned notifications only. |
| `GET` | `/notifications/{id}` | Get a notification | Returns the notification, or `404` if not found. |
| `DELETE` | `/notifications/{id}` | Remove a notification | Returns `true`, or `404` if not found. |
| `PUT` | `/notifications/{id}/pin` | Pin a notification | Returns `true`, or `404` if not found. |
| `PUT` | `/notifications/{id}/unpin` | Unpin a notification | Returns `true`, or `404` if not found. |
| `PUT` | `/notifications/{id}/move-to-front` | Move to the front of its current pinned/unpinned section | Returns `true`, or `404` if not found. |
| `PUT` | `/notifications/{id}/read?read=true` | Set read state | Use `read=true` or `read=false`; returns `true`, or `404` if not found. |
| `POST` | `/seed` | Add example notifications | Only succeeds when the inbox is empty; creates four examples, pins one, marks one read, and returns the list. Returns `400` if the inbox is not empty. |

A notification response includes its generated `id`, `title`, `message`, `createdAt`, `pinned`, and `read` fields.

## Current limitations

- Inbox data is held in memory; no database or durable storage is configured.
- The API controller manages a single inbox rather than per-user inboxes.
- The browser mockup and API route are not currently aligned.
- Although the repository includes notification templates, channel values, and an event-driven architecture decision, it does not contain an email-sending implementation or an event-processing flow.

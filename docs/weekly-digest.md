# Weekly digest implementation

The digest pipeline is under `com.example.demo.digest`. It aggregates upcoming interviews and application deadlines, plus newly-created career events and mentor recommendations, then sends one email per opted-in recipient when there is content.

## Required integration work

This repository does not contain the other subsystems' API contracts or a durable user/preferences store. Implement Spring beans for `DigestDataSource` and `DigestRecipientSource` before enabling the scheduler:

- `DigestDataSource` should call Application & Readiness Tracker for interviews/deadlines, Events & Resources for new events, and Mentor Matching for new recommendations. Scope every query to the supplied user ID and date/cursor window.
- `DigestRecipientSource` should return only users who opted in and have a deliverable email address.
- Use authenticated service-to-service calls and keep credentials in environment variables or a secret manager. Do not return records belonging to another user.

## Configuration

The scheduler is disabled unless `DIGEST_ENABLED=true`. Example environment settings:

```text
DIGEST_ENABLED=true
DIGEST_CRON=0 0 9 * * MON
DIGEST_ZONE=America/New_York
DIGEST_FROM=careerlaunch@example.edu
SPRING_MAIL_HOST=smtp.example.edu
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=...
SPRING_MAIL_PASSWORD=...
SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH=true
SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE=true
```

Configure the SMTP provider's TLS/auth settings as appropriate. Do not enable the job until both source adapters and mail configuration are in place. The sender includes a plain-text alternative and only emits links with `http` or `https` schemes.

## Production follow-ups

Persist a per-user delivery cursor/success record and make processing idempotent before deploying multiple application instances. The current service uses a rolling seven-day window, catches per-user failures, and skips empty digests; it does not yet provide durable retry tracking or a distributed scheduler lock.

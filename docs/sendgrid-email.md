# SendGrid email delivery

The backend uses SendGrid's HTTPS API for weekly digests and individual notification emails.

## Configuration

Set these environment variables; never commit the API key:

```text
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=verified-sender@example.com
SENDGRID_FROM_NAME=CareerLaunch
```

`SENDGRID_FROM_EMAIL` must be a verified sender in SendGrid. The free tier has provider limits, so the application sends one request per recipient and skips empty weekly digests.

## Usage

Weekly digests are scheduled for Monday at 09:00 UTC when `digest.enabled=true`. Override the schedule with `digest.cron` and `digest.zone`.

Individual notifications can be sent with `NotificationEmailService.send(recipientEmail, notification)`. Credentials are read only from environment-backed Spring properties.

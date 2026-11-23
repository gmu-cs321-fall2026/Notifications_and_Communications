package com.example.demo.email;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** Sends application email through SendGrid's HTTPS API. */
@Service
public class SendGridEmailSender {
    private final String apiKey;
    private final String fromAddress;
    private final String fromName;

    public SendGridEmailSender(
            @Value("${SENDGRID_API_KEY:}") String apiKey,
            @Value("${SENDGRID_FROM_EMAIL:}") String fromAddress,
            @Value("${SENDGRID_FROM_NAME:CareerLaunch}") String fromName) {
        this.apiKey = apiKey;
        this.fromAddress = fromAddress;
        this.fromName = fromName;
    }

    public void send(String to, String subject, String plainText, String html) {
        requireConfiguration(to);

        Mail mail = new Mail(
                new Email(fromAddress, fromName),
                subject,
                new Email(to),
                new Content("text/plain", plainText));
        mail.addContent(new Content("text/html", html));

        try {
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = new SendGrid(apiKey).api(request);
            if (response.getStatusCode() < 200 || response.getStatusCode() >= 300) {
                throw new IllegalStateException(
                        "SendGrid rejected email with HTTP status " + response.getStatusCode());
            }
        } catch (Exception exception) {
            if (exception instanceof IllegalStateException illegalStateException) {
                throw illegalStateException;
            }
            throw new IllegalStateException("Could not send email through SendGrid", exception);
        }
    }

    private void requireConfiguration(String to) {
        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("Recipient email must not be empty");
        }
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("SENDGRID_API_KEY is not configured");
        }
        if (fromAddress == null || fromAddress.isBlank()) {
            throw new IllegalStateException("SENDGRID_FROM_EMAIL is not configured");
        }
    }
}

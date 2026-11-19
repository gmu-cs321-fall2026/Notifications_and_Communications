package com.example.demo.digest;

import java.util.List;

/** Connect this interface to Shared Core/user preferences and return opted-in users only. */
public interface DigestRecipientSource {
    List<DigestRecipient> findDigestRecipients();
}

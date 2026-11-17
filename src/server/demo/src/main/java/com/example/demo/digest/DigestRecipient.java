package com.example.demo.digest;

/** A user who has opted in to weekly digest email. */
public record DigestRecipient(String userId, String email) {
}

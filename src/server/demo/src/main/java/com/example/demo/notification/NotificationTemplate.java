package com.example.demo.notification;
import java.util.List;
import java.util.ArrayList;

public class NotificationTemplate {
    private final String id;
    private final String text;
    private final List<String> requiredParams;

    public NotificationTemplate(String id, String text, List<String> requiredParams) {
        this.id = id;
        this.text = text;
        this.requiredParams = requiredParams == null ? new ArrayList<>() : requiredParams;
    }

    public String getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public List<String> getRequiredParams() {
        return requiredParams;
    }
}

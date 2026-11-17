package com.example.demo.java;

public class NotificationPref {
    private boolean inApp;
    private boolean email;
    private boolean application;
    private boolean mentor;
    private boolean events;
    private boolean core;
    private boolean interview;

    public NotificationPref() {
        this.inApp = true;
        this.email = true;
        this.application = true;
        this.mentor = true;
        this.events = true;
        this.core = true;
        this.interview = true;
    }
    public NotificationPref(boolean inApp, boolean email, boolean application, boolean mentor, boolean events, boolean core, boolean interview) {
        this.inApp = inApp;
        this.email = email;
        this.application = application;
        this.mentor = mentor;
        this.events = events;
        this.core = core;
        this.interview = interview;
    }

    public boolean isInApp() {
        return inApp;
    }
    public void setInApp(boolean inApp) {
        this.inApp = inApp;
    }

    public boolean isEmail() {
        return email;
    }
    public void setEmail(boolean email) {
        this.email = email;
    }

    public boolean isApplication() {
        return application;
    }
    public void setApplication(boolean application) {
        this.application = application;
    }

    public boolean isMentor() {
        return mentor;
    }
    public void setMentor(boolean mentor) {
        this.mentor = mentor;
    }

    public boolean isEvents() {
        return events;
    }
    public void setEvents(boolean events) {
        this.events = events;
    }

    public boolean isCore() {
        return core;
    }
    public void setCore(boolean core) {
        this.core = core;
    }

    public boolean isInterview() {
        return interview;
    }
    public void setInterview(boolean interview) {
        this.interview = interview;
    }

}

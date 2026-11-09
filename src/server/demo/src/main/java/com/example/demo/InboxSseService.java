package com.example.demo;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class InboxSseService {

    private final List<SseEmitter> emitters =
            new CopyOnWriteArrayList<>();

    // Subscribe a new client
    public SseEmitter subscribe() {

        SseEmitter emitter = new SseEmitter(0L);

        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));

        emitter.onTimeout(() -> emitters.remove(emitter));

        emitter.onError(error -> emitters.remove(emitter));

        // Tell the client it connected successfully
        try {
            emitter.send(
                SseEmitter.event()
                    .name("connected")
                    .data("Connected to inbox stream")
            );
        } catch (IOException e) {
            emitters.remove(emitter);
            emitter.completeWithError(e);
        }

        return emitter;
    }

    // Broadcast an event to all connected clients
    public void broadcast(String eventName, Object data) {

        for (SseEmitter emitter : emitters) {

            try {
                emitter.send(
                    SseEmitter.event()
                        .name(eventName)
                        .data(data)
                );

            } catch (IOException e) {
                emitters.remove(emitter);
                emitter.completeWithError(e);
            }
        }
    }

    // Send heartbeat to keep connections alive
    public void heartbeat() {

        for (SseEmitter emitter : emitters) {

            try {
                emitter.send(
                    SseEmitter.event()
                        .comment("heartbeat")
                );

            } catch (IOException e) {
                emitters.remove(emitter);
                emitter.completeWithError(e);
            }
        }
    }
    
    @Scheduled(fixedRate = 30000)
    public void scheduledHeartbeat() {
        heartbeat();
    }
}
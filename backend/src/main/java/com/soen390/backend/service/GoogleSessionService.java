package com.soen390.backend.service;

import com.soen390.backend.object.GoogleTokenSession;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GoogleSessionService {
  private final ConcurrentHashMap<String, GoogleTokenSession> sessions = new ConcurrentHashMap<>();

  public void put(String sessionId, GoogleTokenSession session) {
    sessions.put(sessionId, session);
  }

  public Optional<GoogleTokenSession> get(String sessionId) {
    return Optional.ofNullable(sessions.get(sessionId));
  }

  public void remove(String sessionId) {
    if (sessionId == null || sessionId.isBlank()) {
      return;
    }
    sessions.remove(sessionId);
  }

  public GoogleTokenSession require(String sessionId) {
    if (sessionId == null || sessionId.isBlank()) {
        throw new RuntimeException("Missing sessionId.");
    }

    GoogleTokenSession session = sessions.get(sessionId);
    if (session == null) {
        throw new RuntimeException("Invalid sessionId (no stored Google session).");
    }

    return session;
  }

}

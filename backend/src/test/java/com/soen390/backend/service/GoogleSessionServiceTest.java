package com.soen390.backend.service;

import com.soen390.backend.object.GoogleTokenSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

public class GoogleSessionServiceTest {

    private GoogleSessionService sessionService;

    @BeforeEach
    void setUp() {
        sessionService = new GoogleSessionService();
    }

    @Test
    void testPutAndGetSession() {
        String sessionId = "test-session-id";
        Instant expiresAt = Instant.now().plusSeconds(3600);
        GoogleTokenSession session = new GoogleTokenSession("access-token", "refresh-token", expiresAt);

        sessionService.put(sessionId, session);
        Optional<GoogleTokenSession> retrieved = sessionService.get(sessionId);

        assertTrue(retrieved.isPresent());
        assertEquals("access-token", retrieved.get().getAccessToken());
        assertEquals("refresh-token", retrieved.get().getRefreshToken());
        assertEquals(expiresAt, retrieved.get().getExpiresAt());
    }

    @Test
    void testGetNonExistentSession() {
        Optional<GoogleTokenSession> retrieved = sessionService.get("non-existent-session");

        assertTrue(retrieved.isEmpty());
    }

    @Test
    void testRequireValidSession() {
        String sessionId = "valid-session-id";
        Instant expiresAt = Instant.now().plusSeconds(3600);
        GoogleTokenSession session = new GoogleTokenSession("access-token", null, expiresAt);

        sessionService.put(sessionId, session);
        GoogleTokenSession retrieved = sessionService.require(sessionId);

        assertNotNull(retrieved);
        assertEquals("access-token", retrieved.getAccessToken());
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void testRequireWithNullEmptyOrBlankSessionIdThrowsException(String sessionId) {
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            sessionService.require(sessionId);
        });

        assertEquals("Missing sessionId.", exception.getMessage());
    }

    @Test
    void testRequireNonExistentSessionThrowsException() {
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            sessionService.require("invalid-session-id");
        });

        assertEquals("Invalid sessionId (no stored Google session).", exception.getMessage());
    }

    @Test
    void testSessionWithNullRefreshToken() {
        String sessionId = "session-no-refresh";
        Instant expiresAt = Instant.now().plusSeconds(3600);
        GoogleTokenSession session = new GoogleTokenSession("access-token", null, expiresAt);

        sessionService.put(sessionId, session);
        Optional<GoogleTokenSession> retrieved = sessionService.get(sessionId);

        assertTrue(retrieved.isPresent());
        assertNull(retrieved.get().getRefreshToken());
    }

    @Test
    void testOverwriteExistingSession() {
        String sessionId = "overwrite-session";
        GoogleTokenSession session1 = new GoogleTokenSession("token1", null, Instant.now().plusSeconds(3600));
        GoogleTokenSession session2 = new GoogleTokenSession("token2", "refresh2", Instant.now().plusSeconds(7200));

        sessionService.put(sessionId, session1);
        sessionService.put(sessionId, session2);

        Optional<GoogleTokenSession> retrieved = sessionService.get(sessionId);

        assertTrue(retrieved.isPresent());
        assertEquals("token2", retrieved.get().getAccessToken());
        assertEquals("refresh2", retrieved.get().getRefreshToken());
    }
}

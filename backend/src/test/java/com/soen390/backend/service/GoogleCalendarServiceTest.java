package com.soen390.backend.service;

import com.soen390.backend.object.GoogleCalendarDto;
import com.soen390.backend.object.GoogleEventDto;
import com.soen390.backend.object.GoogleTokenSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class GoogleCalendarServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private GoogleSessionService sessionService;

    private GoogleCalendarService googleCalendarService;

    private GoogleTokenSession validSession;
    private GoogleTokenSession expiredSession;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        googleCalendarService = new GoogleCalendarService(restTemplate, sessionService);

        validSession = new GoogleTokenSession(
                "valid-access-token",
                "refresh-token",
                Instant.now().plusSeconds(3600)
        );

        expiredSession = new GoogleTokenSession(
                "expired-access-token",
                "refresh-token",
                Instant.now().minusSeconds(3600)
        );
    }

    // ========== listCalendars Tests ==========

    @Test
    void testListCalendarsSuccess() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> calendar1 = new HashMap<>();
        calendar1.put("id", "calendar1@google.com");
        calendar1.put("summary", "My Calendar");
        calendar1.put("primary", true);
        items.add(calendar1);

        Map<String, Object> calendar2 = new HashMap<>();
        calendar2.put("id", "calendar2@google.com");
        calendar2.put("summary", "Work Calendar");
        calendar2.put("primary", false);
        items.add(calendar2);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("items", items);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(
                eq("https://www.googleapis.com/calendar/v3/users/me/calendarList"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        List<GoogleCalendarDto> calendars = googleCalendarService.listCalendars("valid-session");

        assertEquals(2, calendars.size());
        assertEquals("calendar1@google.com", calendars.get(0).getId());
        assertEquals("My Calendar", calendars.get(0).getSummary());
        assertTrue(calendars.get(0).isPrimary());
        assertEquals("calendar2@google.com", calendars.get(1).getId());
        assertEquals("Work Calendar", calendars.get(1).getSummary());
        assertFalse(calendars.get(1).isPrimary());
    }

    @Test
    void testListCalendarsWithNullSummary() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> calendar = new HashMap<>();
        calendar.put("id", "calendar@google.com");
        calendar.put("summary", null);
        calendar.put("primary", false);
        items.add(calendar);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("items", items);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        List<GoogleCalendarDto> calendars = googleCalendarService.listCalendars("valid-session");

        assertEquals(1, calendars.size());
        assertEquals("(no name)", calendars.get(0).getSummary());
    }

    @Test
    void testListCalendarsWithNullPrimary() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> calendar = new HashMap<>();
        calendar.put("id", "calendar@google.com");
        calendar.put("summary", "Test Calendar");
        calendar.put("primary", null);
        items.add(calendar);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("items", items);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        List<GoogleCalendarDto> calendars = googleCalendarService.listCalendars("valid-session");

        assertEquals(1, calendars.size());
        assertFalse(calendars.get(0).isPrimary());
    }

    @Test
    void testListCalendarsExpiredSessionThrowsException() {
        when(sessionService.require("expired-session")).thenReturn(expiredSession);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            googleCalendarService.listCalendars("expired-session");
        });

        assertEquals("Session expired. Please sign in again.", exception.getMessage());
    }

    @Test
    void testListCalendarsEmptyItemsReturnsEmptyList() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("items", new ArrayList<>());

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        List<GoogleCalendarDto> calendars = googleCalendarService.listCalendars("valid-session");

        assertTrue(calendars.isEmpty());
    }

    @Test
    void testListCalendarsNullResponseBodyThrowsException() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(null, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            googleCalendarService.listCalendars("valid-session");
        });

        assertEquals("Failed to fetch calendar list from Google.", exception.getMessage());
    }

    @Test
    void testListCalendarsNon2xxStatusThrowsException() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(new HashMap<>(), HttpStatus.FORBIDDEN);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            googleCalendarService.listCalendars("valid-session");
        });

        assertEquals("Failed to fetch calendar list from Google.", exception.getMessage());
    }

    @Test
    void testListCalendarsSkipsItemsWithNullId() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> calendarWithId = new HashMap<>();
        calendarWithId.put("id", "valid@google.com");
        calendarWithId.put("summary", "Valid");
        items.add(calendarWithId);

        Map<String, Object> calendarWithoutId = new HashMap<>();
        calendarWithoutId.put("id", null);
        calendarWithoutId.put("summary", "Invalid");
        items.add(calendarWithoutId);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("items", items);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        List<GoogleCalendarDto> calendars = googleCalendarService.listCalendars("valid-session");

        assertEquals(1, calendars.size());
        assertEquals("valid@google.com", calendars.get(0).getId());
    }

    // ========== importEvents Tests ==========

    @Test
    void testImportEventsSuccessWithDateTimeEvents() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> event = new HashMap<>();
        event.put("id", "event1");
        event.put("summary", "Meeting");
        event.put("location", "Room 101");
        event.put("start", Map.of("dateTime", "2024-01-15T10:00:00-05:00"));
        event.put("end", Map.of("dateTime", "2024-01-15T11:00:00-05:00"));
        items.add(event);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("items", items);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        List<GoogleEventDto> events = googleCalendarService.importEvents("valid-session", "calendar-id", 7, "America/Montreal");

        assertEquals(1, events.size());
        assertEquals("event1", events.get(0).getId());
        assertEquals("Meeting", events.get(0).getSummary());
        assertEquals("Room 101", events.get(0).getLocation());
        assertEquals("2024-01-15T10:00:00-05:00", events.get(0).getStart());
        assertEquals("2024-01-15T11:00:00-05:00", events.get(0).getEnd());
        assertFalse(events.get(0).isAllDay());
    }

    @Test
    void testImportEventsSuccessWithAllDayEvents() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> event = new HashMap<>();
        event.put("id", "event1");
        event.put("summary", "Holiday");
        event.put("location", null);
        event.put("start", Map.of("date", "2024-01-15"));
        event.put("end", Map.of("date", "2024-01-16"));
        items.add(event);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("items", items);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        List<GoogleEventDto> events = googleCalendarService.importEvents("valid-session", "calendar-id", 7, "America/Montreal");

        assertEquals(1, events.size());
        assertEquals("2024-01-15", events.get(0).getStart());
        assertEquals("2024-01-16", events.get(0).getEnd());
        assertTrue(events.get(0).isAllDay());
    }

    @Test
    void testImportEventsWithNullSummary() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> event = new HashMap<>();
        event.put("id", "event1");
        event.put("summary", null);
        event.put("start", Map.of("dateTime", "2024-01-15T10:00:00-05:00"));
        event.put("end", Map.of("dateTime", "2024-01-15T11:00:00-05:00"));
        items.add(event);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("items", items);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        List<GoogleEventDto> events = googleCalendarService.importEvents("valid-session", "calendar-id", 7, "America/Montreal");

        assertEquals(1, events.size());
        assertEquals("(no title)", events.get(0).getSummary());
    }

    @Test
    void testImportEventsEmptyItemsReturnsEmptyList() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("items", new ArrayList<>());

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        List<GoogleEventDto> events = googleCalendarService.importEvents("valid-session", "calendar-id", 7, "America/Montreal");

        assertTrue(events.isEmpty());
    }

    @Test
    void testImportEventsNullResponseBodyReturnsEmptyList() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(null, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        List<GoogleEventDto> events = googleCalendarService.importEvents("valid-session", "calendar-id", 7, "America/Montreal");

        assertTrue(events.isEmpty());
    }

    @Test
    void testImportEventsHttpExceptionThrowsRuntimeException() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND, "Not Found",
                        "{\"error\":{\"message\":\"Calendar not found\"}}".getBytes(), null));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            googleCalendarService.importEvents("valid-session", "invalid-calendar", 7, "America/Montreal");
        });

        assertTrue(exception.getMessage().contains("Google Events API error"));
        assertTrue(exception.getMessage().contains("404"));
    }

    @Test
    void testImportEventsWithNullStartAndEnd() {
        when(sessionService.require("valid-session")).thenReturn(validSession);

        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> event = new HashMap<>();
        event.put("id", "event1");
        event.put("summary", "No Time Event");
        event.put("start", null);
        event.put("end", null);
        items.add(event);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("items", items);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        List<GoogleEventDto> events = googleCalendarService.importEvents("valid-session", "calendar-id", 7, "America/Montreal");

        assertEquals(1, events.size());
        assertNull(events.get(0).getStart());
        assertNull(events.get(0).getEnd());
        assertFalse(events.get(0).isAllDay());
    }

    @Test
    void testImportEventsSessionWithNullExpiresAt() {
        GoogleTokenSession sessionWithNullExpiry = new GoogleTokenSession(
                "access-token",
                "refresh-token",
                null
        );

        when(sessionService.require("session-no-expiry")).thenReturn(sessionWithNullExpiry);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("items", new ArrayList<>());

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        List<GoogleEventDto> events = googleCalendarService.importEvents("session-no-expiry", "calendar-id", 7, "America/Montreal");

        assertNotNull(events);
    }

    // ========== getNextEvent Tests ==========

    @Test
    void testGetNextEventReturnsFirstFutureEvent() {
        GoogleCalendarService serviceSpy = spy(new GoogleCalendarService(restTemplate, sessionService));
        String soon = OffsetDateTime.now().plusMinutes(30).toString();
        String later = OffsetDateTime.now().plusMinutes(90).toString();

        List<GoogleEventDto> events = Arrays.asList(
                new GoogleEventDto("event1", "Earliest", null,
                        soon, soon, false),
                new GoogleEventDto("event2", "Later", null,
                        later, later, false)
        );

        doReturn(events).when(serviceSpy).importEvents("session-id", "calendar-id", 7, "America/Montreal");

        GoogleEventDto next = serviceSpy.getNextEvent("session-id", "calendar-id", 7, "America/Montreal");

        assertNotNull(next);
        assertEquals("event1", next.getId());
        assertEquals("Earliest", next.getSummary());
    }

    @Test
    void testGetNextEventSkipsAlreadyStartedEvent() {
        GoogleCalendarService serviceSpy = spy(new GoogleCalendarService(restTemplate, sessionService));
        String started = OffsetDateTime.now().minusMinutes(1).toString();
        String future = OffsetDateTime.now().plusMinutes(45).toString();

        List<GoogleEventDto> events = Arrays.asList(
                new GoogleEventDto("event-started", "Started", null, started, started, false),
                new GoogleEventDto("event-future", "Future", null, future, future, false)
        );

        doReturn(events)
                .when(serviceSpy)
                .importEvents("session-id", "calendar-id", 7, "America/Montreal");

        GoogleEventDto next = serviceSpy.getNextEvent("session-id", "calendar-id", 7, "America/Montreal");

        assertNotNull(next);
        assertEquals("event-future", next.getId());
    }

    @Test
    void testGetNextEventReturnsNullWhenNoFutureEvents() {
        GoogleCalendarService serviceSpy = spy(new GoogleCalendarService(restTemplate, sessionService));
        String started1 = OffsetDateTime.now().minusHours(2).toString();
        String started2 = OffsetDateTime.now().minusMinutes(10).toString();

        List<GoogleEventDto> events = Arrays.asList(
                new GoogleEventDto("event-started-1", "Started 1", null, started1, started1, false),
                new GoogleEventDto("event-started-2", "Started 2", null, started2, started2, false)
        );

        doReturn(events)
                .when(serviceSpy)
                .importEvents("session-id", "calendar-id", 7, "America/Montreal");

        GoogleEventDto next = serviceSpy.getNextEvent("session-id", "calendar-id", 7, "America/Montreal");

        assertNull(next);
    }

    // ========== State/session selection Tests ==========

    @Test
    void testSetSelectedCalendarStoresSelectionInSession() {
        GoogleTokenSession session = new GoogleTokenSession("access-token", "refresh-token", Instant.now().plusSeconds(3600));
        when(sessionService.require("session-id")).thenReturn(session);

        googleCalendarService.setSelectedCalendar(
                "session-id",
                new GoogleCalendarDto("calendar-id", "School Calendar", true)
        );

        ArgumentCaptor<GoogleTokenSession> sessionCaptor = ArgumentCaptor.forClass(GoogleTokenSession.class);
        verify(sessionService).put(eq("session-id"), sessionCaptor.capture());

        GoogleTokenSession stored = sessionCaptor.getValue();
        assertEquals("calendar-id", stored.getSelectedCalendarId());
        assertEquals("School Calendar", stored.getSelectedCalendarSummary());
        assertTrue(stored.isSelectedCalendarPrimary());
    }

    @Test
    void testGetStateReturnsSelectedCalendarAndNextEvent() {
        GoogleTokenSession session = new GoogleTokenSession("access-token", "refresh-token", Instant.now().plusSeconds(3600));
        session.setSelectedCalendarId("calendar-id");
        session.setSelectedCalendarSummary("School Calendar");
        session.setSelectedCalendarPrimary(false);

        GoogleCalendarService serviceSpy = spy(new GoogleCalendarService(restTemplate, sessionService));
        when(sessionService.require("session-id")).thenReturn(session);
        doReturn(new GoogleEventDto("event-id", "SOEN 390", "H-937",
                OffsetDateTime.now().plusHours(1).toString(),
                OffsetDateTime.now().plusHours(2).toString(),
                false))
                .when(serviceSpy)
                .getNextEvent("session-id", "calendar-id", 7, "America/Montreal");

        Map<String, Object> state = serviceSpy.getState("session-id", 7, "America/Montreal");

        assertEquals(true, state.get("connected"));
        assertEquals(true, state.get("calendarSelected"));
        assertNotNull(state.get("selectedCalendar"));
        assertNotNull(state.get("nextEvent"));
    }
}

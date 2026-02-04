package com.soen390.backend.controller;

import com.soen390.backend.object.GoogleCalendarDto;
import com.soen390.backend.object.GoogleEventDto;
import com.soen390.backend.service.GoogleCalendarService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/google")
public class GoogleCalendarController {

  private final GoogleCalendarService googleCalendarService;

  public GoogleCalendarController(GoogleCalendarService googleCalendarService) {
    this.googleCalendarService = googleCalendarService;
  }

  @GetMapping("/calendars")
  public List<GoogleCalendarDto> calendars(@RequestHeader("X-Session-Id") String sessionId) {
    if (sessionId == null || sessionId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "X-Session-Id header is required.");
    }

    try {
      return googleCalendarService.listCalendars(sessionId);
    } catch (RuntimeException e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage(), e);
    }
  }

  @PostMapping("/calendars/{calendarId}/import")
  public List<GoogleEventDto> importCalendar(
      @RequestHeader("X-Session-Id") String sessionId,
      @PathVariable String calendarId,
      @RequestParam(defaultValue = "7") int days,
      @RequestParam(defaultValue = "America/Montreal") String timeZone
  ) {
    if (sessionId == null || sessionId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "X-Session-Id header is required.");
    }

    try {
      return googleCalendarService.importEvents(sessionId, calendarId, days, timeZone);
    } catch (RuntimeException e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage(), e);
    }
  }

}

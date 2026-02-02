package com.soen390.backend.controller;

import com.soen390.backend.service.CalendarImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;

import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
public class CalendarImportController {

  private final CalendarImportService service;

  public CalendarImportController(CalendarImportService service) {
    this.service = service;
  }

  @PostMapping("/import")
  public ResponseEntity<?> importCalendar(@RequestBody Map<String, Object> body) {
    try {
      String code = (String) body.get("serverAuthCode");
      String calendarName = (String) body.getOrDefault("calendarName", "primary");
      int days = ((Number) body.getOrDefault("days", 7)).intValue();

      return ResponseEntity.ok(service.importCalendar(code, calendarName, days));

    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (HttpStatusCodeException e) {
      return ResponseEntity.status(e.getStatusCode()).body(Map.of(
        "error", "Google API error",
        "status", e.getStatusCode().value(),
        "googleBody", e.getResponseBodyAsString()
      ));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
  }
}

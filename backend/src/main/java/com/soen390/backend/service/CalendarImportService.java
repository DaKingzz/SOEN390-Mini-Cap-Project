package com.soen390.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class CalendarImportService {

  private final RestTemplate restTemplate;

  @Value("${google.oauth.client-id}")
  private String clientId;

  @Value("${google.oauth.client-secret}")
  private String clientSecret;

  @Value("${google.oauth.redirect-uri}")
  private String redirectUri;

  public CalendarImportService(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
  }

  public Map<String, Object> importCalendar(String serverAuthCode, String calendarName, int days) {
    if (serverAuthCode == null || serverAuthCode.isBlank()) {
      throw new IllegalArgumentException("serverAuthCode is required");
    }

    String accessToken = exchangeCodeForAccessToken(serverAuthCode);
    String calendarId = resolveCalendarId(accessToken, calendarName);
    Map<String, Object> events = fetchEvents(accessToken, calendarId, days);

    return Map.of(
      "calendarName", calendarName,
      "calendarId", calendarId,
      "days", days,
      "events", events
    );
  }

  private String exchangeCodeForAccessToken(String code) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

    MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
    form.add("code", code);
    form.add("client_id", clientId);
    form.add("client_secret", clientSecret);
    form.add("redirect_uri", redirectUri);
    form.add("grant_type", "authorization_code");

    ResponseEntity<Map> resp = restTemplate.postForEntity(
      "https://oauth2.googleapis.com/token",
      new HttpEntity<>(form, headers),
      Map.class
    );

    Map body = resp.getBody();
    if (body == null || body.get("access_token") == null) {
      throw new RuntimeException("Token exchange failed: " + body);
    }
    return (String) body.get("access_token");
  }

  private String resolveCalendarId(String accessToken, String calendarName) {
    if (calendarName == null || calendarName.isBlank() || "primary".equalsIgnoreCase(calendarName)) {
      return "primary";
    }

    HttpHeaders h = new HttpHeaders();
    h.setBearerAuth(accessToken);
    HttpEntity<Void> req = new HttpEntity<>(h);

    ResponseEntity<Map> listResp = restTemplate.exchange(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      HttpMethod.GET,
      req,
      Map.class
    );

    Object itemsObj = listResp.getBody() != null ? listResp.getBody().get("items") : null;
    if (!(itemsObj instanceof List)) {
      throw new RuntimeException("calendarList.items missing or not a list");
    }

    List<Map<String, Object>> items = (List<Map<String, Object>>) itemsObj;

    Map<String, Object> target = items.stream()
      .filter(c -> calendarName.equals(c.get("summary")))
      .findFirst()
      .orElse(null);

    if (target == null || target.get("id") == null) {
      throw new RuntimeException("Calendar not found by summary: " + calendarName);
    }

    return (String) target.get("id");
  }

  private Map<String, Object> fetchEvents(String accessToken, String calendarId, int days) {
    String timeMin = Instant.now().toString();
    String timeMax = Instant.now().plusSeconds(days * 24L * 60L * 60L).toString();

    String url = UriComponentsBuilder
      .fromUriString("https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events")
      .queryParam("timeMin", timeMin)
      .queryParam("timeMax", timeMax)
      .queryParam("singleEvents", "true")
      .queryParam("orderBy", "startTime")
      .queryParam("maxResults", "250")
      .queryParam("timeZone", "America/Toronto")
      .buildAndExpand(calendarId)
      .toUriString();

    HttpHeaders h = new HttpHeaders();
    h.setBearerAuth(accessToken);

    ResponseEntity<Map> eventsResp = restTemplate.exchange(
      url,
      HttpMethod.GET,
      new HttpEntity<>(h),
      Map.class
    );

    return (Map<String, Object>) eventsResp.getBody();
  }
}

package com.soen390.backend.controller;

import com.soen390.backend.service.GoogleOAuthService;
import com.soen390.backend.service.GoogleSessionService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.Map;


@RestController
@RequestMapping("/api/google/oauth")
public class GoogleOAuthController {

  private static final String GOOGLE_SESSION_COOKIE = "google_session_id";

  private final GoogleOAuthService googleOAuthService;
  private final GoogleSessionService googleSessionService;

  @Value("${app.google.session-cookie.secure:false}")
  private boolean secureSessionCookie;

  @Value("${app.google.session-cookie.same-site:Lax}")
  private String sessionCookieSameSite;

  @Value("${app.google.session-cookie.max-age-seconds:2592000}")
  private long sessionCookieMaxAgeSeconds;

  public GoogleOAuthController(
      GoogleOAuthService googleOAuthService,
      GoogleSessionService googleSessionService
  ) {
    this.googleOAuthService = googleOAuthService;
    this.googleSessionService = googleSessionService;
  }


  @PostMapping("/exchange")
  public Map<String, Object> exchange(
      @RequestBody Map<String, String> body,
      HttpServletResponse response
  ) {
    String code = body.get("serverAuthCode");
    if (code == null || code.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "serverAuthCode is required.");
    }

    try {
      String sessionId = googleOAuthService.exchangeServerAuthCode(code);
      response.addHeader(HttpHeaders.SET_COOKIE, buildSessionCookie(sessionId).toString());
      return Map.of("connected", true);
    } catch (RuntimeException e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage(), e);
    }
  }

  @PostMapping("/logout")
  public Map<String, Object> logout(
      @CookieValue(value = GOOGLE_SESSION_COOKIE, required = false) String sessionId,
      HttpServletResponse response
  ) {
    googleSessionService.remove(sessionId);
    response.addHeader(HttpHeaders.SET_COOKIE, clearSessionCookie().toString());
    return Map.of("loggedOut", true);
  }

  private ResponseCookie buildSessionCookie(String sessionId) {
    return ResponseCookie.from(GOOGLE_SESSION_COOKIE, sessionId)
        .httpOnly(true)
        .secure(secureSessionCookie)
        .path("/api/google")
        .sameSite(sessionCookieSameSite)
        .maxAge(Duration.ofSeconds(Math.max(1, sessionCookieMaxAgeSeconds)))
        .build();
  }

  private ResponseCookie clearSessionCookie() {
    return ResponseCookie.from(GOOGLE_SESSION_COOKIE, "")
        .httpOnly(true)
        .secure(secureSessionCookie)
        .path("/api/google")
        .sameSite(sessionCookieSameSite)
        .maxAge(Duration.ZERO)
        .build();
  }

}

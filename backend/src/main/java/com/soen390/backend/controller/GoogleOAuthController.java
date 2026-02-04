package com.soen390.backend.controller;

import com.soen390.backend.service.GoogleOAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;


@RestController
@RequestMapping("/api/google/oauth")
public class GoogleOAuthController {

  private final GoogleOAuthService googleOAuthService;

  public GoogleOAuthController(GoogleOAuthService googleOAuthService) {
    this.googleOAuthService = googleOAuthService;
  }


  @PostMapping("/exchange")
  public Map<String, String> exchange(@RequestBody Map<String, String> body) {
    String code = body.get("serverAuthCode");
    if (code == null || code.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "serverAuthCode is required.");
    }

    try {
      String sessionId = googleOAuthService.exchangeServerAuthCode(code);
      return Map.of("sessionId", sessionId);
    } catch (RuntimeException e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage(), e);
    }
  }

}

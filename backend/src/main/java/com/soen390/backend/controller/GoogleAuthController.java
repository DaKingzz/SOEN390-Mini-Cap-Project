package com.soen390.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class GoogleAuthController {

  private final RestTemplate restTemplate;

  @Value("${google.oauth.client-id}")
  private String clientId;

  @Value("${google.oauth.client-secret}")
  private String clientSecret;

  @Value("${google.oauth.redirect-uri}")
  private String redirectUri;

  public GoogleAuthController(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
  }

  @PostMapping("/google")
  public ResponseEntity<?> exchange(@RequestBody Map<String, String> body) {
    String code = body.get("serverAuthCode");
    if (code == null || code.isBlank()) {
      return ResponseEntity.badRequest().body(Map.of("error", "serverAuthCode is required"));
    }

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

    MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
    form.add("code", code);
    form.add("client_id", clientId);
    form.add("client_secret", clientSecret);
    form.add("redirect_uri", redirectUri);
    form.add("grant_type", "authorization_code");

    HttpEntity<MultiValueMap<String, String>> req = new HttpEntity<>(form, headers);

    try {
      ResponseEntity<Map> resp = restTemplate.postForEntity(
        "https://oauth2.googleapis.com/token",
        req,
        Map.class
      );

      return ResponseEntity.ok(Map.of(
        "ok", true,
        "tokenResponse", resp.getBody()
      ));

    } catch (HttpStatusCodeException ex) {
      // Return Google's error body to help you debug immediately
      return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsString());
    }
  }
}

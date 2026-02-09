package com.soen390.backend.service;

import com.soen390.backend.object.GoogleTokenSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class GoogleOAuthService {

  private final RestTemplate restTemplate;
  private final GoogleSessionService sessionService;

  @Value("${google.oauth.client-id}")
  private String clientId;

  @Value("${google.oauth.client-secret}")
  private String clientSecret;

  @Value("${google.oauth.redirect-uri}")
  private String redirectUri;

  public GoogleOAuthService(RestTemplate restTemplate, GoogleSessionService sessionService) {
    this.restTemplate = restTemplate;
    this.sessionService = sessionService;
  }

  public String exchangeServerAuthCode(String serverAuthCode) {
    String tokenUrl = "https://oauth2.googleapis.com/token";

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

    MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
    form.add("code", serverAuthCode);
    form.add("client_id", clientId);
    form.add("client_secret", clientSecret);

    // Keep this present for authorization_code exchanges
    form.add("redirect_uri", redirectUri);

    form.add("grant_type", "authorization_code");

    HttpEntity<MultiValueMap<String, String>> req = new HttpEntity<>(form, headers);

    try {
      ResponseEntity<Map> res = restTemplate.exchange(tokenUrl, HttpMethod.POST, req, Map.class);

      if (!res.getStatusCode().is2xxSuccessful() || res.getBody() == null) {
        throw new RuntimeException("Google token exchange failed (empty response).");
      }

      Map body = res.getBody();
      String accessToken = (String) body.get("access_token");
      String refreshToken = (String) body.get("refresh_token"); // may be null
      Number expiresIn = (Number) body.get("expires_in");       // seconds

      if (accessToken == null || accessToken.isBlank()) {
        throw new RuntimeException("Google token exchange failed: missing access_token.");
      }

      Instant expiresAt = Instant.now().plusSeconds(expiresIn != null ? expiresIn.longValue() : 3600);

      String sessionId = UUID.randomUUID().toString();
      sessionService.put(sessionId, new GoogleTokenSession(accessToken, refreshToken, expiresAt));
      return sessionId;

    } catch (HttpStatusCodeException e) {
      String googleBody = e.getResponseBodyAsString();
      throw new RuntimeException("Google token exchange failed: " + googleBody, e);
    }
  }
}

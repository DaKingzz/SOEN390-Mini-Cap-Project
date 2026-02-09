package com.soen390.backend.service;

import com.soen390.backend.object.GoogleTokenSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class GoogleOAuthServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private GoogleSessionService sessionService;

    private GoogleOAuthService googleOAuthService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        googleOAuthService = new GoogleOAuthService(restTemplate, sessionService);

        ReflectionTestUtils.setField(googleOAuthService, "clientId", "test-client-id");
        ReflectionTestUtils.setField(googleOAuthService, "clientSecret", "test-client-secret");
        ReflectionTestUtils.setField(googleOAuthService, "redirectUri", "http://localhost/callback");
    }

    @Test
    void testExchangeServerAuthCodeSuccess() {
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("access_token", "mock-access-token");
        responseBody.put("refresh_token", "mock-refresh-token");
        responseBody.put("expires_in", 3600);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(
                eq("https://oauth2.googleapis.com/token"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        String sessionId = googleOAuthService.exchangeServerAuthCode("test-auth-code");

        assertNotNull(sessionId);

        ArgumentCaptor<GoogleTokenSession> sessionCaptor = ArgumentCaptor.forClass(GoogleTokenSession.class);
        verify(sessionService).put(eq(sessionId), sessionCaptor.capture());

        GoogleTokenSession capturedSession = sessionCaptor.getValue();
        assertEquals("mock-access-token", capturedSession.getAccessToken());
        assertEquals("mock-refresh-token", capturedSession.getRefreshToken());
        assertNotNull(capturedSession.getExpiresAt());
    }

    @Test
    void testExchangeServerAuthCodeWithoutRefreshToken() {
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("access_token", "mock-access-token");
        responseBody.put("expires_in", 3600);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(
                eq("https://oauth2.googleapis.com/token"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        String sessionId = googleOAuthService.exchangeServerAuthCode("test-auth-code");

        assertNotNull(sessionId);

        ArgumentCaptor<GoogleTokenSession> sessionCaptor = ArgumentCaptor.forClass(GoogleTokenSession.class);
        verify(sessionService).put(eq(sessionId), sessionCaptor.capture());

        GoogleTokenSession capturedSession = sessionCaptor.getValue();
        assertEquals("mock-access-token", capturedSession.getAccessToken());
        assertNull(capturedSession.getRefreshToken());
    }

    @Test
    void testExchangeServerAuthCodeEmptyResponseThrowsException() {
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(null, HttpStatus.OK);

        when(restTemplate.exchange(
                eq("https://oauth2.googleapis.com/token"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            googleOAuthService.exchangeServerAuthCode("test-auth-code");
        });

        assertEquals("Google token exchange failed (empty response).", exception.getMessage());
    }

    static Stream<Map<String, Object>> missingOrBlankAccessTokenBodies() {
        Map<String, Object> missingToken = new HashMap<>();
        missingToken.put("refresh_token", "mock-refresh-token");

        Map<String, Object> blankToken = new HashMap<>();
        blankToken.put("access_token", "   ");

        return Stream.of(missingToken, blankToken);
    }

    @ParameterizedTest
    @MethodSource("missingOrBlankAccessTokenBodies")
    void testExchangeServerAuthCodeMissingOrBlankAccessTokenThrowsException(Map<String, Object> responseBody) {
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(
                eq("https://oauth2.googleapis.com/token"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            googleOAuthService.exchangeServerAuthCode("test-auth-code");
        });

        assertEquals("Google token exchange failed: missing access_token.", exception.getMessage());
    }

    @Test
    void testExchangeServerAuthCodeNon2xxResponseThrowsException() {
        Map<String, Object> responseBody = new HashMap<>();
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.BAD_REQUEST);

        when(restTemplate.exchange(
                eq("https://oauth2.googleapis.com/token"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            googleOAuthService.exchangeServerAuthCode("test-auth-code");
        });

        assertTrue(exception.getMessage().contains("Google token exchange failed"));
    }

    @Test
    void testExchangeServerAuthCodeHttpExceptionThrowsRuntimeException() {
        when(restTemplate.exchange(
                eq("https://oauth2.googleapis.com/token"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(new HttpClientErrorException(HttpStatus.UNAUTHORIZED, "Unauthorized",
                "{\"error\":\"invalid_grant\"}".getBytes(), null));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            googleOAuthService.exchangeServerAuthCode("invalid-auth-code");
        });

        assertTrue(exception.getMessage().contains("Google token exchange failed"));
        assertTrue(exception.getMessage().contains("invalid_grant"));
    }

    @Test
    void testExchangeServerAuthCodeSendsCorrectRequestBody() {
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("access_token", "mock-access-token");
        responseBody.put("expires_in", 3600);

        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        ArgumentCaptor<HttpEntity> requestCaptor = ArgumentCaptor.forClass(HttpEntity.class);

        when(restTemplate.exchange(
                eq("https://oauth2.googleapis.com/token"),
                eq(HttpMethod.POST),
                requestCaptor.capture(),
                eq(Map.class)
        )).thenReturn(responseEntity);

        googleOAuthService.exchangeServerAuthCode("my-auth-code");

        HttpEntity<MultiValueMap<String, String>> capturedRequest = requestCaptor.getValue();
        MultiValueMap<String, String> requestBody = capturedRequest.getBody();

        assertNotNull(requestBody);
        assertEquals("my-auth-code", requestBody.getFirst("code"));
        assertEquals("test-client-id", requestBody.getFirst("client_id"));
        assertEquals("test-client-secret", requestBody.getFirst("client_secret"));
        assertEquals("http://localhost/callback", requestBody.getFirst("redirect_uri"));
        assertEquals("authorization_code", requestBody.getFirst("grant_type"));

        HttpHeaders headers = capturedRequest.getHeaders();
        assertEquals(MediaType.APPLICATION_FORM_URLENCODED, headers.getContentType());
    }
}

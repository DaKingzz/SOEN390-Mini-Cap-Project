package com.soen390.backend.controller;

import com.soen390.backend.config.RestTemplateConfig;
import com.soen390.backend.service.GoogleOAuthService;
import com.soen390.backend.service.GoogleSessionService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GoogleOAuthController.class)
@Import(RestTemplateConfig.class)
public class GoogleOAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GoogleOAuthService googleOAuthService;

    @MockitoBean
    private GoogleSessionService googleSessionService;

    @Test
    void testExchangeSuccess() throws Exception {
        when(googleOAuthService.exchangeServerAuthCode("valid-auth-code"))
                .thenReturn("generated-session-id");

        mockMvc.perform(post("/api/google/oauth/exchange")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"serverAuthCode\": \"valid-auth-code\"}"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("google_session_id=generated-session-id")))
                .andExpect(jsonPath("$.connected").value(true));
    }

    @ParameterizedTest
    @ValueSource(strings = {"{}", "{\"serverAuthCode\": null}", "{\"serverAuthCode\": \"\"}", "{\"serverAuthCode\": \"   \"}"})
    void testExchangeInvalidServerAuthCodeReturns400(String requestBody) throws Exception {
        mockMvc.perform(post("/api/google/oauth/exchange")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testExchangeServiceExceptionReturns401() throws Exception {
        when(googleOAuthService.exchangeServerAuthCode(anyString()))
                .thenThrow(new RuntimeException("Google token exchange failed: invalid_grant"));

        mockMvc.perform(post("/api/google/oauth/exchange")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"serverAuthCode\": \"invalid-code\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testLogoutClearsCookie() throws Exception {
        mockMvc.perform(post("/api/google/oauth/logout")
                        .cookie(new Cookie("google_session_id", "session-123")))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("google_session_id=")))
                .andExpect(jsonPath("$.loggedOut").value(true));
    }
}

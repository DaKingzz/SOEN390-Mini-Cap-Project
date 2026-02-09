package com.soen390.backend.object;

import java.time.Instant;

public class GoogleTokenSession {
  private String accessToken;
  private String refreshToken; // can be null in some cases
  private Instant expiresAt;
  private String selectedCalendarId;
  private String selectedCalendarSummary;
  private boolean selectedCalendarPrimary;

  public GoogleTokenSession(String accessToken, String refreshToken, Instant expiresAt) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
  }

  public String getAccessToken() {
    return accessToken;
  }

  public void setAccessToken(String accessToken) {
    this.accessToken = accessToken;
  }

  public String getRefreshToken() {
    return refreshToken;
  }

  public void setRefreshToken(String refreshToken) {
    this.refreshToken = refreshToken;
  }

  public Instant getExpiresAt() {
    return expiresAt;
  }

  public void setExpiresAt(Instant expiresAt) {
    this.expiresAt = expiresAt;
  }

  public String getSelectedCalendarId() {
    return selectedCalendarId;
  }

  public void setSelectedCalendarId(String selectedCalendarId) {
    this.selectedCalendarId = selectedCalendarId;
  }

  public String getSelectedCalendarSummary() {
    return selectedCalendarSummary;
  }

  public void setSelectedCalendarSummary(String selectedCalendarSummary) {
    this.selectedCalendarSummary = selectedCalendarSummary;
  }

  public boolean isSelectedCalendarPrimary() {
    return selectedCalendarPrimary;
  }

  public void setSelectedCalendarPrimary(boolean selectedCalendarPrimary) {
    this.selectedCalendarPrimary = selectedCalendarPrimary;
  }
}

package com.soen390.backend.object;

public class GoogleCalendarDto {
  private String id;
  private String summary;
  private boolean primary;

  public GoogleCalendarDto() {}

  public GoogleCalendarDto(String id, String summary, boolean primary) {
    this.id = id;
    this.summary = summary;
    this.primary = primary;
  }

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }

  public String getSummary() { return summary; }
  public void setSummary(String summary) { this.summary = summary; }

  public boolean isPrimary() { return primary; }
  public void setPrimary(boolean primary) { this.primary = primary; }
}

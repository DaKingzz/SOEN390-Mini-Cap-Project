package com.soen390.backend.object;

public class GoogleEventDto {
  private String id;
  private String summary;
  private String location;
  private String start; // ISO string (date or dateTime)
  private String end;   // ISO string (date or dateTime)
  private boolean allDay;

  public GoogleEventDto() {}

  public GoogleEventDto(String id, String summary, String location, String start, String end, boolean allDay) {
    this.id = id;
    this.summary = summary;
    this.location = location;
    this.start = start;
    this.end = end;
    this.allDay = allDay;
  }

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }

  public String getSummary() { return summary; }
  public void setSummary(String summary) { this.summary = summary; }

  public String getLocation() { return location; }
  public void setLocation(String location) { this.location = location; }

  public String getStart() { return start; }
  public void setStart(String start) { this.start = start; }

  public String getEnd() { return end; }
  public void setEnd(String end) { this.end = end; }

  public boolean isAllDay() { return allDay; }
  public void setAllDay(boolean allDay) { this.allDay = allDay; }
}

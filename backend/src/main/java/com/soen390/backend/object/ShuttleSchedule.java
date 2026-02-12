package com.soen390.backend.object;

import java.util.List;

public class ShuttleSchedule {

    private String campus;
    private String dayType;
    private List<String> departureTimes;

    public ShuttleSchedule() {}

    public ShuttleSchedule(String campus, String dayType, List<String> departureTimes) {
        this.campus = campus;
        this.dayType = dayType;
        this.departureTimes = departureTimes;
    }

    public String getCampus() { return campus; }
    public void setCampus(String campus) { this.campus = campus; }

    public String getDayType() { return dayType; }
    public void setDayType(String dayType) { this.dayType = dayType; }

    public List<String> getDepartureTimes() { return departureTimes; }
    public void setDepartureTimes(List<String> departureTimes) { this.departureTimes = departureTimes; }
}

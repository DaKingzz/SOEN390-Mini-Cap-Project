package com.soen390.backend.object;

import java.util.List;

public class ShuttleScheduleResponse {

    private List<ShuttleSchedule> schedules;
    private long version;

    public ShuttleScheduleResponse(List<ShuttleSchedule> schedules, long version) {
        this.schedules = schedules;
        this.version = version;
    }

    public List<ShuttleSchedule> getSchedules() { return schedules; }
    public void setSchedules(List<ShuttleSchedule> schedules) { this.schedules = schedules; }

    public long getVersion() { return version; }
    public void setVersion(long version) { this.version = version; }
}

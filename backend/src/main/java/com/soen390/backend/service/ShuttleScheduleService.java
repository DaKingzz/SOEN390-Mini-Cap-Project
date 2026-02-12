package com.soen390.backend.service;

import com.soen390.backend.object.ShuttleSchedule;
import com.soen390.backend.object.ShuttleScheduleResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShuttleScheduleService {

    private final List<ShuttleSchedule> schedules;
    private final long version;

    public ShuttleScheduleService() {
        this.version = 1L;
        this.schedules = buildSchedules();
    }

    public List<ShuttleSchedule> getSchedules() {
        return schedules;
    }

    public long getVersion() {
        return version;
    }

    public ShuttleScheduleResponse getScheduleResponse() {
        return new ShuttleScheduleResponse(schedules, version);
    }

    private static List<ShuttleSchedule> buildSchedules() {
        return List.of(
                new ShuttleSchedule("SGW", "weekday", List.of(
                        "09:30", "09:45",
                        "10:00", "10:15", "10:30", "10:45",
                        "11:00", "11:15", "11:30",
                        "12:15", "12:30", "12:45",
                        "13:00", "13:15", "13:30", "13:45",
                        "14:00", "14:15", "14:30", "14:45",
                        "15:00", "15:15", "15:30",
                        "16:00", "16:15", "16:45",
                        "17:00", "17:15", "17:30", "17:45",
                        "18:00", "18:15", "18:30"
                )),
                new ShuttleSchedule("LOY", "weekday", List.of(
                        "09:15", "09:30", "09:45",
                        "10:00", "10:15", "10:30", "10:45",
                        "11:00", "11:15", "11:30", "11:45",
                        "12:30", "12:45",
                        "13:00", "13:15", "13:30", "13:45",
                        "14:00", "14:15", "14:30", "14:45",
                        "15:00", "15:15", "15:30", "15:45",
                        "16:30", "16:45",
                        "17:00", "17:15", "17:30", "17:45",
                        "18:00", "18:15", "18:30"
                )),
                new ShuttleSchedule("SGW", "friday", List.of(
                        "09:45",
                        "10:00", "10:15", "10:45",
                        "11:15", "11:30",
                        "12:15", "12:30", "12:45",
                        "13:15", "13:45",
                        "14:00", "14:15", "14:45",
                        "15:00", "15:15", "15:45",
                        "16:00", "16:45",
                        "17:15", "17:45",
                        "18:15"
                )),
                new ShuttleSchedule("LOY", "friday", List.of(
                        "09:15", "09:30", "09:45",
                        "10:15", "10:45",
                        "11:00", "11:15",
                        "12:00", "12:15", "12:45",
                        "13:00", "13:15", "13:45",
                        "14:15", "14:30", "14:45",
                        "15:15", "15:30", "15:45",
                        "16:45",
                        "17:15", "17:45",
                        "18:15"
                ))
        );
    }
}

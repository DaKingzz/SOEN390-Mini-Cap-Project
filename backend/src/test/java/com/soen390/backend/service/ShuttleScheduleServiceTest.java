package com.soen390.backend.service;

import com.soen390.backend.object.ShuttleSchedule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.soen390.backend.object.ShuttleScheduleResponse;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ShuttleScheduleServiceTest {

    private ShuttleScheduleService service;

    @BeforeEach
    void setUp() {
        service = new ShuttleScheduleService();
    }

    @Test
    void getSchedules_returnsNonEmptyList() {
        List<ShuttleSchedule> schedules = service.getSchedules();
        assertNotNull(schedules);
        assertFalse(schedules.isEmpty());
    }

    @Test
    void getSchedules_containsSGWWeekday() {
        List<ShuttleSchedule> schedules = service.getSchedules();
        boolean found = schedules.stream()
                .anyMatch(s -> "SGW".equals(s.getCampus()) && "weekday".equals(s.getDayType()));
        assertTrue(found, "Should contain SGW weekday schedule");
    }

    @Test
    void getSchedules_containsLOYWeekday() {
        List<ShuttleSchedule> schedules = service.getSchedules();
        boolean found = schedules.stream()
                .anyMatch(s -> "LOY".equals(s.getCampus()) && "weekday".equals(s.getDayType()));
        assertTrue(found, "Should contain LOY weekday schedule");
    }

    @Test
    void getSchedules_containsSGWFriday() {
        List<ShuttleSchedule> schedules = service.getSchedules();
        boolean found = schedules.stream()
                .anyMatch(s -> "SGW".equals(s.getCampus()) && "friday".equals(s.getDayType()));
        assertTrue(found, "Should contain SGW friday schedule");
    }

    @Test
    void getSchedules_containsLOYFriday() {
        List<ShuttleSchedule> schedules = service.getSchedules();
        boolean found = schedules.stream()
                .anyMatch(s -> "LOY".equals(s.getCampus()) && "friday".equals(s.getDayType()));
        assertTrue(found, "Should contain LOY friday schedule");
    }

    @Test
    void getSchedules_hasFourEntries() {
        assertEquals(4, service.getSchedules().size());
    }

    @Test
    void getSchedules_departureTimesNotEmpty() {
        for (ShuttleSchedule schedule : service.getSchedules()) {
            assertNotNull(schedule.getDepartureTimes());
            assertFalse(schedule.getDepartureTimes().isEmpty(),
                    schedule.getCampus() + " " + schedule.getDayType() + " should have departure times");
        }
    }

    @Test
    void getVersion_returnsPositiveValue() {
        assertTrue(service.getVersion() > 0);
    }

    @Test
    void getScheduleResponse_containsSchedulesAndVersion() {
        ShuttleScheduleResponse response = service.getScheduleResponse();
        assertNotNull(response.getSchedules());
        assertTrue(response.getVersion() > 0);
    }
}

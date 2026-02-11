package com.soen390.backend.controller;

import com.soen390.backend.object.ShuttleScheduleResponse;
import com.soen390.backend.service.ShuttleScheduleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/shuttle")
public class ShuttleScheduleController {

    private final ShuttleScheduleService shuttleScheduleService;

    public ShuttleScheduleController(ShuttleScheduleService shuttleScheduleService) {
        this.shuttleScheduleService = shuttleScheduleService;
    }

    @GetMapping("/schedule")
    public ShuttleScheduleResponse getSchedule() {
        return shuttleScheduleService.getScheduleResponse();
    }

    @GetMapping("/version")
    public Map<String, Long> getVersion() {
        return Map.of("version", shuttleScheduleService.getVersion());
    }
}

package com.soen390.backend.controller;

import com.soen390.backend.object.ShuttleSchedule;
import com.soen390.backend.object.ShuttleScheduleResponse;
import com.soen390.backend.service.ShuttleScheduleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ShuttleScheduleController.class)
class ShuttleScheduleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ShuttleScheduleService shuttleScheduleService;

    @Test
    void getSchedule_returnsSchedulesAndVersion() throws Exception {
        List<ShuttleSchedule> schedules = List.of(
                new ShuttleSchedule("SGW", "weekday", List.of("09:15", "09:45"))
        );
        when(shuttleScheduleService.getScheduleResponse())
                .thenReturn(new ShuttleScheduleResponse(schedules, 1L));

        mockMvc.perform(get("/api/shuttle/schedule"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.schedules").isArray())
                .andExpect(jsonPath("$.schedules[0].campus").value("SGW"))
                .andExpect(jsonPath("$.schedules[0].dayType").value("weekday"))
                .andExpect(jsonPath("$.schedules[0].departureTimes[0]").value("09:15"))
                .andExpect(jsonPath("$.version").value(1));
    }

    @Test
    void getVersion_returnsVersionNumber() throws Exception {
        when(shuttleScheduleService.getVersion()).thenReturn(1L);

        mockMvc.perform(get("/api/shuttle/version"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.version").value(1));
    }
}

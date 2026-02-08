package com.soen390.backend.controller;

import com.soen390.backend.config.RestTemplateConfig;
import com.soen390.backend.exception.GoogleMapsDirectionsApiException;
import com.soen390.backend.object.OutdoorDirectionResponse;
import com.soen390.backend.object.RouteStep;
import com.soen390.backend.enums.TransportMode;
import com.soen390.backend.service.GoogleMapsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OutdoorDirectionsController.class)
@Import(RestTemplateConfig.class)
public class OutdoorDirectionsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GoogleMapsService googleMapsService;

    @Test
    void getDirectionsShouldReturn200AndJson() throws Exception {
        List<RouteStep> mockSteps = new ArrayList<>();


        OutdoorDirectionResponse mockResponse = new OutdoorDirectionResponse(
                "1.2 km",
                "15 mins",
                "dummy polyline",
                TransportMode.walking,
                mockSteps
        );

        when(googleMapsService.getDirections(any(), any(), any())).thenReturn(mockResponse);

        mockMvc.perform(get("/api/directions/outdoor")
                        .param("origin", "Concordia")
                        .param("destination", "McGill")
                        .param("transportMode", "walking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.distance").value("1.2 km"))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void getDirectionsShouldReturn404OnInvalidParams() throws Exception {
        when(googleMapsService.getDirections(any(), any(), any())).thenThrow(new GoogleMapsDirectionsApiException("Directions not found. Please check your start and end locations."));

        mockMvc.perform(get("/api/directions/outdoor")
                        .param("origin", "god")
                        .param("destination", "McGill")
                        .param("transportMode", "walking"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Directions not found. Please check your start and end locations."))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}

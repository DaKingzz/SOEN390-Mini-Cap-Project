package com.soen390.backend.controller;

import com.soen390.backend.enums.PlaceType;
import com.soen390.backend.enums.TransportMode;
import com.soen390.backend.object.OutdoorDirectionResponse;
import com.soen390.backend.object.RouteStep;
import com.soen390.backend.service.GoogleMapsService;
import com.soen390.backend.service.PlacesOfInterestService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OutdoorPlacesOfInterestController.class)
public class OutdoorPlacesOfInterestControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PlacesOfInterestService placesOfInterestService;

    public String getJsonResponse() {
        return """
                {
                    "places": [
                        {
                            "formattedAddress": "298 Gough St, San Francisco, CA 94102, USA",
                            "location": {
                                "latitude": 37.7758205,
                                "longitude": -122.42263609999998
                            },
                            "rating": 4.6,
                            "displayName": {
                                "text": "Dumpling Home",
                                "languageCode": "en"
                            },
                            "restroom": true,
                            "parkingOptions": {
                                "freeStreetParking": true,
                                "paidStreetParking": true
                            },
                            "accessibilityOptions": {
                                "wheelchairAccessibleEntrance": true,
                                "wheelchairAccessibleRestroom": true,
                                "wheelchairAccessibleSeating": true
                            }
                        }
                    ]
                }
                """;
    }

    @Test
    void getPlacesShouldReturn200AndJson() throws Exception {
        String jsonResponse = getJsonResponse();

        when(placesOfInterestService.getNearbyPlaces(1, 1000, 37.7749, -122.4194, PlaceType.restaurant)).thenReturn(jsonResponse);

        mockMvc.perform(post("/api/places/outdoor")
                        .param("maxResultCount", "1")
                        .param("radius", "1000")
                        .param("latitude", "37.7749")
                        .param("longitude", "-122.4194")
                        .param("placeType", PlaceType.restaurant.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.places").isArray())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}

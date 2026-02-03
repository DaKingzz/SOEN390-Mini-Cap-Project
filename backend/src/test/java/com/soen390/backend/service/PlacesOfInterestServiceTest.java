package com.soen390.backend.service;

import com.soen390.backend.enums.PlaceType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class PlacesOfInterestServiceTest {

    private PlacesOfInterestService placesService;
    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(builder).build();

        placesService = new PlacesOfInterestService(builder.build());

        ReflectionTestUtils.setField(placesService, "apiKey", "test-key");
    }

    @Test
    void getNearbyPlaces_Success() {
        String mockResponse = "{\"places\": []}";

        mockServer.expect(requestTo("https://places.googleapis.com/v1/places:searchNearby"))
                .andExpect(method(org.springframework.http.HttpMethod.POST))
                .andRespond(withSuccess(mockResponse, MediaType.APPLICATION_JSON));

        String result = placesService.getNearbyPlaces(1, 100.0, 0.0, 0.0, PlaceType.park);

        assertEquals(mockResponse, result);
        mockServer.verify();
    }

    @Test
    void getNearbyPlaces_ThrowsException_WhenResponseIsBlank() {
        mockServer.expect(requestTo("https://places.googleapis.com/v1/places:searchNearby"))
                .andRespond(withSuccess("", MediaType.APPLICATION_JSON));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            placesService.getNearbyPlaces(1, 100.0, 0.0, 0.0, null);
        });
    }
}
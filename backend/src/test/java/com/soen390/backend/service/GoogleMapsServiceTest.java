package com.soen390.backend.service;

import com.soen390.backend.object.OutdoorDirectionResponse;
import com.soen390.backend.enums.TransportMode;
import com.soen390.backend.exception.GoogleMapsDirectionsApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;

public class GoogleMapsServiceTest {
    private GoogleMapsService googleMapsService;

    String origin = "test origin";
    String destination = "test destination";

    public String getMockJsonResponseSuccess(){
        return """
                        {
                            "geocoded_waypoints": [
                                {
                                    "geocoder_status": "OK",
                                    "place_id": "ChIJZ1eIEoYeyUwR2YcBLED7-_U",
                                    "types": ["street_address", "subpremise"]
                                },
                                {
                                    "geocoder_status": "OK",
                                    "place_id": "ChIJaeO5dIYeyUwRcMi5FOfMXCg",
                                    "types": ["street_address", "subpremise"]
                                }
                            ],
                            "routes": [
                                {
                                    "bounds": {
                                        "northeast": { "lat": 45.5885454, "lng": -73.5671148 },
                                        "southwest": { "lat": 45.5883168, "lng": -73.5672356 }
                                    },
                                    "copyrights": "Powered by Google, ©2026 Google",
                                    "legs": [
                                        {
                                            "distance": { "text": "26 m", "value": 26 },
                                            "duration": { "text": "1 min", "value": 23 },
                                            "end_address": "6464 Rue Desportes, Saint-Léonard, QC H1T 3T5, Canada",
                                            "end_location": { "lat": 45.5883168, "lng": -73.5672356 },
                                            "start_address": "6985 Rue Daveluy, Saint-Léonard, QC H1T 4A8, Canada",
                                            "start_location": { "lat": 45.5885454, "lng": -73.5671148 },
                                            "steps": [
                                                {
                                                    "distance": { "text": "6 m", "value": 6 },
                                                    "duration": { "text": "1 min", "value": 5 },
                                                    "end_location": { "lat": 45.5885471, "lng": -73.56712329999999 },
                                                    "html_instructions": "Head <b>west</b> on <b>Rue Daveluy</b> toward <b>Rue Desportes</b>",
                                                    "polyline": { "points": "m_guGlq_`M?@" },
                                                    "start_location": { "lat": 45.5885454, "lng": -73.5671148 },
                                                    "travel_mode": "WALKING"
                                                },
                                                {
                                                    "distance": { "text": "20 m", "value": 20 },
                                                    "duration": { "text": "1 min", "value": 18 },
                                                    "end_location": { "lat": 45.5883168, "lng": -73.5672356 },
                                                    "html_instructions": "Turn <b>left</b> onto <b>Rue Desportes</b><div style=\\"font-size:0.9em\\">Destination will be on the right</div>",
                                                    "maneuver": "turn-left",
                                                    "polyline": { "points": "m_guGnq_`MTHVL" },
                                                    "start_location": { "lat": 45.5885471, "lng": -73.56712329999999 },
                                                    "travel_mode": "WALKING"
                                                }
                                            ],
                                            "traffic_speed_entry": [],
                                            "via_waypoint": []
                                        }
                                    ],
                                    "overview_polyline": { "points": "m_guGlq_`Ml@X" },
                                    "summary": "Rue Desportes",
                                    "warnings": [
                                        "Walking directions are in beta. Use caution – This route may be missing sidewalks or pedestrian paths."
                                    ],
                                    "waypoint_order": []
                                }
                            ],
                            "status": "OK"
                        }
                        """;
    }

    public String getMockJsonResponseParsingException(){
        return """
                        {
                            "geocoded_waypoints": [
                                {
                                    "geocoder_status": "OK",
                                    "place_id": "ChIJZ1eIEoYeyUwR2YcBLED7-_U",
                                    "types": ["street_address", "subpremise"]
                                },
                                {
                                    "geocoder_status": "OK",
                                    "place_id": "ChIJaeO5dIYeyUwRcMi5FOfMXCg",
                                    "types": ["street_address", "subpremise"]
                                }
                            ],
                            "routes": [
                                {
                                    "bounds": {
                                        "northeast": { "lat": 45.5885454, "lng": -73.5671148 },
                                        "southwest": { "lat": 45.5883168, "lng": -73.5672356 }
                                    },
                                    "copyrights": "Powered by Google, ©2026 Google",
                                    "legs": [
                                        {
                                            "distance": { "text": "26 m", "value": 26 },
                                            "duration": { "text": "1 min", "value": 23 },
                                            "end_address": "6464 Rue Desportes, Saint-Léonard, QC H1T 3T5, Canada",
                                            "end_location": { "lat": 45.5883168, "lng": -73.5672356 },
                                            "start_address": "6985 Rue Daveluy, Saint-Léonard, QC H1T 4A8, Canada",
                                            "start_location": { "lat": 45.5885454, "lng": -73.5671148 },
                                            "steps": [
                                                {
                                                    "distance": { "text": "6 m", "value": 6 },
                                                    "duration": { "text": "1 min", "value": 5 },
                                                    "end_location": { "lat": 45.5885471, "lng": -73.56712329999999 },
                                                    "html_instructions": "Head <b>west</b> on <b>Rue Daveluy</b> toward <b>Rue Desportes</b>",
                                                    "polyline": { "points": "m_guGlq_`M?@" },
                                                    "start_location": { "lat": 45.5885454, "lng": -73.5671148 },
                                                },
                                                {
                                                    "distance": { "text": "20 m", "value": 20 },
                                                    "duration": { "text": "1 min", "value": 18 },
                                                    "end_location": { "lat": 45.5883168, "lng": -73.5672356 },
                                                    "html_instructions": "Turn <b>left</b> onto <b>Rue Desportes</b><div style=\\"font-size:0.9em\\">Destination will be on the right</div>",
                                                    "maneuver": "turn-left",
                                                    "polyline": { "points": "m_guGnq_`MTHVL" },
                                                    "start_location": { "lat": 45.5885471, "lng": -73.56712329999999 },
                                                    "travel_mode": "WALKING"
                                                }
                                            ],
                                            "traffic_speed_entry": [],
                                            "via_waypoint": []
                                        }
                                    ],
                                    "overview_polyline": { "points": "m_guGlq_`Ml@X" },
                                    "summary": "Rue Desportes",
                                    "warnings": [
                                        "Walking directions are in beta. Use caution – This route may be missing sidewalks or pedestrian paths."
                                    ],
                                    "waypoint_order": []
                                }
                            ],
                            "status": "OK"
                        }
                        """;
    }

    public String getMockJsonResultNotFound(){
        return """
                {
                    "geocoded_waypoints": [
                        {
                            "geocoder_status": "ZERO_RESULTS"
                        },
                        {
                            "geocoder_status": "OK",
                            "place_id": "ChIJaeO5dIYeyUwRcMi5FOfMXCg",
                            "types": [
                                "street_address",
                                "subpremise"
                            ]
                        }
                    ],
                    "routes": [],
                    "status": "NOT_FOUND"
                }
                """;
    }

    public String getEmptyMockJson(){
        return """
                """;
    }

    @Mock
    private RestTemplate restTemplate;

    @BeforeEach
    void setup(){
        MockitoAnnotations.openMocks(this);
        googleMapsService=new GoogleMapsService(restTemplate);
    }

    @Test
    void testGetDirectionsSuccess(){
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(getMockJsonResponseSuccess());

        OutdoorDirectionResponse outdoorDirectionResponse = googleMapsService.getDirections(origin,destination, TransportMode.walking);

        assertNotNull(outdoorDirectionResponse);
        assertEquals("26 m",outdoorDirectionResponse.getDistance());
        assertEquals("1 min",outdoorDirectionResponse.getDuration());
        assertEquals(TransportMode.walking,outdoorDirectionResponse.getTransportMode());
    }

    @Test
    void testGetDirectionsParsingException(){
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(getMockJsonResponseParsingException());

        assertThrows(RuntimeException.class,()->googleMapsService.getDirections(origin,destination, TransportMode.driving));
    }

    @Test
    void testCheckingResponseStatus(){
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(getMockJsonResultNotFound());

        assertThrows(GoogleMapsDirectionsApiException.class,()->googleMapsService.getDirections(origin,destination, TransportMode.driving));
    }

    @Test
    void testEmptyJsonResponse() {
        when(restTemplate.getForObject(anyString(), eq(String.class)))
                .thenReturn( getEmptyMockJson());
        assertThrows(Exception.class, () -> googleMapsService.getDirections(origin, destination, TransportMode.walking));
    }

}

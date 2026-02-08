package com.soen390.backend.controller;

import com.soen390.backend.enums.PlaceType;
import com.soen390.backend.object.CoordinateLocation;
import com.soen390.backend.service.PlacesOfInterestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class OutdoorPlacesOfInterestController {

    @Autowired
    private PlacesOfInterestService placesOfInterestService;

    @PostMapping("/api/places/outdoor")
    public ResponseEntity<String> getPlaces(
            @RequestParam(defaultValue = "10", required = false) int maxResultCount,
            @RequestParam(defaultValue = "500", required = false) double radius,
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam PlaceType placeType
    ) {
        String rawJson = placesOfInterestService.getNearbyPlaces(maxResultCount, radius, latitude, longitude, placeType);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body(rawJson);
    }

}

package com.soen390.backend.controller;

import com.soen390.backend.service.PlacesOfInterestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SearchPlacesController {

    @Autowired
    private PlacesOfInterestService placesOfInterestService;

    @GetMapping("/api/places/search")
    public ResponseEntity<String> searchPlaces(
            @RequestParam String query
    ) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("{\"error\":\"Query must not be empty\"}");
        }

        String rawJson = placesOfInterestService.searchPlacesByText(query);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body(rawJson);
    }
}

package com.soen390.backend.controller;

import com.soen390.backend.object.OutdoorDirectionResponse;
import com.soen390.backend.enums.TransportMode;
import com.soen390.backend.service.GoogleMapsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/directions/outdoor")
public class OutdoorDirectionsController {

    private final GoogleMapsService mapsService;

    public OutdoorDirectionsController(GoogleMapsService mapsService) {
        this.mapsService = mapsService;
    }

    @GetMapping
    public OutdoorDirectionResponse getDirections(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam TransportMode transportMode) {

        return mapsService.getDirections(origin, destination, transportMode);
    }
}

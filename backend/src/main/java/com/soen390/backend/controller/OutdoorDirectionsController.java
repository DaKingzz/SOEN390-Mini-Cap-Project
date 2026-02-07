package com.soen390.backend.controller;

import com.soen390.backend.object.OutdoorDirectionResponse;
import com.soen390.backend.enums.TransportMode;
import com.soen390.backend.service.GoogleMapsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/directions/outdoor")
public class OutdoorDirectionsController {

    @Autowired
    private GoogleMapsService mapsService;


    @GetMapping
    public OutdoorDirectionResponse getDirections(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam TransportMode transportMode) {

        return mapsService.getDirections(origin, destination, transportMode);
    }
}

package com.soen390.backend.object;


import com.soen390.backend.enums.TransportMode;

import java.util.List;

public class OutdoorDirectionResponse {

    private String distance;
    private String duration;
    private String polyline;
    private TransportMode transportMode;
    private List<RouteStep> steps;



    public OutdoorDirectionResponse(String distance, String duration, String polyline,TransportMode transportMode, List<RouteStep> steps) {
        this.distance = distance;
        this.duration = duration;
        this.polyline = polyline;
        this.transportMode=transportMode;
        this.steps=steps;
    }

    public String getDistance() { return distance; }
    public String getDuration() { return duration; }
    public String getPolyline() { return polyline; }
    public TransportMode getTransportMode() { return transportMode; }
    public List<RouteStep> getSteps(){ return steps; }
}
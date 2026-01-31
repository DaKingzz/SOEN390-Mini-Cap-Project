package com.soen390.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.soen390.backend.object.OutdoorDirectionResponse;
import com.soen390.backend.object.RouteStep;
import com.soen390.backend.enums.ManeuverType;
import com.soen390.backend.enums.TransportMode;
import com.soen390.backend.exception.GoogleMapsDirectionsApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

@Service
public class GoogleMapsService {

    @Value("${google.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public GoogleMapsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public OutdoorDirectionResponse getDirections(String origin, String destination, TransportMode transportMode) {

        String url = "https://maps.googleapis.com/maps/api/directions/json" +
                "?origin=" + origin +
                "&destination=" + destination +
                "&mode=" + transportMode +
                "&key=" + apiKey;

        String json = restTemplate.getForObject(url, String.class);

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            String status = root.path("status").asText();

            checkResponseStatus(status);

            JsonNode route = root.path("routes").get(0);
            JsonNode leg = route.path("legs").get(0);

            String distance = leg.path("distance").path("text").asText();
            String duration = leg.path("duration").path("text").asText();
            String polyline = route.path("overview_polyline").path("points").asText();

            JsonNode steps = leg.path("steps");

            JsonNode step1 = leg.path("steps").get(0);
            String modeOfTransport = step1.path("travel_mode").asText();
            TransportMode mode = TransportMode.valueOf(modeOfTransport.toLowerCase());

            return new OutdoorDirectionResponse(distance, duration, polyline, mode, processSteps(steps));

        }
        catch (GoogleMapsDirectionsApiException e) {
            throw e;
        }
        catch (NullPointerException | JsonProcessingException e) {
            throw new RuntimeException("Map data format error: The response from the map service was incomplete or unexpected.", e);
        }
        catch (Exception e) {
            throw new RuntimeException("An unexpected error occurred while communicating with the Google Maps service.", e);
        }
    }

    private List<RouteStep> processSteps(JsonNode steps){

        List<RouteStep> stepList = new ArrayList<>();

        for (JsonNode step : steps) {

            String instruction = step.path("html_instructions").asText();
            String cleanInstruction = instruction.replaceAll("<[^>]*>", "");

            String stepDist = step.path("distance").path("text").asText();
            String stepDur = step.path("duration").path("text").asText();

            ManeuverType maneuverType= handleMissingManeuver(step);

            stepList.add(new RouteStep(cleanInstruction, stepDist, stepDur,maneuverType));
        }
        return stepList;

    }

    private ManeuverType handleMissingManeuver(JsonNode step){
        ManeuverType maneuverType;
        if (!step.path("maneuver").isTextual()) {
            maneuverType = ManeuverType.STRAIGHT;
        } else {
            String maneuver = step.path("maneuver").asText();
            maneuverType = ManeuverType.fromString(maneuver);
        }
        return maneuverType;
    }

    private void checkResponseStatus(String status){
        if(!status.equals("OK")){
            throw new GoogleMapsDirectionsApiException("Directions not found. Please check your start and end locations.");
        }
    }

}

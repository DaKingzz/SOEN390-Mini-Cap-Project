package com.soen390.backend.object;

import com.soen390.backend.enums.ManeuverType;

public record RouteStep(String instruction, String distance, String duration, ManeuverType maneuverType) {}

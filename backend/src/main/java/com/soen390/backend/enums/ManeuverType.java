package com.soen390.backend.enums;

public enum ManeuverType {
    TURN_SLIGHT_LEFT("turn-slight-left"),
    TURN_SHARP_LEFT("turn-sharp-left"),
    TURN_LEFT("turn-left"),
    TURN_SLIGHT_RIGHT("turn-slight-right"),
    TURN_SHARP_RIGHT("turn-sharp-right"),
    KEEP_RIGHT("keep-right"),
    KEEP_LEFT("keep-left"),
    UTURN_LEFT("uturn-left"),
    UTURN_RIGHT("uturn-right"),
    TURN_RIGHT("turn-right"),
    STRAIGHT("straight"),
    RAMP_LEFT("ramp-left"),
    RAMP_RIGHT("ramp-right"),
    MERGE("merge"),
    FORK_LEFT("fork-left"),
    FORK_RIGHT("fork-right"),
    FERRY("ferry"),
    FERRY_TRAIN("ferry-train"),
    ROUNDABOUT_LEFT("roundabout-left"),
    ROUNDABOUT_RIGHT("roundabout-right");

    private final String value;

    ManeuverType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
    public static ManeuverType fromString(String text) {
        for (ManeuverType maneuver : ManeuverType.values()) {
            if (maneuver.value.equalsIgnoreCase(text)) {
                return maneuver;
            }
        }
        return null;
    }


}

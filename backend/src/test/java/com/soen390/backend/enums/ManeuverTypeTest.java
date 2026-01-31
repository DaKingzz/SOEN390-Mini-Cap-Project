package com.soen390.backend.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class ManeuverTypeTest {
    @Test
    void testSuccessMatchingUpper(){
        String maneuverTypeSuccessUpper = "STRAIGHT";
        assertEquals(ManeuverType.STRAIGHT,ManeuverType.fromString(maneuverTypeSuccessUpper));
    }

    @Test
    void testSuccessMatchingLower(){
        String maneuverTypeSuccessLower = "turn-left";
        assertEquals(ManeuverType.TURN_LEFT,ManeuverType.fromString(maneuverTypeSuccessLower));
    }

    @Test
    void testFailedMatching(){
        String maneuverTypeFailure = "failure";
        assertNull(ManeuverType.fromString(maneuverTypeFailure));
    }

    @Test
    void testGetValue(){
        String maneuver= "ramp-left";
        assertEquals(maneuver,ManeuverType.RAMP_LEFT.getValue());
    }


}

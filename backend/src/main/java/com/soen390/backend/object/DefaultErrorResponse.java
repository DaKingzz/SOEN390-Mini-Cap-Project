package com.soen390.backend.object;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

public record DefaultErrorResponse(
        String timestamp,
        int status,
        String error,
        String path
) {
    // Helper to create the timestamp in the exact format: 2026-01-31T18:37:18.990+00:00
    public static String now() {
        return OffsetDateTime.now().toString();
    }
}

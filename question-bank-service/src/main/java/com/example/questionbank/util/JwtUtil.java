
package com.example.questionbank.util;

import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    public String extractUsername(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2)
                return null;
            String payloadJson = new String(java.util.Base64.getDecoder().decode(parts[1]));
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.Map<String, Object> payload = mapper.readValue(payloadJson, java.util.Map.class);
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> safePayload = (java.util.Map<String, Object>) payload;
            Object username = safePayload.get("sub"); // or "username" depending on your JWT
            return username != null ? username.toString() : null;
        } catch (IllegalArgumentException | java.io.IOException e) {
            return null;
        }
    }
}
package com.example.authquiz.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    // At least 256-bit key (32+ chars). You can override via
    // application.properties: jwt.secret=...
    @Value("${jwt.secret:ZmFrZV9zdXBlcl9sb25nX3NlY3JldF9rZXlfMzJfY2hhcnNfbWluaW11bQ==}")
    private String secretBase64; // default is base64 for "fake_super_long_secret_key_32_chars_minimum"

    private SecretKey getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretBase64);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hour
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}

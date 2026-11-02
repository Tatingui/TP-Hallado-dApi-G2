package com.hallado.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class IdempotencyFilter extends OncePerRequestFilter {

    private final Set<String> processedKeys = ConcurrentHashMap.newKeySet();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String idempotencyKey = request.getHeader("X-Idempotency-Key");

        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            if (processedKeys.contains(idempotencyKey)) {
                // Return 200 OK for duplicate request to prevent duplicate database creation
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"message\":\"Operation already processed (Idempotent)\"}");
                return;
            }
            processedKeys.add(idempotencyKey);
        }

        filterChain.doFilter(request, response);
    }
}

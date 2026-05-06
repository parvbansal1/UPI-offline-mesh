package com.demo.upimesh.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting filter for Bridge node ingestion endpoint.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (request.getRequestURI().startsWith("/api/bridge/ingest")) {
            String bridgeId = request.getHeader("X-Bridge-Node-Id");
            if (bridgeId == null || bridgeId.isEmpty()) {
                bridgeId = request.getRemoteAddr();
            }

            Bucket bucket = cache.computeIfAbsent(bridgeId, this::createNewBucket);

            if (bucket.tryConsume(1)) {
                filterChain.doFilter(request, response);
            } else {
                response.setStatus(429); // Too Many Requests
                response.getWriter().write("Too many requests from this bridge node. Rate limit exceeded.");
            }
        } else {
            filterChain.doFilter(request, response);
        }
    }

    private Bucket createNewBucket(String key) {
        // 100 requests per minute
        Refill refill = Refill.greedy(100, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(100, refill);
        return Bucket.builder().addLimit(limit).build();
    }
}

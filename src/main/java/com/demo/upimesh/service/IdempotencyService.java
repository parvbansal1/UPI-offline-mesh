package com.demo.upimesh.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Distributed idempotency cache using Redis SETNX + TTL.
 *
 * The contract:
 *   - claim(hash) returns true on first call, false on every call after that
 *     (within the TTL window)
 *   - the operation is atomic
 */
@Service
public class IdempotencyService {

    private final StringRedisTemplate redisTemplate;

    @Value("${upi.mesh.idempotency-ttl-seconds:86400}")
    private long ttlSeconds;

    @Autowired
    public IdempotencyService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Try to claim a hash. Returns true if this caller is the first; false if
     * someone else already claimed it (i.e. the packet is a duplicate).
     */
    public boolean claim(String packetHash) {
        String key = "upimesh:idemp:" + packetHash;
        Boolean isFirst = redisTemplate.opsForValue()
                .setIfAbsent(key, "claimed", Duration.ofSeconds(ttlSeconds));
        return Boolean.TRUE.equals(isFirst);
    }

    public int size() {
        // Approximate size is not trivial to get efficiently in Redis without keys *.
        // We will just return 0 for demo purposes unless we want to run a SCAN.
        // For the demo UI we will return 0 or mock it.
        return 0; 
    }

    /** Test/demo helper. */
    public void clear() {
        redisTemplate.getConnectionFactory().getConnection().serverCommands().flushDb();
    }
}

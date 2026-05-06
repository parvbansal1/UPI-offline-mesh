package com.demo.upimesh.service;

import com.demo.upimesh.crypto.HybridCryptoService;
import com.demo.upimesh.model.KafkaIngestionMessage;
import com.demo.upimesh.model.PaymentInstruction;
import com.demo.upimesh.model.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Consumes raw ingested messages from Kafka, performs heavy decryption,
 * validates freshness, and passes to the Settlement service.
 */
@Service
public class DecryptionConsumerService {

    private static final Logger log = LoggerFactory.getLogger(DecryptionConsumerService.class);

    @Autowired private HybridCryptoService crypto;
    @Autowired private SettlementService settlement;

    @Value("${upi.mesh.packet-max-age-seconds:86400}")
    private long maxAgeSeconds;

    @KafkaListener(topics = "incoming-packets", groupId = "upimesh-group")
    public void consume(KafkaIngestionMessage message) {
        String packetHash = message.getPacketHash();
        try {
            // ---- Decrypt ----
            PaymentInstruction instruction;
            try {
                instruction = crypto.decrypt(message.getPacket().getCiphertext());
            } catch (Exception e) {
                log.warn("Decryption failed for packet {}: {}",
                        packetHash.substring(0, 12) + "...", e.getMessage());
                // In a real system, publish to a Dead Letter Queue (DLQ)
                return;
            }

            // ---- Freshness check (replay protection) ----
            long ageSeconds = (Instant.now().toEpochMilli() - instruction.getSignedAt()) / 1000;
            if (ageSeconds > maxAgeSeconds) {
                log.warn("Packet {} too old ({}s), rejected",
                        packetHash.substring(0, 12) + "...", ageSeconds);
                return;
            }
            if (ageSeconds < -300) { // small clock-skew tolerance
                log.warn("Packet {} is future dated, rejected", packetHash.substring(0, 12) + "...");
                return;
            }

            // ---- Settle ----
            Transaction tx = settlement.settle(
                    instruction, 
                    packetHash, 
                    message.getBridgeNodeId(), 
                    message.getHopCount()
            );
            
            log.info("Consumer successfully processed and settled packet {}", packetHash.substring(0, 12) + "...");

        } catch (Exception e) {
            log.error("Consumer error processing packet {}: {}", packetHash, e.getMessage(), e);
            // Kafka will normally retry if an exception is thrown, or we can send to DLQ.
            // Throwing it allows Spring Kafka's DefaultErrorHandler to kick in.
            throw new RuntimeException("Failed to process message", e);
        }
    }
}

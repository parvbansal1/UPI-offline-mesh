package com.demo.upimesh.model;

public class KafkaIngestionMessage {
    private MeshPacket packet;
    private String bridgeNodeId;
    private int hopCount;
    private String packetHash;

    public KafkaIngestionMessage() {}

    public KafkaIngestionMessage(MeshPacket packet, String bridgeNodeId, int hopCount, String packetHash) {
        this.packet = packet;
        this.bridgeNodeId = bridgeNodeId;
        this.hopCount = hopCount;
        this.packetHash = packetHash;
    }

    public MeshPacket getPacket() { return packet; }
    public void setPacket(MeshPacket packet) { this.packet = packet; }
    
    public String getBridgeNodeId() { return bridgeNodeId; }
    public void setBridgeNodeId(String bridgeNodeId) { this.bridgeNodeId = bridgeNodeId; }
    
    public int getHopCount() { return hopCount; }
    public void setHopCount(int hopCount) { this.hopCount = hopCount; }
    
    public String getPacketHash() { return packetHash; }
    public void setPacketHash(String packetHash) { this.packetHash = packetHash; }
}

<div align="center">
  <h1>🚀 UPI Offline Mesh Network</h1>
  <h3>A Distributed, Offline-First Payment Routing System</h3>

[![Java 17](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Architecture](https://img.shields.io/badge/Architecture-Distributed_Systems-blue?style=for-the-badge)](https://en.wikipedia.org/wiki/Distributed_computing)
[![Security](https://img.shields.io/badge/Security-Hybrid_Cryptography-red?style=for-the-badge&logo=shield)](https://en.wikipedia.org/wiki/Hybrid_cryptosystem)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

</div>

---

> **UPI Offline Mesh** is a proof-of-concept backend that eliminates the need for active internet connectivity to perform UPI payments. It leverages an ad-hoc **Bluetooth-style mesh network** to route encrypted transactions device-to-device.
>
> Imagine you are in a basement with zero connectivity. You send your friend ₹500. Your phone encrypts the payment and broadcasts it. The packet hops across nearby offline devices until *someone* eventually walks into a 4G internet zone and silently uploads it to the backend. The server securely decrypts, deduplicates the inevitable duplicate uploads, and settles the payment exactly once. 

---

## 📸 Screenshots & Visuals

<div align="center">

### Interactive Simulator Dashboard
<img src="./assets/dashboard.png" width="700" alt="Dashboard UI" />

### Mesh Network in Action
<img src="./assets/gossip.png" width="500" alt="Mesh Network Routing" />

<sub>Visualizing the "Gossip Protocol" as encrypted packets hop between devices.</sub>

### Transaction Ledger & Settlement
<img src="./assets/ledger.png" width="700" alt="Transaction Ledger" />

</div>

## 🧠 The "Offline Payment" Problem

Traditional digital payments (like UPI) operate on a synchronous, strictly-connected model. Both the sender and the bank core must establish a secure HTTPS connection in real-time to authorize a deduction. 

**The Challenge:** What happens in environments with zero cellular coverage? (e.g., dense basements, flights, remote rural areas, or during network outages).

**The Solution:** This project introduces **Deferred Settlement via Mesh Routing**. By treating nearby mobile devices as an untrusted peer-to-peer router network, payments can safely travel physically (via people walking) until they hit an internet bridge, all while maintaining absolute cryptographic security and strict single-settlement guarantees.

---

## 🏗️ Engineering Deep Dive

Building an offline mesh requires solving three critical distributed systems and security challenges. Here is exactly how the backend engine is engineered to handle them:

### 1. Zero-Trust Cryptography (The "Untrusted Intermediary" Problem)
A random stranger's phone is carrying your payment packet. How do we stop them from reading the amount, changing the recipient, or stealing funds?

**Implementation: Hybrid Cryptography (RSA-OAEP + AES-256-GCM)**
Since RSA can only encrypt small payloads (~245 bytes for a 2048-bit key) and our JSON payload is larger, the system uses a standard TLS-style hybrid approach:
1. The sender phone generates a fresh **AES-256 key** for *this specific packet*.
2. The payment JSON is encrypted using **AES-256-GCM** (Galois/Counter Mode). GCM provides *authenticated encryption*.
3. The AES key itself is then encrypted using the **Server's RSA-2048 Public Key**.
4. The final packet payload becomes: `[256 bytes RSA-encrypted AES key] + [12 bytes IV] + [AES ciphertext & 16-byte GCM tag]`.

**Why GCM?** It attaches an authentication tag. If an intermediate node flips even a *single bit* to try and change the amount, the GCM tag verification will fail during decryption on the backend, throwing a `AEADBadTagException`. The server is never tricked into processing tampered data.

### 2. The Atomic Idempotency Engine (The "Duplicate Storm" Problem)
Because of the nature of a mesh network, a single payment might be picked up by 10 different people. If 5 of them walk outside and connect to 4G at the exact same millisecond, they will all POST the exact same packet to `/api/bridge/ingest`. If we aren't careful, the sender gets charged ₹2500 instead of ₹500.

**Implementation: Compare-And-Set Hashing**
Before *any* expensive RSA decryption happens, the server calculates the `SHA-256` hash of the authenticated ciphertext. It then attempts an atomic lock using a `ConcurrentHashMap`:
```java
// Simulated Redis SETNX equivalent
Instant prev = idempotencyCache.putIfAbsent(packetHash, now);
if (prev != null) {
    return Outcome.DUPLICATE_DROPPED;
}
```
`putIfAbsent` is atomic at the JVM level. Even if 100 threads execute this on the exact same nanosecond, exactly *one* thread will return `null` and proceed to decrypt and settle. The other 99 threads instantly drop the request.

*(In production, this map is simply replaced with Redis: `SET key NX EX 86400`).* We also implement a fallback `UNIQUE` database index on `packet_hash` as a final line of defense against race conditions.

### 3. Replay Attack Mitigation
What stops a malicious bridge node from saving an encrypted packet today, and re-uploading it next week to drain the sender's account again?

**Implementation: Temporal Constraints & Nonces**
Inside the encrypted payload, the sender embeds a `signedAt` epoch timestamp and a unique `UUID` nonce. 
1. The backend automatically drops any packet where `signedAt` is older than 24 hours (enforcing a strict TTL).
2. The encrypted nonce guarantees that even if Alice sends Bob ₹500 twice legitimately, the ciphertexts will be completely different, resulting in different SHA-256 hashes. Thus, a true duplicate ciphertext is guaranteed to be a network replay, which gets caught by the Idempotency Engine.

---

## 📊 System Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         SENDER PHONE (offline)                          │
│  PaymentInstruction { sender, receiver, amount, pinHash, nonce, time }  │
│              │                                                          │
│              ▼ Encrypt with Server's RSA Public Key                     │
│   MeshPacket { packetId, ttl, createdAt, ciphertext }                   │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │ Bluetooth Gossip Protocol
                                       ▼
        ┌─────────┐  hop   ┌─────────┐  hop   ┌─────────┐
        │ Node A  │ ─────▶ │ Node B  │ ─────▶ │ Bridge  │ ◀── Walks outside
        └─────────┘        └─────────┘        └────┬────┘     Gets 4G Signal
                                                   │
                                                   ▼ HTTPS POST
┌─────────────────────────────────────────────────────────────────────────┐
│                     SPRING BOOT BACKEND (This Project)                  │
│                                                                         │
│  [1] Hash ciphertext (SHA-256)                                          │
│  [2] Atomic claim via IdempotencyService (Drops Duplicates instantly)   │
│  [3] Decrypt: RSA-OAEP unwraps AES key, AES-GCM decrypts/verifies data  │
│  [4] Freshness Check: Is signedAt within 24h?                           │
│  [5] Atomic DB Settlement: @Transactional Debit & Credit operations     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Tech Stack & Infrastructure

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Core Framework** | Java 17, Spring Boot 3.3 | Enterprise-grade REST API routing and Dependency Injection. |
| **Data Persistence** | H2 (In-Memory), Spring Data JPA | Relational mapping, ACID-compliant ledger transactions (`@Transactional`). |
| **Concurrency Control**| `ConcurrentHashMap`, JVM Threads | Handling multi-threaded duplicate storms via atomic operations. |
| **Cryptography** | Java Cryptography Extension (JCE) | RSA-2048 and AES-256-GCM cipher implementations. |
| **Frontend UI** | HTML5, CSS3, Vanilla JS (Fetch) | Interactive visualizer for the simulated mesh nodes. |

---

## ⚡ Installation & Quick Start

### 1. Requirements
You only need **JDK 17** installed and added to your `PATH`. 
*Note: You do not need to install Maven, PostgreSQL, or Redis. The project uses the Maven Wrapper and in-memory components so you can run the demo immediately.*

### 2. Run the Server
Open a terminal in the project directory:

**Windows:**
```cmd
mvnw.cmd spring-boot:run
```

**Mac / Linux:**
```bash
./mvnw spring-boot:run
```
*(Dependencies will be downloaded on the first run. Subsequent runs take ~3-5 seconds).*

### 3. Open the Interactive Mesh Dashboard
Navigate to **[http://localhost:8080](http://localhost:8080)** to access the visualizer.

---

## 📖 Usage Guide: Running the Demo

The dashboard simulates the entire offline lifecycle. Follow these steps:

1. **Inject into Mesh:** Select a sender, receiver, and amount. Click "Inject". The server creates an encrypted packet and assigns it to a simulated "offline" phone.
2. **Run Gossip Round:** Click this button a few times. Watch the packet jump from device to device. The TTL (Time To Live) will decrement with each hop.
3. **Bridges Upload to Backend:** A specific device is designated as the "Internet Bridge". Clicking this simulates the device gaining a 4G connection and POSTing all its cached packets to the server.
4. **View Ledger:** The server instantly deduplicates, decrypts, and settles the payment. The transaction ledger and account balances will update securely.

### 🧪 Running the Concurrency Tests
To truly test the robustness of the backend, run the test suite. The `IdempotencyConcurrencyTest` fires three threads delivering the exact same packet simultaneously to verify that exactly one thread succeeds while the others safely fail.
```bash
./mvnw test
```

---

## 🛠️ Internal Project Structure

```bash
upi-offline-mesh/
├── pom.xml                                  
├── src/main/
│   ├── resources/
│   │   ├── application.properties           # Server ports, H2 Config
│   │   └── templates/dashboard.html         # Frontend UI
│   └── java/com/demo/upimesh/
│       ├── model/                           # JPA Entities (Account, Transaction)
│       ├── crypto/                          # HybridCryptoService.java (RSA+AES logic)
│       ├── service/                         
│       │   ├── IdempotencyService.java      # Atomic duplicate dropping
│       │   ├── SettlementService.java       # @Transactional DB ledger logic
│       │   ├── MeshSimulatorService.java    # The Gossip engine
│       │   └── BridgeIngestionService.java  # THE PIPELINE (Hash -> Check -> Decrypt -> Settle)
│       └── controller/                      # REST APIs (/api/bridge/ingest)
└── src/test/                                # Multi-threading & Tamper Tests
```

---

## 📋 Limitations & Roadmap to Production

This is a teaching/portfolio demo. While the cryptography and idempotency are production-shaped, the surrounding infrastructure is simplified. To deploy this to an enterprise banking core, the following upgrades are required:

1. **Database:** Swap the H2 in-memory DB for a highly available **PostgreSQL** cluster.
2. **Idempotency:** Replace the JVM-local `ConcurrentHashMap` with a distributed **Redis** cluster (`SET NX EX`).
3. **Key Management:** Move the RSA Private keys out of JVM memory and into a Hardware Security Module (HSM) like **AWS KMS**.
4. **Physical Mesh:** Replace the software `MeshSimulatorService` with real Android Kotlin code utilizing **Wi-Fi Direct** or **BLE GATT** connections between physical phones.
5. **Sender Verification:** Without internet, receivers cannot cryptographically verify a sender has enough funds. True offline UPI requires an on-device secure element (hardware wallet) to pre-fund and lock balances offline.

---

## 🤝 Let's Connect

If you're a recruiter, engineer, or just someone interested in backend architecture, distributed systems, and cryptography, I'd love to connect!

<div align="center">

**Parv Bansal**

<!-- Update these links with your actual profiles! -->
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/your-profile)
[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github)](https://github.com/parvbansal1)

</div>

<div align="center">
  <sub>Built with precision and purpose. For engineers, by an engineer.</sub>
</div>

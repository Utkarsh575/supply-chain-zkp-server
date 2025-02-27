# First, submit farm data

curl -X POST http://localhost:3000/api/submit-farm-data \
-H "Content-Type: application/json" \
-d '{
"farmId": "123456",
"plusCode": "849123",
"batchId": "1001",
"grade": "A"
}'

# Then, using the proofId from the response above

curl -X POST http://localhost:3000/api/add-manufacturing-data/YOUR_PROOF_ID \
-H "Content-Type: application/json" \
-d '{
"batchId": 1001,
"mfgDate": "1767206532",
"expiryDate": "1772304132"
}'

# Verify Link

http://localhost:3000/api/verify/hashed/YOUR_PROOF_HASH

# Get all proofs and their status

http://localhost:3000/api/get-proof-status/




















-----------------------------------CHARTS------------------------------

```mermaid
graph LR;
    subgraph Off-Chain Processing
        A[Producer] -->|Generates Product Data| B[Central Server];
        B -->|Stores Encrypted Data SHA256| C[Database];
        D[Manufacturer] -->|Receives Product Data| E[Adds MFG Date, Expiry];
        E -->|Sends Updated Data| B;
        B -->|Generates zk-SNARK Proofs| F[zk-SNARK Module];
        F -->|Sends Proofs| G[zk-Rollup Aggregation];
    end

    subgraph On-Chain Processing
        G -->|Batches Proofs| H[Layer-2 Blockchain];
        H -->|Verifies zk-Rollups| I[Smart Contract];
        I -->|Ensures Integrity & Privacy| H;
    end

    subgraph Verification
        J[End-User / Third Party] -->|Scans QR Code| K[Server Endpoint];
        K -->|Retrieves Proof| L[Validates Proof Using zk-SNARKs];
        L -->|Displays Verification Result| J;
    end
```

```mermaid
graph TD;

    %% Off-Chain Processing
    subgraph Off-Chain Processing
        A[Producer] -->|Generates Product Data| B[Central Server];
        B -->|Stores Encrypted Data SHA256 | C[Database];
        D[Manufacturer] -->|Receives Product Data| E[Adds MFG Date, Expiry];
        E -->|Sends Updated Data| B;
    end

    %% zk-SNARK Proof Generation & zk-Rollup Aggregation
    subgraph zk-SNARK & zk-Rollup Aggregation
        B -->|Generates zk-SNARK Proofs| F[zk-SNARK Module];
        F -->|Sends Proofs| G[zk-Rollup Aggregation];
        G -->|Batches Proofs| H[Layer-2 Blockchain];
    end

    %% On-Chain Verification
    subgraph On-Chain Verification
        H -->|Verifies zk-Rollups| I[Smart Contract];
        I -->|Ensures Integrity & Privacy| H;
    end

    %% End-User Verification via QR Code
    subgraph End-User Verification
        J[End-User / Third Party] -->|Scans QR Code| K[Server Endpoint];
        K -->|Retrieves Proof| L[Validates Proof Using zk-SNARKs];
        L -->|Displays Verification Result| J;
    end
```

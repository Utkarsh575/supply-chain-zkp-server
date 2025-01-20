#!/bin/bash
CIRCOMLIB_REPO="https://github.com/iden3/circomlib.git"

# Check if the circomlib folder exists
if [ ! -d "circomlib" ]; then
  echo "circom circuits not found, cloning circomlib..."
  git clone $CIRCOMLIB_REPO
else
  echo "circom circuits are present."
fi

# Step 1: Compile the circuit
echo "Compiling circuit..."
circom supply_chain.circom --r1cs --wasm --sym --c -l circomlib/

# Step 2: Start a new powers of tau ceremony
echo "Starting powers of tau ceremony..."
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

# Step 3: Contribute to the ceremony with automated entropy
echo "Contributing to ceremony phase 1..."
(echo "Automated entropy for first contribution phase - $(date) - random_seed_123") | snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v -e

# Step 4: Phase 2
echo "Preparing phase 2..."
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

# Step 5: Generate zkey
echo "Generating zkey..."
snarkjs groth16 setup supply_chain.r1cs pot12_final.ptau supply_chain_0000.zkey

# Step 6: Contribute to phase 2 of the ceremony with automated entropy
echo "Contributing to ceremony phase 2..."
(echo "Automated entropy for second contribution phase - $(date) - random_seed_456") | snarkjs zkey contribute supply_chain_0000.zkey supply_chain_0001.zkey --name="1st Contributor" -v -e

# Step 7: Export verification key
echo "Exporting verification key..."
snarkjs zkey export verificationkey supply_chain_0001.zkey verification_key.json

echo "Compilation and setup completed successfully!"

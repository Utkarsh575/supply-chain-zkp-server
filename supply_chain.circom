pragma circom 2.1.4;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template FarmProof() {
    // A's private inputs - all inputs will be numerical
    signal input farmId;
    signal input plusCodeNum;
    signal input batchId;
    signal input grade;
    
    // B's inputs - timestamps for manufacturing and expiry
    signal input mfgDate;
    signal input expiryDate;
    
    // Public inputs that B knows
    signal input publicBatchId;
    signal input publicGrade;
    
    // Public output
    signal output hashOfFarmDetails;
    
    // Verify that B's known information matches A's input
    component isEqualBatch = IsEqual();
    isEqualBatch.in[0] <== batchId;
    isEqualBatch.in[1] <== publicBatchId;
    isEqualBatch.out === 1;

    component isEqualGrade = IsEqual();
    isEqualGrade.in[0] <== grade;
    isEqualGrade.in[1] <== publicGrade;
    isEqualGrade.out === 1;
    
    // Calculate hash of farm details for verification
    component poseidon = Poseidon(4);
    poseidon.inputs[0] <== farmId;
    poseidon.inputs[1] <== plusCodeNum;
    poseidon.inputs[2] <== batchId;
    poseidon.inputs[3] <== grade;
    
    hashOfFarmDetails <== poseidon.out;
}

component main = FarmProof();

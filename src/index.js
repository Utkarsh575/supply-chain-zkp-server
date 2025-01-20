const express = require('express');
const { exec } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
app.use(bodyParser.json());

// Storage structure
const STORAGE_DIR = './proofs';
const CIRCUIT_DIR = './circuit';

// Ensure storage directories exist
async function initializeDirectories() {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    await fs.mkdir(CIRCUIT_DIR, { recursive: true });
}

// Helper function to generate unique ID
function generateUniqueId() {
    return crypto.randomBytes(16).toString('hex');
}

// Convert string inputs to circuit-compatible numbers
function convertInputs(input) {
    const gradeMap = {
        'A': 1,
        'B': 2,
        'C': 3,
        'D': 4,
        'F': 5
    };

    // Convert all values to numbers and ensure they're within field size
    return {
        farmId: parseInt(input.farmId) || 0,
        plusCodeNum: parseInt(input.plusCode.replace(/[^0-9]/g, '')) || 0,
        batchId: parseInt(input.batchId.replace(/[^0-9]/g, '')) || 0,
        grade: gradeMap[input.grade.toUpperCase()] || 0,
        mfgDate: parseInt(input.mfgDate) || Math.floor(Date.now() / 1000),
        expiryDate: parseInt(input.expiryDate) || Math.floor(Date.now() / 1000) + 31536000, // Default 1 year
        publicBatchId: parseInt(input.batchId.replace(/[^0-9]/g, '')) || 0,
        publicGrade: gradeMap[input.grade.toUpperCase()] || 0
    };
}

// Store proof data
async function storeProofData(proofId, data) {
    const proofDir = path.join(STORAGE_DIR, proofId);
    await fs.mkdir(proofDir, { recursive: true });
    await fs.writeFile(
        path.join(proofDir, 'data.json'), 
        JSON.stringify(data, null, 2)
    );
}

// API endpoint for Party A to submit initial data
app.post('/api/submit-farm-data', async (req, res) => {
    try {
        const proofId = generateUniqueId();
        const convertedInput = convertInputs(req.body);
        
        // Store initial data
        await storeProofData(proofId, {
            status: 'pending_manufacturer',
            farmData: convertedInput,
            timestamp: Date.now()
        });

        res.json({
            success: true,
            proofId,
            message: 'Farm data submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting farm data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process farm data'
        });
    }
});

// API endpoint for Party B to add manufacturing data
app.post('/api/add-manufacturing-data/:proofId', async (req, res) => {
    try {
        const { proofId } = req.params;
        const proofDir = path.join(STORAGE_DIR, proofId);
        
        // Read existing data
        const existingData = JSON.parse(
            await fs.readFile(path.join(proofDir, 'data.json'), 'utf8')
        );

        // Update with manufacturing data
        const combinedInput = {
            ...existingData.farmData,
            mfgDate: parseInt(req.body.mfgDate) || Math.floor(Date.now() / 1000),
            expiryDate: parseInt(req.body.expiryDate) || Math.floor(Date.now() / 1000) + 31536000
        };

        // Store input for witness generation
        await fs.writeFile(
            path.join(proofDir, 'input.json'),
            JSON.stringify(combinedInput, null, 2)
        );

        // Update status
        existingData.status = 'pending_proof_generation';
        existingData.manufacturingData = {
            mfgDate: combinedInput.mfgDate,
            expiryDate: combinedInput.expiryDate
        };
        await storeProofData(proofId, existingData);

        // Generate proof
        await generateProof(proofId);

        res.json({
            success: true,
            message: 'Manufacturing data added and proof generated',
            verificationLink: `/verify/${proofId}`
        });
    } catch (error) {
        console.error('Error processing manufacturing data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process manufacturing data'
        });
    }
});

// Generate ZK proof
async function generateProof(proofId) {
    const proofDir = path.join(STORAGE_DIR, proofId);
    
    try {
        // Generate witness
        await execPromise(
            `node supply_chain_js/generate_witness.js supply_chain_js/supply_chain.wasm ${path.join(proofDir, 'input.json')} ${path.join(proofDir, 'witness.wtns')}`
        );

        // Generate proof
        await execPromise(
            `snarkjs groth16 prove supply_chain_0001.zkey ${path.join(proofDir, 'witness.wtns')} ${path.join(proofDir, 'proof.json')} ${path.join(proofDir, 'public.json')}`
        );

        // Update status
        const data = JSON.parse(await fs.readFile(path.join(proofDir, 'data.json'), 'utf8'));
        data.status = 'proof_generated';
        await storeProofData(proofId, data);
    } catch (error) {
        console.error('Error in proof generation:', error);
        throw error;
    }
}

// API endpoint to verify proof
app.get('/api/verify/:proofId', async (req, res) => {
    try {
        const { proofId } = req.params;
        const proofDir = path.join(STORAGE_DIR, proofId);

        // Verify the proof
        const { stdout } = await execPromise(
            `snarkjs groth16 verify verification_key.json ${path.join(proofDir, 'public.json')} ${path.join(proofDir, 'proof.json')}`
        );

        const isValid = stdout.includes('OK');

        res.json({
            success: true,
            isValid,
            proofId,
            verificationResult: isValid ? 'Valid proof' : 'Invalid proof'
        });
    } catch (error) {
        console.error('Error verifying proof:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify proof'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await initializeDirectories();
    console.log(`Server running on port ${PORT}`);
});

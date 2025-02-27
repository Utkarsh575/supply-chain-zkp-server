const express = require("express");
const { exec } = require("child_process");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const util = require("util");
const execPromise = util.promisify(exec);

const app = express();
app.use(bodyParser.json());

// Storage structure
const STORAGE_DIR = "./proofs";
// const CIRCUIT_DIR = './circuit';

// Ensure storage directories exist
async function initializeDirectories() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  // await fs.mkdir(CIRCUIT_DIR, { recursive: true });
}

// Helper function to generate unique ID
function generateUniqueId() {
  return crypto.randomBytes(16).toString("hex");
}

// Convert string inputs to circuit-compatible numbers
function convertInputs(input) {
  const gradeMap = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    F: 5,
  };

  // Convert all values to numbers and ensure they're within field size
  return {
    farmId: parseInt(input.farmId) || 0,
    plusCodeNum: parseInt(input.plusCode.replace(/[^0-9]/g, "")) || 0,
    batchId: parseInt(input.batchId.replace(/[^0-9]/g, "")) || 0,
    grade: gradeMap[input.grade.toUpperCase()] || 0,
    mfgDate: parseInt(input.mfgDate) || Math.floor(Date.now() / 1000),
    expiryDate:
      parseInt(input.expiryDate) || Math.floor(Date.now() / 1000) + 31536000, // Default 1 year
    publicBatchId: parseInt(input.batchId.replace(/[^0-9]/g, "")) || 0,
    publicGrade: gradeMap[input.grade.toUpperCase()] || 0,
  };
}

// Store proof data
async function storeProofData(proofId, data) {
  const proofDir = path.join(STORAGE_DIR, proofId);
  await fs.mkdir(proofDir, { recursive: true });
  await fs.writeFile(
    path.join(proofDir, "data.json"),
    JSON.stringify(data, null, 2)
  );
}

function hashProofId(proofId) {
  return crypto.createHash("sha256").update(proofId).digest("hex");
}

// API endpoint for Party A to submit initial data
app.post("/api/submit-farm-data", async (req, res) => {
  try {
    const proofId = generateUniqueId();
    const hashedProofId = hashProofId(proofId);
    const convertedInput = convertInputs(req.body);

    await storeProofData(proofId, {
      proofId,
      hashedProofId,
      status: "pending_manufacturer",
      farmData: convertedInput,
      timestamp: Date.now(),
    });

    res.json({
      success: true,
      proofId,
      hashedProofId,
      message: "Farm data submitted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to process farm data" });
  }
});

// API endpoint for Party B to add manufacturing data
app.post("/api/add-manufacturing-data/:proofId", async (req, res) => {
  try {
    const { proofId } = req.params;
    const proofDir = path.join(STORAGE_DIR, proofId);
    const dataPath = path.join(proofDir, "data.json");

    let existingData = JSON.parse(await fs.readFile(dataPath, "utf8"));

    if (existingData.farmData.batchId !== req.body.batchId) {
      return res.status(400).json({
        success: false,
        error: "Batch ID does not match the original record.",
      });
    }

    existingData["farmData"]["mfgDate"] = parseInt(req.body.mfgDate);
    existingData["farmData"]["expiryDate"] = parseInt(req.body.expiryDate);

    console.log(existingData);

    const combinedInput = {
      ...existingData.farmData,
      mfgDate: parseInt(req.body.mfgDate),
      expiryDate: parseInt(req.body.expiryDate),
    };

    await fs.writeFile(
      path.join(proofDir, "input.json"),
      JSON.stringify(combinedInput, null, 2)
    );

    existingData.status = "pending_proof_generation";
    existingData.manufacturingData = {
      mfgDate: combinedInput.mfgDate,
      expiryDate: combinedInput.expiryDate,
    };
    await storeProofData(proofId, existingData);

    await generateProof(proofId);

    res.json({
      success: true,
      message: "Manufacturing data added and proof generated",
      verificationLink: `/verify/hashed/${existingData.hashedProofId}`,
    });
  } catch (error) {
    console.error("Error processing manufacturing data:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to process manufacturing data" });
  }
});

// Generate ZK proof
async function generateProof(proofId) {
  const proofDir = path.join(STORAGE_DIR, proofId);

  try {
    // Generate witness
    await execPromise(
      `node supply_chain_js/generate_witness.js supply_chain_js/supply_chain.wasm ${path.join(
        proofDir,
        "input.json"
      )} ${path.join(proofDir, "witness.wtns")}`
    );

    // Generate proof
    await execPromise(
      `snarkjs groth16 prove supply_chain_0001.zkey ${path.join(
        proofDir,
        "witness.wtns"
      )} ${path.join(proofDir, "proof.json")} ${path.join(
        proofDir,
        "public.json"
      )}`
    );

    // Update status
    const data = JSON.parse(
      await fs.readFile(path.join(proofDir, "data.json"), "utf8")
    );
    data.status = "proof_generated";
    await storeProofData(proofId, data);
  } catch (error) {
    console.error("Error in proof generation:", error);
    throw error;
  }
}

// API endpoint to verify proof
app.get("/api/verify/:proofId", async (req, res) => {
  try {
    const { proofId } = req.params;
    const proofDir = path.join(STORAGE_DIR, proofId);
    const dataPath = path.join(proofDir, "data.json");

    const proofData = JSON.parse(await fs.readFile(dataPath, "utf8"));

    const { stdout } = await execPromise(
      `snarkjs groth16 verify verification_key.json ${path.join(
        proofDir,
        "public.json"
      )} ${path.join(proofDir, "proof.json")}`
    );

    const isValid = stdout.includes("OK");

    res.json({
      success: true,
      isValid,
      verificationResult: isValid ? "Valid proof" : "Invalid proof",
      batchId: proofData.farmData.batchId,
      grade: proofData.farmData.grade,
      expiryDate: new Date(
        proofData.farmData.expiryDate * 1000
      ).toLocaleDateString(),
      proofGeneratedAt: new Date(proofData.timestamp).toLocaleDateString(),
    });
  } catch (error) {
    console.error("Error verifying proof:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify proof",
    });
  }
});

app.get("/api/verify/hashed/:hashedProofId", async (req, res) => {
  try {
    const { hashedProofId } = req.params;
    const proofDirs = await fs.readdir(STORAGE_DIR);

    for (const proofId of proofDirs) {
      const data = JSON.parse(
        await fs.readFile(path.join(STORAGE_DIR, proofId, "data.json"), "utf8")
      );

      if (data.hashedProofId === hashedProofId) {
        return res.redirect(`/api/verify/${proofId}`);
      }
    }

    res.status(404).json({ success: false, error: "Proof not found." });
  } catch (error) {
    console.error("Error verifying hashed proof:", error);
    res.status(500).json({ success: false, error: "Verification failed" });
  }
});

// API to get all proofs for farmers

app.get("/api/get-proof-status", async (req, res) => {
  try {
    const proofDirs = await fs.readdir(STORAGE_DIR);
    const proofs = [];

    for (const proofId of proofDirs) {
      const data = JSON.parse(
        await fs.readFile(path.join(STORAGE_DIR, proofId, "data.json"), "utf8")
      );
      proofs.push(data);
    }

    res.json({ success: true, proofs });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to retrieve proofs" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await initializeDirectories();
  console.log(`Server running on port ${PORT}`);
});

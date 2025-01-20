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
"mfgDate": "1705708800",
"expiryDate": "1737331200"
}'

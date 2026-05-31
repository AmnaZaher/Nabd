const fs = require('fs');

const rawText = fs.readFileSync('scratch/swagger_fetched.json', 'utf8');
const jsonStartIndex = rawText.indexOf('{');
const data = JSON.parse(rawText.substring(jsonStartIndex));

const targets = [
    '/api/Radiology/requests/today',
    '/api/RadiologyExam/GetPatientInfo/{patientId}',
    '/api/RadiologyExam/GetReportsByPatient/{patientId}'
];

for (const t of targets) {
    console.log(`=== ENDPOINT: ${t} ===`);
    if (data.paths && data.paths[t]) {
        console.log(JSON.stringify(data.paths[t], null, 2));
    } else {
        console.log("Not found in paths!");
    }
    console.log();
}

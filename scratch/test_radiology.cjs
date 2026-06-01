const https = require('https');

function post(urlPath, payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const options = {
            hostname: 'nabd.runasp.net',
            port: 443,
            path: urlPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        const req = https.request(options, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function get(urlPath, token) {
    return new Promise((resolve, reject) => {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const options = {
            hostname: 'nabd.runasp.net',
            port: 443,
            path: urlPath,
            method: 'GET',
            headers: headers
        };
        const req = https.request(options, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function run() {
    try {
        console.log("Logging in...");
        const loginRes = await post('/api/Account/login', {
            username: "moali.xz.00a@gmail.com",
            password: "P@ssw0rd"
        });
        console.log("Login Res status:", loginRes.isSuccess);
        const token = loginRes?.data?.token || loginRes?.data?.accessToken || loginRes?.accessToken;
        console.log("Token obtained:", token ? "Yes" : "No");

        console.log("\n1. Fetching today's requests (/api/Radiology/requests/today)...");
        const todayRequests = await get('/api/Radiology/requests/today', token);
        console.log("Today requests response sample:", JSON.stringify(todayRequests, null, 2).slice(0, 1000));
        
        let patientId = 1;
        if (todayRequests?.data && todayRequests.data.length > 0) {
            patientId = todayRequests.data[0].patientId || todayRequests.data[0].patientID || 1;
            console.log("Found patientId from today's requests:", patientId);
        }

        console.log(`\n2. Fetching patient info for patientId ${patientId} (/api/RadiologyExam/GetPatientInfo/${patientId})...`);
        const patientInfo = await get(`/api/RadiologyExam/GetPatientInfo/${patientId}`, token);
        console.log("Patient info response sample:", JSON.stringify(patientInfo, null, 2).slice(0, 1000));

        console.log(`\n3. Fetching reports by patient for patientId ${patientId} (/api/RadiologyExam/GetReportsByPatient/${patientId})...`);
        const reports = await get(`/api/RadiologyExam/GetReportsByPatient/${patientId}`, token);
        console.log("Reports response sample:", JSON.stringify(reports, null, 2).slice(0, 1000));

    } catch (err) {
        console.error("Error in scratch script:", err);
    }
}

run();

const https = require('https');

async function testApi() {
    // Login
    const loginRes = await fetch('https://nabd.runasp.net/api/Account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: "admin1", password: "1" })
    });
    
    if (!loginRes.ok) {
        console.error("Login failed:", await loginRes.text());
        return;
    }
    const loginData = await loginRes.json();
    const token = loginData.token || loginData.data?.token || loginData.accessToken;
    console.log("Logged in successfully! Token length:", token.length);

    // Fetch Lab Orders
    const ordersRes = await fetch('https://nabd.runasp.net/api/Lab/LabOrders?PageSize=5', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!ordersRes.ok) {
        console.error("Failed to fetch lab orders:", await ordersRes.text());
        return;
    }
    const ordersData = await ordersRes.json();
    const orders = ordersData.data || ordersData.items || ordersData;
    console.log("Lab Orders: found", orders.length, "items.");
    if (orders.length > 0) {
        console.log("First Lab Order sample:", JSON.stringify(orders[0], null, 2));
        
        // Let's get the visit ID or request ID from this order
        const visitId = orders[0].visitId;
        const requestId = orders[0].id;
        console.log(`Using VisitId: ${visitId}, RequestId: ${requestId}`);

        if (visitId) {
            // Fetch Patient Visit Lab Requests Info
            const infoRes = await fetch(`https://nabd.runasp.net/api/Lab/PatientVisitLabRequestsInfo/${visitId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (infoRes.ok) {
                const infoData = await infoRes.json();
                console.log("PatientVisitLabRequestsInfo Response:", JSON.stringify(infoData, null, 2));
            } else {
                console.log(`PatientVisitLabRequestsInfo failed with code ${infoRes.status}:`, await infoRes.text());
            }

            // Fetch Visit Lab Requests
            const requestsRes = await fetch(`https://nabd.runasp.net/api/Lab/VisitLabRequests/${visitId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (requestsRes.ok) {
                const requestsData = await requestsRes.json();
                console.log("VisitLabRequests Response:", JSON.stringify(requestsData, null, 2));
            } else {
                console.log(`VisitLabRequests failed with code ${requestsRes.status}:`, await requestsRes.text());
            }
        }
    }
}

testApi().catch(console.error);

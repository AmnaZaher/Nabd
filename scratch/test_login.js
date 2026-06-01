async function tryLogin(email, password) {
    const url = 'https://nabd.runasp.net/api/Account/login';
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password })
        });
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            return null;
        }
        const token = data.token || data.data?.token || data.accessToken || data.data?.accessToken;
        if (token) {
            return token;
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }
    return null;
}

async function testApi() {
    let token = await tryLogin("admin1", "1");
    
    if (!token) {
        console.error("All logins failed!");
        return;
    }
    console.log("Logged in successfully!");
    
    // Fetch lab orders
    const ordersRes = await fetch('https://nabd.runasp.net/api/Lab/GetResults', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (ordersRes.ok) {
        const data = await ordersRes.json();
        const list = data.data || data;
        console.log("Results list count:", list.length);
        if (list.length > 0) {
            console.log("First result item:", JSON.stringify(list[0], null, 2));
            const visitId = list[0].visitId || list[0].visit?.id;
            console.log("Found visitId from result:", visitId);
            if (visitId) {
                // Fetch VisitLabRequests
                const reqRes = await fetch(`https://nabd.runasp.net/api/Lab/VisitLabRequests/${visitId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (reqRes.ok) {
                    const reqData = await reqRes.json();
                    console.log("VisitLabRequests Response:", JSON.stringify(reqData, null, 2));
                } else {
                    console.error("VisitLabRequests failed:", await reqRes.text());
                }
            }
        }
    } else {
        console.error("GetResults failed:", await ordersRes.text());
    }
}

testApi().catch(console.error);

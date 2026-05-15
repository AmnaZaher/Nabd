const https = require('https');

async function testApi() {
    // 1. Login to get token
    const loginRes = await fetch('https://nabd.runasp.net/api/Auth/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: "admin1@mail.com", password: "1" })
    });
    
    let token = null;
    if (!loginRes.ok) {
        console.error("Login failed", await loginRes.text());
        // try another admin
        const loginRes2 = await fetch('https://nabd.runasp.net/api/Auth/Login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: "admin@mail.com", password: "Password123!" })
        });
        if (!loginRes2.ok) {
            console.error("Admin 2 login failed", await loginRes2.text());
            return;
        }
        const loginData = await loginRes2.json();
        token = loginData.token || loginData.data?.token || loginData.accessToken;
    } else {
        const loginData = await loginRes.json();
        token = loginData.token || loginData.data?.token || loginData.accessToken;
    }
    
    if (!token) {
        console.error("No token found");
        return;
    }
    
    console.log("Logged in!");
    
    // 2. Fetch staff list to get a real UserId
    const listRes = await fetch('https://nabd.runasp.net/api/Admin/Staffs?PageSize=10', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const listData = await listRes.json();
    const items = listData.items || listData.data?.items || listData.data || [];
    const doctor = items.find(i => i.role === 'Doctor' || i.role === 2);
    
    if (!doctor) {
        console.error("No doctor found");
        return;
    }
    
    console.log("Found doctor ID:", doctor.id);
    
    // 3. Hit the new endpoint
    const profileRes = await fetch(`https://nabd.runasp.net/api/Users/Doctor/Profile/${doctor.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const profileText = await profileRes.text();
    console.log("PROFILE API RESPONSE:");
    console.log(profileText);
    
    const require_fs = require('fs');
    require_fs.writeFileSync('profile_dump.json', profileText);
}

testApi().catch(console.error);

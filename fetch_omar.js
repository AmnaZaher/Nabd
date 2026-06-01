
async function testApi() {
    // 1. Login to get token
    const loginRes = await fetch('https://nabd.runasp.net/api/Account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: "admin1", password: "1" })
    });
    
    let token = null;
    if (!loginRes.ok) {
        console.error("Login failed", await loginRes.text());
        return;
    }
    const loginData = await loginRes.json();
    token = loginData.token || loginData.data?.token || loginData.accessToken;
    
    if (!token) {
        console.error("No token found");
        return;
    }
    
    console.log("Logged in!");
    
    // 2. Fetch staff list to get Omar Mohamed
    const listRes = await fetch('https://nabd.runasp.net/api/Admin/Staffs?PageSize=100', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const listData = await listRes.json();
    const items = listData.items || listData.data?.items || listData.data || [];
    const omar = items.find(i => i.name === 'Omar Mohamed' || i.fullNameEnglish === 'Omar Mohamed' || (i.name && i.name.includes('Omar')));
    
    if (!omar) {
        console.error("Omar Mohamed not found in staff list");
        console.log("Here are some names: ", items.map(i => i.name || i.fullNameEnglish));
        return;
    }
    
    console.log("Found Omar ID:", omar.id);
    console.log("Omar's list object:", JSON.stringify(omar, null, 2));
    
    // 3. Hit the lab technician profile endpoint
    const profileRes = await fetch(`https://nabd.runasp.net/api/Users/LabTechnician/Profile/${omar.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const profileText = await profileRes.text();
    console.log("PROFILE API RESPONSE:");
    console.log(profileText);
}

testApi().catch(console.error);

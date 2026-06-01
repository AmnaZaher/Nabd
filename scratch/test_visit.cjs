const https = require('https');

async function tryLogin(username, password) {
    const url = 'https://nabd.runasp.net/api/Account/login';
    console.log(`Trying ${url} with username="${username}"...`);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Body: ${text.substring(0, 300)}`);
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
    let token = await tryLogin("admin1@mail.com", "1");
    if (!token) token = await tryLogin("admin@mail.com", "Password123!");
    if (!token) token = await tryLogin("moali.xz.00a@gmail.com", "P@ssw0rd");
    
    if (!token) {
        console.error("All logins failed!");
        return;
    }
    console.log("Logged in successfully! Token starts with:", token.substring(0, 15));
}

testApi().catch(console.error);

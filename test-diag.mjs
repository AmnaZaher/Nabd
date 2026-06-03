
async function testApi() {
    const loginRes = await fetch("https://nabd.runasp.net/api/Auth/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@mail.com", password: "Password123!" })
    });
    let loginData = await loginRes.json();
    let token = loginData.token || loginData.data?.token || loginData.accessToken;

    if(!token) {
        const loginRes2 = await fetch("https://nabd.runasp.net/api/Auth/Login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin1@mail.com", password: "1" })
        });
        loginData = await loginRes2.json();
        token = loginData.token || loginData.data?.token || loginData.accessToken;
    }
    
    console.log("Token:", !!token);

    const payload = {
        diagnosis: "e;w;ldjjeopr",
        icdCode: "",
        diagnosisType: 1,
        notes: "r43r3r"
    };

    const res = await fetch("https://nabd.runasp.net/api/Visit/23423/diagnoses", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log(res.status, text);
    
    // Test with null
    const payload2 = {
        diagnosis: "test-diag",
        icdCode: null,
        diagnosisType: 1,
        notes: null
    };
    const res2 = await fetch("https://nabd.runasp.net/api/Visit/23423/diagnoses", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload2)
    });
    console.log("With nulls:", res2.status, await res2.text());
}
testApi().catch(console.error);


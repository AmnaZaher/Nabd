// scratch/test-details.js
async function test() {
    console.log('Logging in...');
    const loginRes = await fetch('https://nabd.runasp.net/api/Account/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: "moali.xz.00a@gmail.com",
            password: "P@ssw0rd"
        })
    });
    
    console.log('Login Status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2).substring(0, 500));
    
    const token = loginData.data?.token || loginData.token;
    if (!token) {
        console.error('Failed to get token!');
        return;
    }
    
    console.log('Fetching lab test details for ID 21...');
    const detailsRes = await fetch('https://nabd.runasp.net/api/Lab/LabCatologs?id=21', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    console.log('Details Status:', detailsRes.status);
    const detailsText = await detailsRes.text();
    console.log('Details Body:', JSON.stringify(JSON.parse(detailsText), null, 2));
}

test();

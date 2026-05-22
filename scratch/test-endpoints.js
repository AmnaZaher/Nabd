// scratch/test-endpoints.js
const testUrls = [
    'https://nabd.runasp.net/api/Lab/GetAnalysis?id=21',
    'https://nabd.runasp.net/api/Lab/LabCatologs/21',
    'https://nabd.runasp.net/api/Lab/LabCatologs?id=21',
    'https://nabd.runasp.net/api/Lab/LabCatolog/21',
    'https://nabd.runasp.net/api/Lab/LabCatolog?id=21',
    'https://nabd.runasp.net/api/Lab/GetAnalysis/21',
    'https://nabd.runasp.net/api/Lab/Analysis/21',
    'https://nabd.runasp.net/api/Lab/Analysis?id=21'
];

async function probe() {
    console.log('Probing potential Lab detail endpoints...');
    for (const url of testUrls) {
        try {
            const res = await fetch(url);
            console.log(`URL: ${url} -> Status: ${res.status}`);
            if (res.status === 200) {
                const text = await res.text();
                console.log(`  Success body (first 200 chars): ${text.substring(0, 200)}`);
            }
        } catch (err) {
            console.log(`URL: ${url} -> Fetch Error: ${err.message}`);
        }
    }
}

probe();

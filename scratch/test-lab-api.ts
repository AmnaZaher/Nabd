// scratch/test-lab-api.ts
const testApi = async () => {
    const url = 'https://nabd.runasp.net/api/Lab/GetCataliog';
    try {
        const response = await fetch(url);
        console.log('Status:', response.status);
        console.log('Headers:', JSON.stringify(Object.fromEntries(response.headers), null, 2));
        
        const text = await response.text();
        console.log('Raw Response Body:', text.substring(0, 500));
        
        if (response.ok) {
            const data = JSON.parse(text);
            console.log('API Response Structure:');
            console.log(JSON.stringify(data, null, 2).substring(0, 2000));
        }
    } catch (error) {
        console.error('Error fetching API:', error);
    }
};

testApi();

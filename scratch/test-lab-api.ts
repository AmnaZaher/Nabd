// scratch/test-lab-api.ts
const testApi = async () => {
    const url = 'https://nabd.runasp.net/api/Lab/GetCataliog';
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('API Response Structure:');
        console.log(JSON.stringify(data, null, 2).substring(0, 2000));
    } catch (error) {
        console.error('Error fetching API:', error);
    }
};

testApi();

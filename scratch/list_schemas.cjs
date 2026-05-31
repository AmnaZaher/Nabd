const fs = require('fs');

const rawText = fs.readFileSync('scratch/swagger_fetched.json', 'utf8');
const jsonStartIndex = rawText.indexOf('{');
const data = JSON.parse(rawText.substring(jsonStartIndex));

const schemas = Object.keys(data.components?.schemas || {});
console.log("=== SCHEMAS LIST ===");
console.log(schemas.filter(s => s.toLowerCase().includes('radiology') || s.toLowerCase().includes('report') || s.toLowerCase().includes('exam') || s.toLowerCase().includes('patient')).join('\n'));

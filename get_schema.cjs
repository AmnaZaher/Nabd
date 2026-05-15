const fs = require('fs');
const data = JSON.parse(fs.readFileSync('swagger_latest.json', 'utf8'));
const dto = data.components.schemas['CreateClinicDto'];
console.log(JSON.stringify(dto, null, 2));

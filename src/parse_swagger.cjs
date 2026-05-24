const fs = require('fs');
let dataStr = fs.readFileSync('C:\\Users\\Windows 10\\.gemini\\antigravity\\brain\\0c16d1bf-7fdb-479e-9813-f166d0b14b9e\\.system_generated\\steps\\94\\content.md', 'utf8');
if (dataStr.includes('```json')) {
    dataStr = dataStr.split('```json')[1].split('```')[0];
} else {
    dataStr = dataStr.substring(dataStr.indexOf('{'));
}
const data = JSON.parse(dataStr);
const paths = ['/api/Lab/PatientVisitLabRequestsInfo/{visitId}', '/api/Lab/VisitLabRequests/{Id}'];
paths.forEach(p => {
    const op = data.paths[p]?.get;
    if(op) {
        const schema = op.responses['200']?.content?.['application/json']?.schema;
        let ref = schema?.$ref || schema?.items?.$ref;
        if (!ref && schema?.properties?.data) {
           const dataSchema = schema.properties.data;
           ref = dataSchema?.$ref || dataSchema?.items?.$ref;
        }
        if (ref) {
            console.log(p, 'returns schema:', ref);
            console.log(JSON.stringify(data.components.schemas[ref.split('/').pop()], null, 2));
        } else {
            console.log(p, 'returns:', JSON.stringify(schema, null, 2));
        }
    }
});

const fs = require('fs');

// Simple parse to check node transforms or bounds if any
const fileBuffer = fs.readFileSync('public/lancer_evo6.glb');
const jsonChunkLength = fileBuffer.readUInt32LE(12);
const jsonStr = fileBuffer.toString('utf8', 20, 20 + jsonChunkLength);
const json = JSON.parse(jsonStr);

console.log('Nodes sample (first 10):');
json.nodes.slice(0, 10).forEach((n, i) => console.log(i, n));

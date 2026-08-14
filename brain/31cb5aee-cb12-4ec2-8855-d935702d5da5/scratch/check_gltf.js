const fs = require('fs');

const fileBuffer = fs.readFileSync('public/lancer_evo6.glb');
const magic = fileBuffer.toString('utf8', 0, 4);
console.log('Magic:', magic);

if (magic === 'glTF') {
  const version = fileBuffer.readUInt32LE(4);
  const length = fileBuffer.readUInt32LE(8);
  const jsonChunkLength = fileBuffer.readUInt32LE(12);
  const jsonChunkType = fileBuffer.toString('utf8', 16, 20);
  console.log({ version, length, jsonChunkLength, jsonChunkType });

  const jsonStr = fileBuffer.toString('utf8', 20, 20 + jsonChunkLength);
  const json = JSON.parse(jsonStr);
  console.log('Extensions used:', json.extensionsUsed);
  console.log('Extensions required:', json.extensionsRequired);
  console.log('Scene count:', json.scenes ? json.scenes.length : 0);
  console.log('Nodes count:', json.nodes ? json.nodes.length : 0);
  console.log('Meshes count:', json.meshes ? json.meshes.length : 0);
  if (json.scenes && json.scenes[0]) {
    console.log('Default scene nodes:', json.scenes[0].nodes);
  }
}

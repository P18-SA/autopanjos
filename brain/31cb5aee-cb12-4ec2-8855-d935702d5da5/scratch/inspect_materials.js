const fs = require('fs');

function inspectModel(filename) {
  console.log(`=== Inspecting ${filename} ===`);
  const fileBuffer = fs.readFileSync(filename);
  const jsonChunkLength = fileBuffer.readUInt32LE(12);
  const jsonStr = fileBuffer.toString('utf8', 20, 20 + jsonChunkLength);
  const json = JSON.parse(jsonStr);

  if (json.materials) {
    console.log('Materials list:');
    json.materials.forEach((m, i) => {
      console.log(`  [Mat ${i}] name: "${m.name}"`);
    });
  }

  if (json.nodes) {
    console.log('Mesh node names (sample):');
    json.nodes.filter(n => n.name).forEach((n, i) => {
      const name = n.name.toLowerCase();
      if (
        name.includes('light') ||
        name.includes('glass') ||
        name.includes('lamp') ||
        name.includes('head') ||
        name.includes('front') ||
        name.includes('lens') ||
        name.includes('glow')
      ) {
        console.log(`  [Node] name: "${n.name}"`);
      }
    });
  }
}

inspectModel('public/2026_bmw_m2_cs.glb');
inspectModel('public/lancer_evo6.glb');

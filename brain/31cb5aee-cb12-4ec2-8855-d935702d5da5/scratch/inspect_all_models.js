const fs = require('fs');

const files = [
  'public/2026_bmw_m2_cs.glb',
  'public/lancer_evo6.glb',
  'public/1995_dodge_viper_rt_10_sr1.glb',
  'public/2023_hennessey_venom_f5_revolution_coupe.glb',
  'public/2025_pagani_huayra_codalunga_speedster.glb'
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`FILE NOT FOUND: ${file}`);
    return;
  }
  const fileBuffer = fs.readFileSync(file);
  const jsonChunkLength = fileBuffer.readUInt32LE(12);
  const jsonStr = fileBuffer.toString('utf8', 20, 20 + jsonChunkLength);
  const json = JSON.parse(jsonStr);

  console.log(`\n=== ${file} ===`);
  if (json.materials) {
    console.log('  Materials:', json.materials.map(m => m.name));
  }
});

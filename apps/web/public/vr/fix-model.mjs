import { NodeIO } from '@gltf-transform/core';
import { center } from '@gltf-transform/functions';

const io = new NodeIO();

async function run() {
  console.log("Reading model...");
  const doc = await io.read('public/models/thermos-hydration-bottle.glb');
  
  const root = doc.getRoot();
  const scene = root.getDefaultScene() || root.listScenes()[0];

  // Scale down by 10x
  scene.listChildren().forEach(node => {
    const s = node.getScale();
    node.setScale([s[0] * 0.1, s[1] * 0.1, s[2] * 0.1]);
  });

  // Center the model above the origin (so it sits on the floor)
  await doc.transform(center({ pivot: 'below' }));
  
  console.log("Writing model...");
  await io.write('public/models/thermos-hydration-bottle.glb', doc);
  console.log("Done!");
}

run().catch(console.error);

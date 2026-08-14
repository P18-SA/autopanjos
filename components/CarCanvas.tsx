"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

interface CarCanvasProps {
  lightsOn?: boolean;
  modelPath?: string;
  scale?: number; // 👈 ADJUST MODEL SCALE HERE (Default: 3.0)
  /**
   * Per-model Y-axis correction in radians, for GLBs that were authored
   * facing away from the camera. Applied to the model itself, not to the
   * interactive carGroup, so the mouse-follow rotation is unaffected.
   * Default 0 — only set it for models that actually need it.
   */
  modelRotationY?: number;
}

export default function CarCanvas({
  lightsOn = false,
  modelPath = "/2026_bmw_m2_cs.glb",
  scale = 4, // 👈 Increase (e.g., 3.5, 4.0) to make car larger, decrease (e.g., 2.5) to make smaller
  modelRotationY = 0,
}: CarCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const lightsOnRef = useRef(lightsOn);
  useEffect(() => {
    lightsOnRef.current = lightsOn;
  }, [lightsOn]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / (container.clientHeight || 1),
      0.1,
      1000
    );
    camera.position.set(0, 0.25, 4.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight || 500);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Explicit color management: sRGB output so tone-mapped linear light
    // gets encoded correctly for the display (this was already the three.js
    // default in this version, but making it explicit avoids surprises if
    // three is ever upgraded/downgraded).
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Was 1.4 with no IBL. Now that scene.environment provides real ambient
    // light, 1.4 would blow out highlights — 1.0 is the neutral starting
    // point. Tweak between 0.8 (moodier) and 1.4 (brighter) once the HDRI
    // is loaded and you can see the actual result.
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // -----------------------------------------------------------------
    // IMAGE-BASED LIGHTING (IBL)
    // Replaces the old flat AmbientLight(2.8) as the source of ambient
    // fill: instead of every face getting the same uniform brightness
    // regardless of angle, PBR materials now sample this HDRI for both
    // diffuse ambient light AND specular reflections. This is what makes
    // metal/paint look like a real material instead of flat-shaded plastic.
    // -----------------------------------------------------------------
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader().load("/hdri/venice_sunset_1k.hdr", (hdrTexture) => {
      const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
      scene.environment = envMap;
      // Deliberately NOT setting scene.background here: this canvas is
      // transparent (alpha: true) and layered on top of the page UI
      // (see app/page.tsx). Painting the equirect HDRI as background
      // would cover the header/title/content behind it.
      hdrTexture.dispose();
      pmremGenerator.dispose();
    });

    // Accent lights — ON TOP of the IBL, not replacing it. Since ambient
    // fill now comes from the HDRI, these are much lower intensity than
    // before; they only need to add directional shape (key), lift shadow
    // side a touch (fill), and separate the car from the background (rim).
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    // bias fixes shadow acne (self-shadowing noise); normalBias fixes
    // peter-panning (shadow detaching from the object) on curved surfaces.
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd8eaff, 0.5);
    fillLight.position.set(-6, 4, 3);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xff5533, 1.2);
    backLight.position.set(0, 5, -6);
    scene.add(backLight);

    // Interactive Car Group
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    // Front Headlight Projection SpotLights
    const headlightLeft = new THREE.SpotLight(0xe6f4ff, 0, 30, Math.PI / 4, 0.4, 1);
    const targetLeft = new THREE.Object3D();
    targetLeft.position.set(-1.0, -0.3, 7.0);
    carGroup.add(targetLeft);
    headlightLeft.target = targetLeft;
    carGroup.add(headlightLeft);

    const headlightRight = new THREE.SpotLight(0xe6f4ff, 0, 30, Math.PI / 4, 0.4, 1);
    const targetRight = new THREE.Object3D();
    targetRight.position.set(1.0, -0.3, 7.0);
    carGroup.add(targetRight);
    headlightRight.target = targetRight;
    carGroup.add(headlightRight);

    // Front Headlight Fascia Glow Point Lights
    const headlightGlowLeft = new THREE.PointLight(0xffffff, 0, 4.0);
    carGroup.add(headlightGlowLeft);

    const headlightGlowRight = new THREE.PointLight(0xffffff, 0, 4.0);
    carGroup.add(headlightGlowRight);

    // Front Light Mesh Materials Array
    const frontHeadlightMaterials: THREE.MeshStandardMaterial[] = [];

    // Load Model
    const loader = new GLTFLoader();
    const activePath = modelPath || "/2026_bmw_m2_cs.glb";

    // ---- Responsive fit -------------------------------------------------
    // Captured once the model loads so the fit can be recomputed on resize
    // and orientation change, not just on first load.
    let pivotGroup: THREE.Group | null = null;
    let modelSize: THREE.Vector3 | null = null;

    // Phones get a smaller car: at the full `scale` the model ran past the
    // edges of the viewport. Desktop returns 1, so its sizing math is
    // byte-for-byte what it was before.
    const viewportScale = () => (window.innerWidth < 768 ? 0.6 : 1);

    // 🔍 MODEL SCALE: `scale` prop sets the base size; the viewport factor
    // above shrinks it on small screens. Headlight positions derive from the
    // same scaleFactor, so they stay attached to the car at any size.
    const fitModel = () => {
      if (!pivotGroup || !modelSize) return;

      const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);
      const scaleFactor = (scale * viewportScale()) / (maxDim || 1);
      pivotGroup.scale.setScalar(scaleFactor);

      const halfWidth = modelSize.x * scaleFactor * 0.26;
      const frontZ = modelSize.z * scaleFactor * 0.42;
      const heightY = 0.22;

      headlightLeft.position.set(-halfWidth, heightY, frontZ);
      headlightRight.position.set(halfWidth, heightY, frontZ);
      headlightGlowLeft.position.set(-halfWidth, heightY, frontZ + 0.05);
      headlightGlowRight.position.set(halfWidth, heightY, frontZ + 0.05);
    };

    // Shared by both failure paths below: a genuine load/parse failure
    // (onError) and an exception thrown while processing an otherwise
    // successfully-loaded model (onLoad's try/catch). Either way the car
    // never made it into carGroup, so there's nothing stale on screen.
    const handleLoadFailure = (err: unknown) => {
      console.error(`Failed to load ${activePath}:`, err);
      const detail = err instanceof Error ? err.message : String(err);
      setErrorMsg(`No se pudo cargar el modelo: ${activePath} — ${detail}`);
      setLoading(false);
    };

    loader.load(
      activePath,
      (gltf) => {
        try {
        const model = gltf.scene;

        // Calculate raw bounding box
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Pivot group to hold centered model
        const pivot = new THREE.Group();
        model.position.set(-center.x, -center.y + size.y * 0.05, -center.z);
        pivot.add(model);

        // Per-model orientation correction (see `modelRotationY` prop).
        // Applied on the pivot rather than on carGroup for two reasons:
        // 1. carGroup.rotation.y is overwritten every frame by the
        //    mouse-follow lerp, so any offset set there would be erased.
        // 2. The headlight spotlights live on carGroup at +Z (toward the
        //    camera). Rotating only the model swings its real front around
        //    to meet them, so a flipped car ends up with its headlights
        //    correctly on the front instead of shining out of the trunk.
        pivot.rotation.y = modelRotationY;

        // Publish for fitModel() (declared above the loader) so the fit can
        // also re-run on resize / orientation change.
        pivotGroup = pivot;
        modelSize = size;
        fitModel();

        // NOTE: no ground/contact shadow plane here on purpose — the car
        // is meant to render without a shadow underneath it. The lights
        // (and their castShadow settings) are left untouched, so the
        // model's own shading is unchanged; there's simply no surface
        // below it for a shadow to land on.

        // Traverse meshes to filter headlight materials universally
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.material) {
              // Previously this block force-clamped roughness/metalness on
              // EVERY mesh (glass, tires, interior plastic, chrome, paint)
              // to the same "shiny metal" range. That's what was crushing
              // all the materials into the same look — GLTF/GLB already
              // ships correct per-material PBR values (glTF is a PBR-native
              // format), so we now trust them instead of overriding them.
              // We only make sure the material reads the new IBL properly.
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.envMapIntensity = 1.1;

              const nameLower = (mesh.name + " " + (mat.name || "")).toLowerCase();

              // Best-effort: promote body-paint panels to MeshPhysicalMaterial
              // with a clearcoat layer (automotive lacquer look). This is
              // name-based, so it only fires on models whose GLTF material
              // names actually say "paint"/"body" — many of your 17 GLBs
              // (Sketchfab-sourced, inconsistent naming) won't match, which
              // is fine per your spec ("si el modelo lo permite"). Say the
              // word if you want this tuned per-model instead.
              const isBodyPaint =
                (nameLower.includes("paint") ||
                  nameLower.includes("carpaint") ||
                  nameLower.includes("bodypaint") ||
                  (nameLower.includes("body") && !nameLower.includes("bodylight"))) &&
                !nameLower.includes("glass") &&
                !nameLower.includes("rubber") &&
                !nameLower.includes("tire") &&
                !nameLower.includes("tyre") &&
                !nameLower.includes("chrome") &&
                !nameLower.includes("interior") &&
                !nameLower.includes("cabin") &&
                !nameLower.includes("light");

              if (
                isBodyPaint &&
                !(mat instanceof THREE.MeshPhysicalMaterial) &&
                Array.isArray(mesh.material) === false
              ) {
                // BUG (found via the Ferrari/Mustang crash): `.copy(mat)`
                // calls MeshPhysicalMaterial's internal copy(), which does
                // `this.clearcoatNormalScale.copy(source.clearcoatNormalScale)`.
                // `mat` is a MeshStandardMaterial, which has no
                // clearcoatNormalScale property at all — so `source.
                // clearcoatNormalScale` is undefined, and Vector2.copy(undefined)
                // throws "Cannot read properties of undefined (reading 'x')".
                // Fix: build via the constructor instead, which uses
                // setValues() — only assigns the keys we actually pass, no
                // nested .copy() calls on properties that don't exist.
                try {
                  const clearcoatMat = new THREE.MeshPhysicalMaterial({
                    color: mat.color,
                    map: mat.map,
                    normalMap: mat.normalMap,
                    normalScale: mat.normalScale,
                    roughness: mat.roughness,
                    roughnessMap: mat.roughnessMap,
                    metalness: mat.metalness,
                    metalnessMap: mat.metalnessMap,
                    aoMap: mat.aoMap,
                    aoMapIntensity: mat.aoMapIntensity,
                    emissive: mat.emissive,
                    emissiveMap: mat.emissiveMap,
                    emissiveIntensity: mat.emissiveIntensity,
                    envMap: mat.envMap,
                    envMapIntensity: mat.envMapIntensity,
                    transparent: mat.transparent,
                    opacity: mat.opacity,
                    side: mat.side,
                    alphaMap: mat.alphaMap,
                    name: mat.name,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.08,
                  });
                  mesh.material = clearcoatMat;
                } catch (materialErr) {
                  // Defensive: if a future/odd material shape still trips
                  // this up, don't let one mesh crash the whole car. Keep
                  // its original material, but drop its shadow cast so a
                  // mesh we failed to process cleanly doesn't render a
                  // wrong/broken-looking shadow either.
                  console.warn(
                    `Clearcoat upgrade failed for mesh "${mesh.name}" in ${activePath}, keeping original material:`,
                    materialErr
                  );
                  mesh.castShadow = false;
                }
              }

              // Universal filter for headlight materials
              const isFrontLight =
                (nameLower.includes("lighta") ||
                  nameLower.includes("body0clight") ||
                  nameLower.includes("glass_light") ||
                  nameLower.includes("headlight") ||
                  nameLower.includes("head_light") ||
                  nameLower.includes("headlamp") ||
                  nameLower.includes("head_lamp") ||
                  nameLower.includes("xenon") ||
                  (nameLower.includes("chassislight") && !nameLower.includes("trunk"))) &&
                !nameLower.includes("trunk") &&
                !nameLower.includes("door") &&
                !nameLower.includes("cabin") &&
                !nameLower.includes("interior") &&
                !nameLower.includes("glassmtl") &&
                !nameLower.includes("glassred") &&
                !nameLower.includes("glassinside") &&
                !nameLower.includes("windshield");

              if (isFrontLight) {
                frontHeadlightMaterials.push(mat);
              }
            }
          }
        });

        // Set initial orientation
        carGroup.rotation.y = Math.PI / 5;
        carGroup.add(pivot);

        setLoading(false);
        } catch (err) {
          // Something in the processing pipeline above threw after the
          // GLTF itself parsed fine (this is exactly how the clearcoat
          // bug manifested). Nothing has been added to `scene` at that
          // point — the model only joins carGroup on the last lines — so
          // there's no half-built geometry to tear down here; just report
          // it through the same error path as a genuine load failure.
          handleLoadFailure(err);
        }
      },
      undefined,
      handleLoadFailure
    );

    // Mouse interactive movement
    let targetRotationY = Math.PI / 5;
    let targetRotationX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

      targetRotationY = Math.PI / 5 + mouseX * 0.32;
      targetRotationX = mouseY * 0.12;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize handling
    const updateSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      if (width > 0 && height > 0) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        // Re-fit in case the resize crossed the mobile/desktop breakpoint
        // (rotating a phone, resizing a window). No-ops until the model
        // has loaded.
        fitModel();
      }
    };

    const resizeObserver = new ResizeObserver(() => updateSize());
    resizeObserver.observe(container);
    updateSize();

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth lerp for mouse rotation
      carGroup.rotation.y += (targetRotationY - carGroup.rotation.y) * 0.05;
      carGroup.rotation.x += (targetRotationX - carGroup.rotation.x) * 0.05;

      // Smooth lerp for front headlight intensity when hovered
      const targetHeadlightIntensity = lightsOnRef.current ? 45 : 0;
      const targetGlowIntensity = lightsOnRef.current ? 5.0 : 0;

      headlightLeft.intensity += (targetHeadlightIntensity - headlightLeft.intensity) * 0.1;
      headlightRight.intensity += (targetHeadlightIntensity - headlightRight.intensity) * 0.1;

      headlightGlowLeft.intensity += (targetGlowIntensity - headlightGlowLeft.intensity) * 0.1;
      headlightGlowRight.intensity += (targetGlowIntensity - headlightGlowRight.intensity) * 0.1;

      // Emissive glow ONLY on front headlight materials
      const targetEmissiveHex = lightsOnRef.current ? 0xffffff : 0x000000;
      const targetEmissiveIntensity = lightsOnRef.current ? 5.0 : 0;

      frontHeadlightMaterials.forEach((mat) => {
        if (mat.emissive) {
          mat.emissive.setHex(targetEmissiveHex);
          mat.emissiveIntensity += (targetEmissiveIntensity - mat.emissiveIntensity) * 0.1;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);

      // Dispose GPU resources for everything in the scene (the loaded car
      // model + the contact shadow plane). renderer.dispose() alone only
      // frees the renderer's internal programs/render lists — it does NOT
      // free geometries, materials, or textures. Without this, every car
      // switch leaked the previous model's GPU memory (up to 40 textures
      // per model here), and after a few switches later loads would fail
      // with an opaque GLTFLoader error that the code was mislabeling as
      // "file not found".
      const disposeMaterial = (material: THREE.Material) => {
        Object.values(material).forEach((value) => {
          if (value && typeof value === "object" && "isTexture" in value) {
            (value as THREE.Texture).dispose();
          }
        });
        material.dispose();
      };
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if ((mesh as THREE.Mesh).isMesh) {
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(disposeMaterial);
          } else if (mesh.material) {
            disposeMaterial(mesh.material);
          }
        }
      });

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      // Proactively release the WebGL context instead of waiting for the
      // browser to GC the detached canvas — browsers cap the number of
      // live WebGL contexts per page, and this app creates a brand new
      // one on every car switch.
      renderer.forceContextLoss();
    };
  }, [modelPath, scale, modelRotationY]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {loading && (
        <div className="absolute z-20 text-white/40 font-yi-baiti text-base tracking-widest animate-pulse">
          Cargando modelo 3D...
        </div>
      )}
      {errorMsg && (
        <div className="absolute z-20 text-red-400 font-yi-baiti text-sm bg-black/80 px-4 py-2 rounded-lg border border-red-500/50">
          {errorMsg}
        </div>
      )}
      <div ref={containerRef} className="w-full h-full absolute inset-0" />
    </div>
  );
}

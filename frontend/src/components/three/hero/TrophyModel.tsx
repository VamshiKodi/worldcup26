import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3, Vector3, Mesh, MeshStandardMaterial, type Object3D } from 'three';
import { MODEL_URL, TROPHY_TARGET_HEIGHT, TROPHY_BASE_Y } from './constants';

/**
 * The real GLB trophy, normalised to the scene.
 *
 * The source mesh is ~2u tall and roughly centred; we measure its bounding box and:
 *  - uniformly scale it to TROPHY_TARGET_HEIGHT,
 *  - centre it on X/Z and seat its base at TROPHY_BASE_Y (on the pedestal),
 *  - enable shadow casting/receiving and lift envMapIntensity so the studio Environment
 *    produces crisp metal reflections.
 *
 * The clone shares cached geometry/materials with drei's GLTF cache, so we deliberately
 * do NOT dispose them here (that would corrupt the cache for remounts). The parent
 * <Trophy> supplies the spin + float.
 */
export function TrophyModel() {
  const { scene } = useGLTF(MODEL_URL);

  const model = useMemo<Object3D>(() => {
    const root = scene.clone(true);

    const box = new Box3().setFromObject(root);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);

    const scale = TROPHY_TARGET_HEIGHT / size.y;
    root.scale.setScalar(scale);
    // After scaling, re-seat: centre X/Z, place the (scaled) base at TROPHY_BASE_Y.
    root.position.set(-center.x * scale, -box.min.y * scale + TROPHY_BASE_Y, -center.z * scale);

    root.traverse((o: Object3D) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (m instanceof MeshStandardMaterial) {
          m.envMapIntensity = 1.4;
          m.needsUpdate = true;
        }
      });
    });

    return root;
  }, [scene]);

  return <primitive object={model} />;
}

useGLTF.preload(MODEL_URL);

import { useEffect, useState } from 'react';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const cache = new Map();

/** Load models on demand and retain them for quick switching during a review. */
export const useBikeModel = (url, retry) => {
  const [state, setState] = useState({ scene: null, progress: 0, error: null, url: null });
  useEffect(() => {
    let active = true;
    const load = async () => {
      setState({ scene: null, progress: 0, error: null, url });
      try {
        let scene = cache.get(url);
        if (!scene) {
          const gltf = await new GLTFLoader().loadAsync(url, ({ loaded, total }) => {
            if (active && total) setState((previous) => ({ ...previous, progress: Math.min(99, Math.round(loaded / total * 100)) }));
          });
          scene = gltf.scene;
          scene.traverse((object) => {
            if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; }
          });
          cache.set(url, scene);
        }
        if (active) setState({ scene, progress: 100, error: null, url });
      } catch {
        if (active) setState({ scene: null, progress: 0, error: 'The 3D model could not load. Check the connection and try again.', url });
      }
    };
    load();
    return () => { active = false; };
  }, [url, retry]);
  return state.url === url ? state : { scene: null, progress: 0, error: null };
};

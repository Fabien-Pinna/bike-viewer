import { useCtrlWheelZoom } from '../../hooks/useCtrlWheelZoom.js';
import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';
import { Box3, MeshStandardMaterial, Vector3 } from 'three';
import { useBikeModel } from './useBikeModel';

const mm = value => Math.round(value * 1000).toLocaleString('fr-FR');

const Dimension = ({ from, to, label, color }) => {
  const middle = from.map((value, axis) => (value + to[axis]) / 2);
  return <group>
    <Line points={[from, to]} color={color} lineWidth={1} />
    {[from, to].map((point, i) => <mesh key={i} position={point}><sphereGeometry args={[0.012, 6, 6]} /><meshBasicMaterial color={color} /></mesh>)}
    <Html position={middle} center style={{ pointerEvents: 'none' }}><span className="bv-dimension" style={{ color }}>{label}</span></Html>
  </group>;
};

const Bike = ({ model, position, overlay, dimensions, alignment, retry }) => {
  const { scene, error } = useBikeModel(`${import.meta.env.BASE_URL}models/bikes/${model.id}.glb`, retry);
  const tint = useMemo(() => new MeshStandardMaterial({ color: model.color, transparent: true, opacity: 0.35, depthWrite: false, roughness: 0.7 }), [model.color]);
  useEffect(() => () => tint.dispose(), [tint]);
  const object = useMemo(() => {
    if (!scene) return null;
    const copy = scene.clone(true);
    if (overlay) copy.traverse(part => { if (part.isMesh) part.material = tint; });
    return copy;
  }, [scene, overlay, tint]);
  const offsetX = alignment === 'rear' ? -model.datums.rear[0] : -(model.min[0] + model.max[0]) / 2;
  const ground = -model.min[1];
  const minX = model.min[0] + offsetX;
  const maxX = model.max[0] + offsetX;
  const height = model.size[1];
  return <group position={position}>
    {object ? <primitive object={object} position={[offsetX, ground, 0]} dispose={null} /> : <Html center><span className="bv-loading" role="status">{error ? `${model.name} : chargement impossible. Utilisez Réessayer.` : `Chargement · ${model.name}`}</span></Html>}
    {!overlay && <Html position={[(minX + maxX) / 2, -0.31, 0]} center style={{ pointerEvents: 'none' }}><span className="bv-label" style={{ borderColor: model.color }}>{model.name}</span></Html>}
    {!overlay && dimensions && <>
      <Dimension from={[minX, -0.12, 0]} to={[maxX, -0.12, 0]} label={`${mm(model.size[0])} mm`} color={model.color} />
      <Dimension from={[maxX + 0.13, 0, 0]} to={[maxX + 0.13, height, 0]} label={`${mm(height)} mm`} color={model.color} />
      <Dimension from={[offsetX + model.datums.front[0], 0.35, 0.28]} to={[offsetX + model.datums.rear[0], 0.35, 0.28]} label={`Emp. ${mm(model.wheelbase)}`} color={model.color} />
      <Dimension from={[minX - 0.13, 0, model.min[2]]} to={[minX - 0.13, 0, model.max[2]]} label={`${mm(model.size[2])} mm`} color={model.color} />
    </>}
  </group>;
};

/** Display original metric geometry with a shared orthographic camera. */
export const BikeScene = ({ models, mode, view, dimensions, alignment, reset, retry }) => {
  useCtrlWheelZoom();
  const controls = useRef();
  const { camera, size, invalidate } = useThree();
  const count = models.length;
  const flat = view === 'Profil';
  const positions = models.map((_, i) => mode !== 'all' ? [0, 0, 0] : flat
    ? [(i % 2) * 2.7, -Math.floor(i / 2) * 1.65, 0]
    : [0, 0, (i - (count - 1) / 2) * 0.85]);
  useEffect(() => {
    // A shared envelope keeps the scale stable when switching individual models.
    const bounds = new Box3();
    for (const position of positions) {
      bounds.expandByPoint(new Vector3(...position).add(new Vector3(-1.5, -0.48, -0.45)));
      bounds.expandByPoint(new Vector3(...position).add(new Vector3(1.1, 1.25, 0.45)));
    }
    const target = bounds.getCenter(new Vector3()).toArray();
    const direction = view === 'Dessus' ? [0, 8, 0.001] : view === 'Face' ? [-8, 0, 0] : flat ? [0, 0, 8] : [-3.5, 2.4, 5];
    camera.position.set(...target.map((v, i) => v + direction[i]));
    camera.up.set(0, 1, 0);
    camera.lookAt(...target);
    camera.updateMatrixWorld(true);
    const projected = new Box3();
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      projected.expandByPoint(new Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse));
    }
    const extent = projected.getSize(new Vector3());
    camera.zoom = Math.min(size.width / extent.x, size.height / extent.y) * 0.88;
    camera.updateProjectionMatrix();
    controls.current?.target.set(...target);
    controls.current?.update();
    invalidate();
  }, [camera, size.width, size.height, count, mode, view, flat, reset, invalidate]);
  return <>
    <ambientLight intensity={1.6} />
    <hemisphereLight args={['#ffffff', '#74899b', 2]} />
    <directionalLight position={[-3, 6, 5]} intensity={3} />
    <directionalLight position={[2, 3, -4]} intensity={2} />
    {models.map((model, i) => <Bike key={model.id} model={model} position={positions[i]} overlay={mode === 'overlay'} dimensions={dimensions} alignment={alignment} retry={retry} />)}
    {!(mode === 'all' && flat) && <gridHelper args={[12, 120, '#b3c6d0', '#dee7eb']} position={[0, -0.008, 0]} />}
    <OrbitControls ref={controls} makeDefault enableDamping={false} minZoom={15} maxZoom={1600} />
  </>;
};

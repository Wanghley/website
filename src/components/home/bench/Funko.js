import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { benchState, smoothstep } from '../../../lib/benchState';
import FIGURE_ANIM_CONFIG from '../../../data/figureAnimConfig';

// The protagonist: the user's own 3D figure, in true colour, standing on the
// board. Materials are plain PBR on the model's baked vertex colours: no
// tint, no hologram shell, no noise shader. Light comes from the scene
// (copper key, blue rim), not from the material.
//
// The model is rigged (Hips / Spine / Head bones, authored clips). The idle
// clip supplies the weight shift; the head bone turns toward the cursor
// within hard limits; the group breathes by at most 1.5%.
export const MODEL_URL = '/models/wsm-figure.glb';
useGLTF.preload(MODEL_URL, false, true);

const BASE_YAW = THREE.MathUtils.degToRad(25);
const YAW_LIMIT = THREE.MathUtils.degToRad(15);
const PITCH_LIMIT = THREE.MathUtils.degToRad(8);
const BREATH = 0.012; // 1.2% < 1.5% budget
const DROP_HEIGHT = 9;

export default function Funko({ position, height = 6, gesture = null }) {
  const gltf = useGLTF(MODEL_URL, false, true);
  const groupRef = useRef(null);
  const mixerRef = useRef(null);
  const actionsRef = useRef({});
  const headRef = useRef(null);
  const look = useRef({ yaw: 0, pitch: 0 });
  const tmpQ = useRef(new THREE.Quaternion());
  const tmpE = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  const rig = useMemo(() => {
    const mesh = gltf.scene.getObjectByName('wsm-figure-mesh');
    if (!mesh?.isSkinnedMesh || !mesh.skeleton) return null;
    const hips = mesh.skeleton.bones.find((b) => b.name === 'Hips');
    if (!hips) return null;
    return { geometry: mesh.geometry, skeleton: mesh.skeleton, hips };
  }, [gltf]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.58,
        metalness: 0,
        envMapIntensity: 0.9,
      }),
    []
  );

  const skinned = useMemo(() => {
    if (!rig) return null;
    const m = new THREE.SkinnedMesh(rig.geometry, material);
    m.bind(rig.skeleton, new THREE.Matrix4());
    m.castShadow = true;
    m.receiveShadow = false;
    m.frustumCulled = false; // bounds ignore the skin; never cull the hero
    return m;
  }, [rig, material]);

  useEffect(() => {
    if (!rig) return undefined;
    const mixer = new THREE.AnimationMixer(rig.hips);
    mixerRef.current = mixer;
    const wanted = ['Idle', gesture].filter(Boolean);
    wanted.forEach((name) => {
      const clipName = FIGURE_ANIM_CONFIG.clips[name]?.clip;
      const clip = gltf.animations.find((a) => a.name === clipName);
      if (clip) {
        const action = mixer.clipAction(clip);
        action.play();
        action.setEffectiveWeight(name === 'Idle' ? 1 : 0);
        action.setLoop(THREE.LoopRepeat, Infinity);
        actionsRef.current[name] = action;
      }
    });
    headRef.current = rig.skeleton.getBoneByName('Head');
    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [rig, gltf, gesture]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const k = 1 - Math.exp(-delta * 8);
    if (!group || !rig) return;
    const t = benchState.t;
    const d = benchState.drop;

    // Pose first (deterministic in time), then the additive head turn.
    if (mixerRef.current) {
      const g = gesture ? benchState.gesture : 0;
      if (actionsRef.current.Idle) actionsRef.current.Idle.setEffectiveWeight(1 - g);
      if (gesture && actionsRef.current[gesture]) actionsRef.current[gesture].setEffectiveWeight(g);
      mixerRef.current.setTime(t);
    }
    if (headRef.current) {
      const ty = THREE.MathUtils.clamp(benchState.lookX * YAW_LIMIT, -YAW_LIMIT, YAW_LIMIT);
      const tp = THREE.MathUtils.clamp(-benchState.lookY * PITCH_LIMIT, -PITCH_LIMIT, PITCH_LIMIT);
      look.current.yaw += (ty - look.current.yaw) * k;
      look.current.pitch += (tp - look.current.pitch) * k;
      tmpE.current.set(look.current.pitch, look.current.yaw, 0);
      tmpQ.current.setFromEuler(tmpE.current);
      headRef.current.quaternion.multiply(tmpQ.current);
    }

    // Drop onto the board: accelerate down, one soft squash on landing.
    const fall = (1 - d) * (1 - d);
    const squash = Math.sin(smoothstep(0.82, 1, d) * Math.PI) * 0.045;
    const breath = 1 + Math.sin(t * 1.6) * BREATH * smoothstep(0.95, 1, d);
    group.position.set(position[0], position[1] + height * 0.5 + fall * DROP_HEIGHT, position[2]);
    group.scale.set(height * (1 + squash * 0.5) * breath, height * (1 - squash) * breath, height * (1 + squash * 0.5) * breath);
    group.rotation.y = BASE_YAW + Math.sin(t * 0.35) * 0.02;
    group.rotation.z = Math.sin(t * 0.5) * 0.008; // slow weight shift
    group.visible = d > 0.001;
  });

  if (!rig || !skinned) return null;
  return (
    <group ref={groupRef} position={position} scale={height} rotation={[0, BASE_YAW, 0]}>
      <primitive object={rig.hips} />
      <primitive object={skinned} />
    </group>
  );
}

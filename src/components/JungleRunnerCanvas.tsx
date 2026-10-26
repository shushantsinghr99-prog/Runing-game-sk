import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CharacterId, JungleTheme, ObstacleItem, CoinItem, PowerUpItem, PowerUpType } from '../types/game';
import { CHARACTER_SKINS } from '../utils/characters';
import { jungleAudio } from '../utils/jungleAudio';

interface JungleRunnerCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  characterId: CharacterId;
  theme: JungleTheme;
  magnetDuration: number;
  shieldDuration: number;
  multiplierDuration: number;
  boostDuration: number;
  onCoinCollect: (count: number) => void;
  onScoreUpdate: (score: number, distance: number) => void;
  onPowerUpCollect: (type: PowerUpType, duration: number) => void;
  onJumpClear?: () => void;
  onSlideClear?: () => void;
  onGameOver: (finalScore: number, finalCoins: number) => void;
  inputTrigger: { action: 'left' | 'right' | 'jump' | 'slide'; timestamp: number } | null;
}

// Reusable math helpers to prevent garbage collection allocations in per-frame tick
const _vec3 = new THREE.Vector3();
const _coinTarget = new THREE.Vector3();

export const JungleRunnerCanvas: React.FC<JungleRunnerCanvasProps> = ({
  isPlaying,
  isPaused,
  characterId,
  theme,
  magnetDuration,
  shieldDuration,
  multiplierDuration,
  boostDuration,
  onCoinCollect,
  onScoreUpdate,
  onPowerUpCollect,
  onJumpClear,
  onSlideClear,
  onGameOver,
  inputTrigger,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References to communicate with the render loop without re-triggering React mounts
  const stateRef = useRef({
    isPlaying,
    isPaused,
    characterId,
    theme,
    lane: 0, // -1, 0, 1
    jumpProgress: 0, // 0 to 1
    slideProgress: 0, // 0 to 1
    score: 0,
    coins: 0,
    distance: 0,
    speed: 26, // Base speed
    activeShield: false,
    magnetUntil: 0,
    shieldUntil: 0,
    multiplierUntil: 0,
    boostUntil: 0,
    boostActive: false,
    magnetDuration,
    shieldDuration,
    multiplierDuration,
    boostDuration,
    lastInputTime: 0,
  });

  // Keep stateRef in sync with props
  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.isPaused = isPaused;
    stateRef.current.characterId = characterId;
    stateRef.current.theme = theme;
    stateRef.current.magnetDuration = magnetDuration;
    stateRef.current.shieldDuration = shieldDuration;
    stateRef.current.multiplierDuration = multiplierDuration;
    stateRef.current.boostDuration = boostDuration;
  }, [isPlaying, isPaused, characterId, theme, magnetDuration, shieldDuration, multiplierDuration, boostDuration]);

  // Handle external virtual controls inputs
  useEffect(() => {
    if (!inputTrigger || !stateRef.current.isPlaying || stateRef.current.isPaused) return;
    const { action } = inputTrigger;
    if (action === 'left') {
      if (stateRef.current.lane > -1) {
        stateRef.current.lane -= 1;
        jungleAudio.playLaneSwitch(-1);
      }
    } else if (action === 'right') {
      if (stateRef.current.lane < 1) {
        stateRef.current.lane += 1;
        jungleAudio.playLaneSwitch(1);
      }
    } else if (action === 'jump') {
      if (stateRef.current.jumpProgress === 0 && stateRef.current.slideProgress === 0) {
        stateRef.current.jumpProgress = 1.0;
        jungleAudio.playJump();
      }
    } else if (action === 'slide') {
      if (stateRef.current.jumpProgress === 0 && stateRef.current.slideProgress === 0) {
        stateRef.current.slideProgress = 1.0;
        jungleAudio.playSlide();
      }
    }
  }, [inputTrigger]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL Guard (Skill Directive)
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Three.js Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 3. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 180);
    camera.position.set(0, 4.2, 7.8);
    camera.lookAt(0, 1.4, -10);

    // 4. Studio Environment Reflection (Skill Directive)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Rig & Theme Colors
    const getThemeConfig = (t: JungleTheme) => {
      switch (t) {
        case 'sunset':
          return {
            skyColor: 0xd97736,
            groundColor: 0x4a2e18,
            sunColor: 0xffaa55,
            fogFar: 110,
            sunPos: [-8, 14, 8] as [number, number, number],
            lightIntensity: 2.2,
          };
        case 'night':
          return {
            skyColor: 0x091b24,
            groundColor: 0x032014,
            sunColor: 0x7dd3fc,
            fogFar: 95,
            sunPos: [-6, 16, 6] as [number, number, number],
            lightIntensity: 1.4,
          };
        case 'day':
        default:
          return {
            skyColor: 0x87ceeb,
            groundColor: 0x246b32,
            sunColor: 0xfff3d6,
            fogFar: 120,
            sunPos: [-6, 16, 8] as [number, number, number],
            lightIntensity: 2.6,
          };
      }
    };

    let themeConfig = getThemeConfig(stateRef.current.theme);
    scene.background = new THREE.Color(themeConfig.skyColor);
    scene.fog = new THREE.Fog(themeConfig.skyColor, 20, themeConfig.fogFar);

    const hemiLight = new THREE.HemisphereLight(0xffffff, themeConfig.groundColor, 1.8);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(themeConfig.sunColor, themeConfig.lightIntensity);
    sun.position.set(...themeConfig.sunPos);
    sun.castShadow = !isSoftwareGl;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 70;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -10;
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    // 6. Materials with PBR properties
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x246b32,
      roughness: 0.85,
      metalness: 0.05,
    });
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0xbfa882,
      roughness: 0.9,
      metalness: 0.05,
    });
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x8c7853,
      roughness: 0.95,
    });
    const lineMat = new THREE.MeshStandardMaterial({
      color: 0xf5eedb,
      roughness: 0.6,
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x6e7875,
      roughness: 0.85,
      metalness: 0.1,
    });
    const mossMat = new THREE.MeshStandardMaterial({
      color: 0x3b6e3b,
      roughness: 0.9,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x5c381e,
      roughness: 0.88,
    });
    const leavesMat = new THREE.MeshStandardMaterial({
      color: 0x15732a,
      roughness: 0.7,
      metalness: 0.05,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x332200,
    });
    const powerupAuraMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });

    // 7. Infinite Recycled Road Chunks
    const roadChunks: THREE.Group[] = [];
    const CHUNK_LENGTH = 30;
    const NUM_CHUNKS = 5;
    const ROAD_WIDTH = 6.4;

    for (let c = 0; c < NUM_CHUNKS; c++) {
      const chunk = new THREE.Group();
      chunk.position.z = -c * CHUNK_LENGTH;

      // Ground plane
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, CHUNK_LENGTH), grassMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.15;
      floor.receiveShadow = !isSoftwareGl;
      chunk.add(floor);

      // Main dirt road
      const road = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_WIDTH, CHUNK_LENGTH), roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.y = -0.05;
      road.receiveShadow = !isSoftwareGl;
      chunk.add(road);

      // Road stone borders
      for (const side of [-ROAD_WIDTH / 2, ROAD_WIDTH / 2]) {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, CHUNK_LENGTH), curbMat);
        curb.position.set(side, 0.01, 0);
        chunk.add(curb);
      }

      // Lane boundary markers (3 lanes: x = -2.1, 0, 2.1)
      for (const lx of [-1.05, 1.05]) {
        for (let seg = 0; seg < 5; seg++) {
          const dash = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 3), lineMat);
          dash.position.set(lx, -0.03, -CHUNK_LENGTH / 2 + seg * 6 + 3);
          chunk.add(dash);
        }
      }

      // Side Scenery: Procedural Jungle Trees, Ferns, Ancient Pillars
      for (let s = 0; s < 6; s++) {
        const zOff = -CHUNK_LENGTH / 2 + s * 5 + (Math.random() * 2 - 1);

        // Left side tree & pillar
        const treeLeft = createProceduralJungleTree(woodMat, leavesMat);
        treeLeft.position.set(-ROAD_WIDTH / 2 - 2.5 - Math.random() * 5, 0, zOff);
        chunk.add(treeLeft);

        // Right side tree & pillar
        const treeRight = createProceduralJungleTree(woodMat, leavesMat);
        treeRight.position.set(ROAD_WIDTH / 2 + 2.5 + Math.random() * 5, 0, zOff + 1.5);
        chunk.add(treeRight);

        // Occasional ancient stone pillar along roadside
        if (s % 2 === 0) {
          const pillarSide = s % 4 === 0 ? -1 : 1;
          const pillar = createAncientPillar(stoneMat, mossMat);
          pillar.position.set(pillarSide * (ROAD_WIDTH / 2 + 1.2), 0, zOff + 2);
          chunk.add(pillar);
        }
      }

      scene.add(chunk);
      roadChunks.push(chunk);
    }

    // Helper: Procedural 3-12 Part Jungle Tree (Skill Directive)
    function createProceduralJungleTree(trunkM: THREE.Material, foliageM: THREE.Material) {
      const g = new THREE.Group();
      // Trunk: slightly curved cylinder
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 3.8, 8), trunkM);
      trunk.position.y = 1.9;
      trunk.castShadow = !isSoftwareGl;
      g.add(trunk);

      // Multi-layer foliage crowns
      const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.2, 8), foliageM);
      cone1.position.y = 4.2;
      cone1.castShadow = !isSoftwareGl;
      g.add(cone1);

      const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.5, 8), foliageM);
      cone2.position.y = 5.6;
      cone2.castShadow = !isSoftwareGl;
      g.add(cone2);

      const scale = 0.75 + Math.random() * 0.5;
      g.scale.set(scale, scale, scale);
      g.rotation.y = Math.random() * Math.PI * 2;
      return g;
    }

    // Helper: Procedural Ancient Ruin Pillar
    function createAncientPillar(sMat: THREE.Material, mMat: THREE.Material) {
      const g = new THREE.Group();
      // Base
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.8), sMat);
      base.position.y = 0.15;
      g.add(base);

      // Shaft
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 2.4, 8), sMat);
      shaft.position.y = 1.4;
      shaft.castShadow = !isSoftwareGl;
      g.add(shaft);

      // Capital / top
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.7), sMat);
      top.position.y = 2.7;
      g.add(top);

      // Moss patch
      const moss = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), mMat);
      moss.position.set(0.12, 0.9, 0.12);
      g.add(moss);

      return g;
    }

    // 8. Player Character (Composite 8-Part Procedural Explorer)
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);

    const charConfig = CHARACTER_SKINS.find((c) => c.id === stateRef.current.characterId) || CHARACTER_SKINS[0];

    const skinMat = new THREE.MeshStandardMaterial({ color: charConfig.colors.skin, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: charConfig.colors.shirt, roughness: 0.75 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: charConfig.colors.pants, roughness: 0.8 });
    const hatMat = new THREE.MeshStandardMaterial({ color: charConfig.colors.hat || 0xcca370, roughness: 0.65 });
    const accentMat = new THREE.MeshStandardMaterial({ color: charConfig.colors.accent, roughness: 0.4, metalness: 0.6 });

    // Torso / Vest
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.85, 0.4), shirtMat);
    torso.position.y = 1.25;
    torso.castShadow = !isSoftwareGl;
    playerGroup.add(torso);

    // Explorer utility belt
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.14, 0.44), accentMat);
    belt.position.y = 0.86;
    playerGroup.add(belt);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), skinMat);
    head.position.y = 1.84;
    head.castShadow = !isSoftwareGl;
    playerGroup.add(head);

    // Explorer Pith Hat / Cap
    const hatGroup = new THREE.Group();
    hatGroup.position.y = 1.98;
    const hatDome = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), hatMat);
    hatGroup.add(hatDome);
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 14), hatMat);
    hatBrim.position.y = 0.02;
    hatGroup.add(hatBrim);
    playerGroup.add(hatGroup);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.18, 0.65, 0.2);
    const armL = new THREE.Mesh(armGeo, shirtMat);
    const armR = new THREE.Mesh(armGeo, shirtMat);
    armL.position.set(-0.46, 1.25, 0);
    armR.position.set(0.46, 1.25, 0);
    armL.castShadow = !isSoftwareGl;
    armR.castShadow = !isSoftwareGl;
    playerGroup.add(armL, armR);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.22, 0.65, 0.24);
    const legL = new THREE.Mesh(legGeo, pantsMat);
    const legR = new THREE.Mesh(legGeo, pantsMat);
    legL.position.set(-0.18, 0.48, 0);
    legR.position.set(0.18, 0.48, 0);
    legL.castShadow = !isSoftwareGl;
    legR.castShadow = !isSoftwareGl;
    playerGroup.add(legL, legR);

    // Contact shadow beneath player (Skill Directive)
    const shadowGeo = new THREE.PlaneGeometry(1.2, 0.9);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.01;
    playerGroup.add(contactShadow);

    // Shield protective bubble
    const shieldSphereMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.2,
      emissive: 0x0284c7,
    });
    const shieldBubble = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 16), shieldSphereMat);
    shieldBubble.position.y = 1.2;
    shieldBubble.visible = false;
    playerGroup.add(shieldBubble);

    // Magnet aura ring
    const magnetRingMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      wireframe: true,
    });
    const magnetRing = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.05, 8, 24), magnetRingMat);
    magnetRing.rotation.x = Math.PI / 2;
    magnetRing.position.y = 0.3;
    magnetRing.visible = false;
    playerGroup.add(magnetRing);

    // 9. Floating Jungle Spores & Fireflies
    const sporeCount = 45;
    const sporeGeo = new THREE.BufferGeometry();
    const sporePos = new Float32Array(sporeCount * 3);
    for (let i = 0; i < sporeCount; i++) {
      sporePos[i * 3] = (Math.random() - 0.5) * 20;
      sporePos[i * 3 + 1] = 0.5 + Math.random() * 5;
      sporePos[i * 3 + 2] = -Math.random() * 60;
    }
    sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));
    const sporeMat = new THREE.PointsMaterial({
      color: 0xffe066,
      size: 0.25,
      transparent: true,
      opacity: 0.8,
    });
    const spores = new THREE.Points(sporeGeo, sporeMat);
    scene.add(spores);

    // 10. Items Management: Obstacles, Coins, Power-Ups
    const obstacles: ObstacleItem[] = [];
    const coins: CoinItem[] = [];
    const powerUps: PowerUpItem[] = [];
    let nextItemId = 1;
    let spawnTimer = 0;

    // Helper: Create Obstacle Models
    function createObstacleMesh(type: 'rock' | 'log' | 'totem' | 'high_gate') {
      const g = new THREE.Group();
      if (type === 'rock') {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 1), stoneMat);
        rock.position.y = 0.5;
        rock.rotation.set(0.3, 0.5, 0.2);
        rock.castShadow = !isSoftwareGl;
        g.add(rock);
      } else if (type === 'log') {
        // Low fallen log with branch & moss - JUMP over!
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 1.9, 8), woodMat);
        trunk.rotation.z = Math.PI / 2;
        trunk.position.y = 0.34;
        trunk.castShadow = !isSoftwareGl;
        g.add(trunk);
        const mossPatch = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.3), mossMat);
        mossPatch.position.set(0, 0.65, 0);
        g.add(mossPatch);
      } else if (type === 'high_gate') {
        // Ancient Hanging Gate / Vines - SLIDE under!
        const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.6, 0.25), stoneMat);
        pillarL.position.set(-0.95, 1.3, 0);
        const pillarR = pillarL.clone();
        pillarR.position.x = 0.95;
        const beam = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 0.35), stoneMat);
        beam.position.y = 2.2;
        beam.castShadow = !isSoftwareGl;
        g.add(pillarL, pillarR, beam);

        // Hanging vines
        for (let v = -0.6; v <= 0.6; v += 0.3) {
          const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 5), leavesMat);
          vine.position.set(v, 1.6, 0);
          g.add(vine);
        }
      } else {
        // Totem pole - Dodge lane!
        const totem = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.2, 0.7), stoneMat);
        totem.position.y = 1.1;
        totem.castShadow = !isSoftwareGl;
        g.add(totem);
        const totemTop = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.7, 4), accentMat);
        totemTop.position.y = 2.45;
        g.add(totemTop);
      }
      return g;
    }

    // Helper: Create Power-Up Model
    function createPowerUpMesh(type: PowerUpType) {
      const g = new THREE.Group();
      let iconColor = 0x38bdf8;
      if (type === 'magnet') iconColor = 0xf43f5e;
      else if (type === 'multiplier') iconColor = 0xeab308;
      else if (type === 'boost') iconColor = 0x10b981;

      const pMat = new THREE.MeshStandardMaterial({
        color: iconColor,
        roughness: 0.2,
        metalness: 0.8,
        emissive: iconColor,
      });

      if (type === 'magnet') {
        // Horseshoe magnet
        const magnet = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.1, 8, 16, Math.PI), pMat);
        magnet.rotation.z = Math.PI;
        magnet.position.y = 1.1;
        g.add(magnet);
      } else if (type === 'shield') {
        // Shield diamond
        const shield = new THREE.Mesh(new THREE.OctahedronGeometry(0.38), pMat);
        shield.position.y = 1.1;
        g.add(shield);
      } else if (type === 'multiplier') {
        // Star / Double Star
        const star = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35), pMat);
        star.position.y = 1.1;
        g.add(star);
      } else {
        // Boost lightning arrow
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.7, 4), pMat);
        cone.rotation.x = Math.PI / 2;
        cone.position.y = 1.1;
        g.add(cone);
      }

      // Glowing outer ring
      const aura = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 8, 20), powerupAuraMat);
      aura.position.y = 1.1;
      g.add(aura);

      return g;
    }

    // Spawn patterned waves (Coins, Obstacles, Power-ups)
    function spawnWave() {
      const laneChoice = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      const roll = Math.random();

      // 1. Power-up spawn (10% chance)
      if (roll < 0.1) {
        const types: PowerUpType[] = ['magnet', 'shield', 'multiplier', 'boost'];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        const mesh = createPowerUpMesh(chosenType);
        mesh.position.set(laneChoice * 2.1, 0, -85);
        scene.add(mesh);
        powerUps.push({
          id: nextItemId++,
          type: chosenType,
          lane: laneChoice,
          z: -85,
          mesh,
          collected: false,
        });
        return;
      }

      // 2. Obstacle spawn
      const obsLane = laneChoice;
      const obsRoll = Math.random();
      let obsType: 'rock' | 'log' | 'totem' | 'high_gate';
      let canJumpOver = false;
      let canSlideUnder = false;

      if (obsRoll < 0.35) {
        obsType = 'log';
        canJumpOver = true;
      } else if (obsRoll < 0.65) {
        obsType = 'high_gate';
        canSlideUnder = true;
      } else if (obsRoll < 0.85) {
        obsType = 'rock';
        canJumpOver = true; // High jump can clear small rocks
      } else {
        obsType = 'totem'; // Must switch lane
      }

      const obsMesh = createObstacleMesh(obsType);
      obsMesh.position.set(obsLane * 2.1, 0, -85);
      scene.add(obsMesh);
      obstacles.push({
        id: nextItemId++,
        type: obsType,
        lane: obsLane,
        z: -85,
        mesh: obsMesh,
        hit: false,
        canJumpOver,
        canSlideUnder,
      });

      // 3. Trail of 3-5 coins in another lane or jumping arc over log!
      const coinLane = canJumpOver && Math.random() < 0.4 ? obsLane : (obsLane + (Math.random() < 0.5 ? 1 : 2)) % 3 - 1;
      const numCoins = 3 + Math.floor(Math.random() * 3);

      for (let ci = 0; ci < numCoins; ci++) {
        const coinMesh = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.08, 8, 16), goldMat);
        const cz = -85 - ci * 2.5;
        // If coin is above the log, place it in an arc so the player can jump and collect it!
        let cy = 0.9;
        if (canJumpOver && coinLane === obsLane) {
          cy = 1.6 + Math.sin((ci / (numCoins - 1)) * Math.PI) * 0.8;
        }
        coinMesh.position.set(coinLane * 2.1, cy, cz);
        coinMesh.rotation.y = Math.random() * Math.PI;
        scene.add(coinMesh);
        coins.push({
          id: nextItemId++,
          lane: coinLane,
          z: cz,
          y: cy,
          mesh: coinMesh,
          collected: false,
        });
      }
    }

    // 11. Swipe & Keyboard Input Listeners
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouching = false;

    const handlePointerDown = (e: PointerEvent) => {
      touchStartX = e.clientX;
      touchStartY = e.clientY;
      isTouching = true;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isTouching || !stateRef.current.isPlaying || stateRef.current.isPaused) {
        isTouching = false;
        return;
      }
      isTouching = false;
      const dx = e.clientX - touchStartX;
      const dy = e.clientY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < 22) return; // Ignore tiny taps

      if (absDx > absDy) {
        // Horizontal lane change
        if (dx > 0 && stateRef.current.lane < 1) {
          stateRef.current.lane += 1;
          jungleAudio.playLaneSwitch(1);
        } else if (dx < 0 && stateRef.current.lane > -1) {
          stateRef.current.lane -= 1;
          jungleAudio.playLaneSwitch(-1);
        }
      } else {
        // Vertical jump or slide
        if (dy < 0 && stateRef.current.jumpProgress === 0 && stateRef.current.slideProgress === 0) {
          stateRef.current.jumpProgress = 1.0;
          jungleAudio.playJump();
        } else if (dy > 0 && stateRef.current.jumpProgress === 0 && stateRef.current.slideProgress === 0) {
          stateRef.current.slideProgress = 1.0;
          jungleAudio.playSlide();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!stateRef.current.isPlaying || stateRef.current.isPaused) return;
      const key = e.key.toLowerCase();

      if (key === 'arrowleft' || key === 'a') {
        if (stateRef.current.lane > -1) {
          stateRef.current.lane -= 1;
          jungleAudio.playLaneSwitch(-1);
        }
      } else if (key === 'arrowright' || key === 'd') {
        if (stateRef.current.lane < 1) {
          stateRef.current.lane += 1;
          jungleAudio.playLaneSwitch(1);
        }
      } else if (key === 'arrowup' || key === 'w' || key === ' ') {
        e.preventDefault();
        if (stateRef.current.jumpProgress === 0 && stateRef.current.slideProgress === 0) {
          stateRef.current.jumpProgress = 1.0;
          jungleAudio.playJump();
        }
      } else if (key === 'arrowdown' || key === 's') {
        e.preventDefault();
        if (stateRef.current.jumpProgress === 0 && stateRef.current.slideProgress === 0) {
          stateRef.current.slideProgress = 1.0;
          jungleAudio.playSlide();
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);

    // 12. Main Animation & Physics Loop
    let animationFrameId = 0;
    let lastTime = performance.now();
    let runCycle = 0;

    const tick = () => {
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.08); // Clamp to prevent big leaps

      const s = stateRef.current;

      if (s.isPlaying && !s.isPaused) {
        // Speed calculation: increases smoothly with distance
        const baseSpeed = s.boostActive ? 42 : 24 + Math.min(s.distance * 0.015, 18);
        const currentSpeed = baseSpeed;
        const forwardMove = currentSpeed * dt;

        s.distance += Math.floor(forwardMove);
        s.score += Math.floor(forwardMove * (s.multiplierUntil > now ? 2 : 1));

        onScoreUpdate(s.score, s.distance);

        // Check power-up expirations
        if (s.shieldUntil > 0 && now > s.shieldUntil) {
          s.activeShield = false;
          s.shieldUntil = 0;
          shieldBubble.visible = false;
        }
        if (s.boostUntil > 0 && now > s.boostUntil) {
          s.boostActive = false;
          s.boostUntil = 0;
        }
        if (s.magnetUntil > 0 && now < s.magnetUntil) {
          magnetRing.visible = true;
          magnetRing.rotation.z += 6 * dt;
        } else {
          magnetRing.visible = false;
        }

        // Move Road Chunks backwards
        for (const chunk of roadChunks) {
          chunk.position.z += forwardMove;
          if (chunk.position.z > CHUNK_LENGTH) {
            chunk.position.z -= NUM_CHUNKS * CHUNK_LENGTH;
          }
        }

        // Animate Floating spores
        const posAttr = sporeGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < sporeCount; i++) {
          arr[i * 3 + 2] += forwardMove * 0.6;
          if (arr[i * 3 + 2] > 10) {
            arr[i * 3 + 2] = -75;
          }
        }
        posAttr.needsUpdate = true;

        // Player Lane Spring / Smooth Interp
        const targetX = s.lane * 2.1;
        playerGroup.position.x += (targetX - playerGroup.position.x) * (s.boostActive ? 0.3 : 0.22);
        playerGroup.rotation.z = (targetX - playerGroup.position.x) * -0.06;

        // Jump physics (sine arc)
        if (s.jumpProgress > 0) {
          s.jumpProgress = Math.max(0, s.jumpProgress - 1.8 * dt);
          const jumpArc = Math.sin((1 - s.jumpProgress) * Math.PI);
          playerGroup.position.y = jumpArc * 2.2;
          // Leg tuck during jump
          legL.position.y = 0.48 + jumpArc * 0.25;
          legR.position.y = 0.48 + jumpArc * 0.25;
          armL.rotation.x = -jumpArc * 1.2;
          armR.rotation.x = -jumpArc * 1.2;
        } else if (s.slideProgress > 0) {
          s.slideProgress = Math.max(0, s.slideProgress - 1.9 * dt);
          playerGroup.position.y = 0;
          playerGroup.scale.y = 0.52; // Crouch scale
          playerGroup.rotation.x = 0.4;
        } else {
          playerGroup.position.y = 0;
          playerGroup.scale.y = 1.0;
          playerGroup.rotation.x = 0;

          // Running limbs pendulum animation
          runCycle += dt * (currentSpeed * 0.7);
          const legSwing = Math.sin(runCycle) * 0.65;
          legL.rotation.x = legSwing;
          legR.rotation.x = -legSwing;
          armL.rotation.x = -legSwing * 0.9;
          armR.rotation.x = legSwing * 0.9;
        }

        // Spawning items
        spawnTimer += dt * (currentSpeed / 20);
        if (spawnTimer > 1.25) {
          spawnTimer = 0;
          spawnWave();
        }

        // Update Obstacles & Check Collisions
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.mesh.position.z += forwardMove;

          // Collision detection box
          const dz = obs.mesh.position.z - playerGroup.position.z;
          const dx = Math.abs(obs.mesh.position.x - playerGroup.position.x);

          if (!obs.hit && dz > -0.7 && dz < 0.6 && dx < 0.85) {
            // Can jump over log/rock?
            const isHighEnough = playerGroup.position.y > 0.85;
            const isSlidingLow = s.slideProgress > 0;

            if (s.boostActive) {
              // Cheetah boost destroys obstacles
              obs.hit = true;
              scene.remove(obs.mesh);
              obstacles.splice(i, 1);
              jungleAudio.playCrash();
              continue;
            }

            if (obs.canJumpOver && isHighEnough) {
              // Safely leaped over!
              if (!obs.cleared) {
                obs.cleared = true;
                onJumpClear?.();
              }
            } else if (obs.canSlideUnder && isSlidingLow) {
              // Safely slid under!
              if (!obs.cleared) {
                obs.cleared = true;
                onSlideClear?.();
              }
            } else {
              // Collision occurred!
              if (s.activeShield) {
                // Shield saves player once!
                s.activeShield = false;
                s.shieldUntil = 0;
                shieldBubble.visible = false;
                obs.hit = true;
                scene.remove(obs.mesh);
                obstacles.splice(i, 1);
                jungleAudio.playShieldBreak();
                continue;
              }

              // Fatal crash -> Game Over
              s.isPlaying = false;
              jungleAudio.playCrash();
              jungleAudio.stopDrums();
              onGameOver(s.score, s.coins);
              return;
            }
          }

          // Despawn passed obstacles
          if (obs.mesh.position.z > 12) {
            scene.remove(obs.mesh);
            obstacles.splice(i, 1);
          }
        }

        // Update Power-ups
        for (let i = powerUps.length - 1; i >= 0; i--) {
          const pu = powerUps[i];
          pu.mesh.position.z += forwardMove;
          pu.mesh.rotation.y += 3.5 * dt;

          const dz = pu.mesh.position.z - playerGroup.position.z;
          const dx = Math.abs(pu.mesh.position.x - playerGroup.position.x);

          if (!pu.collected && dz > -0.8 && dz < 0.8 && dx < 1.0) {
            pu.collected = true;
            scene.remove(pu.mesh);
            powerUps.splice(i, 1);
            jungleAudio.playPowerUp();

            // Apply power-up effect
            const pNow = performance.now();
            if (pu.type === 'magnet') {
              s.magnetUntil = pNow + s.magnetDuration * 1000;
              onPowerUpCollect('magnet', s.magnetDuration);
            } else if (pu.type === 'shield') {
              s.activeShield = true;
              s.shieldUntil = pNow + s.shieldDuration * 1000;
              shieldBubble.visible = true;
              onPowerUpCollect('shield', s.shieldDuration);
            } else if (pu.type === 'multiplier') {
              s.multiplierUntil = pNow + s.multiplierDuration * 1000;
              onPowerUpCollect('multiplier', s.multiplierDuration);
            } else if (pu.type === 'boost') {
              s.boostActive = true;
              s.boostUntil = pNow + s.boostDuration * 1000;
              onPowerUpCollect('boost', s.boostDuration);
            }
            continue;
          }

          if (pu.mesh.position.z > 12) {
            scene.remove(pu.mesh);
            powerUps.splice(i, 1);
          }
        }

        // Update Coins & Magnet Pull
        const isMagnetActive = s.magnetUntil > now;
        for (let i = coins.length - 1; i >= 0; i--) {
          const coin = coins[i];
          coin.mesh.position.z += forwardMove;
          coin.mesh.rotation.y += 4.5 * dt;

          // Magnet Attraction
          if (isMagnetActive && coin.mesh.position.z > -25 && coin.mesh.position.z < 5) {
            _coinTarget.set(playerGroup.position.x, playerGroup.position.y + 1, playerGroup.position.z);
            coin.mesh.position.lerp(_coinTarget, 10 * dt);
          }

          const dz = coin.mesh.position.z - playerGroup.position.z;
          const dx = Math.abs(coin.mesh.position.x - playerGroup.position.x);
          const dy = Math.abs(coin.mesh.position.y - (playerGroup.position.y + 0.8));

          if (!coin.collected && dz > -0.9 && dz < 0.7 && dx < 0.9 && dy < 1.2) {
            coin.collected = true;
            scene.remove(coin.mesh);
            coins.splice(i, 1);
            const coinVal = s.multiplierUntil > now ? 2 : 1;
            s.coins += coinVal;
            s.score += 50 * coinVal;
            jungleAudio.playCoin();
            onCoinCollect(s.coins);
            continue;
          }

          if (coin.mesh.position.z > 12) {
            scene.remove(coin.mesh);
            coins.splice(i, 1);
          }
        }

        // Camera follow with silky smooth damping
        camera.position.x += (playerGroup.position.x * 0.35 - camera.position.x) * 0.08;
        camera.lookAt(playerGroup.position.x * 0.4, 1.4, -10);
      } else if (!s.isPlaying) {
        // Idle breathing on menu screen
        playerGroup.position.y = Math.sin(now * 0.003) * 0.05;
        // Idle camera slight drift
        camera.position.x = Math.sin(now * 0.0008) * 0.5;
        camera.lookAt(0, 1.4, -10);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        // Software WebGL pacing via fenceSync (Skill Directive)
        afterDraw(tick);
      } else {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    function afterDraw(cb: () => void) {
      const glContext = renderer.getContext() as WebGL2RenderingContext;
      const sync = glContext.fenceSync(glContext.SYNC_GPU_COMMANDS_COMPLETE, 0);
      glContext.flush();
      const poll = () => {
        const status = sync && glContext.getSyncParameter(sync, glContext.SYNC_STATUS);
        if (status === glContext.UNSIGNALED) {
          window.setTimeout(poll, 5);
        } else {
          if (sync) glContext.deleteSync(sync);
          window.setTimeout(cb, 60);
        }
      };
      window.setTimeout(poll, 5);
    }

    animationFrameId = requestAnimationFrame(tick);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);

      // Clean scene
      obstacles.forEach((o) => scene.remove(o.mesh));
      coins.forEach((c) => scene.remove(c.mesh));
      powerUps.forEach((p) => scene.remove(p.mesh));
      roadChunks.forEach((rc) => scene.remove(rc));

      // Dispose renderer
      renderer.dispose();
      if (dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full overflow-hidden touch-none select-none" />;
};

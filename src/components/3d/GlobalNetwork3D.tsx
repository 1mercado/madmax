import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface GlobalNetwork3DProps {
  interactive?: boolean;
  compact?: boolean;
  showControlsDock?: boolean;
  onNodeClick?: (city: string) => void;
}

export const GlobalNetwork3D: React.FC<GlobalNetwork3DProps> = ({
  interactive = true,
  compact = false,
  showControlsDock = false,
  onNodeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [pulseIntensity, setPulseIntensity] = useState(1.0);
  const [activeCity, setActiveCity] = useState<string>('Manila (DigiCash HQ)');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL safely
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02132e, 0.05);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, compact ? 4.2 : 3.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 2.2;
    controls.maxDistance = 6.0;
    controls.autoRotate = !isSoftwareGl;
    controls.autoRotateSpeed = 0.6 * speedMultiplier;
    controls.enabled = interactive;

    // Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x072b4f, 1.8);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x00e5ff, 0x021633, 1.5);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0x88f953, 2.2);
    keyLight.position.set(4, 5, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x00f5a0, 1.5);
    fillLight.position.set(-4, -2, -3);
    scene.add(fillLight);

    // 1. Procedural High-Res Earth Texture Canvas
    const createEarthTexture = (): THREE.CanvasTexture => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 512;
      const ctx = c.getContext('2d')!;

      // Deep cosmic ocean
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, '#021838');
      oceanGrad.addColorStop(0.5, '#05234d');
      oceanGrad.addColorStop(1, '#02132d');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Lat/Long Coordinate Grid
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= 1024; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y <= 512; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }

      // Procedural Cyber Continents
      ctx.fillStyle = 'rgba(0, 245, 160, 0.45)';
      const drawContinentBlob = (cx: number, cy: number, rx: number, ry: number) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Inner digital circuitry pattern
        ctx.fillStyle = 'rgba(0, 229, 255, 0.65)';
        for (let i = 0; i < 12; i++) {
          const px = cx + (Math.random() - 0.5) * rx * 1.5;
          const py = cy + (Math.random() - 0.5) * ry * 1.5;
          ctx.fillRect(px, py, 4, 4);
        }
      };

      // Asia & Pacific
      drawContinentBlob(720, 210, 110, 80);
      drawContinentBlob(820, 340, 60, 45); // Australia
      drawContinentBlob(760, 260, 25, 30); // Philippines / SE Asia
      // Europe & Africa
      drawContinentBlob(510, 160, 65, 50);
      drawContinentBlob(530, 280, 75, 95);
      // Americas
      drawContinentBlob(260, 170, 95, 70);
      drawContinentBlob(320, 320, 60, 85);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return tex;
    };

    // Main 3D Globe Group (Composite of 6 parts)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Part 1: Core Sphere
    const earthGeo = new THREE.SphereGeometry(1.2, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      map: createEarthTexture(),
      roughness: 0.35,
      metalness: 0.25,
      emissive: new THREE.Color(0x02193e),
      emissiveIntensity: 0.4,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // Part 2: Outer Atmosphere Fresnel Glow Shell
    const glowGeo = new THREE.SphereGeometry(1.26, 36, 36);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    globeGroup.add(glowMesh);

    // Part 3: Dual Trans-Orbital Financial Rings
    const ring1Geo = new THREE.TorusGeometry(1.65, 0.012, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x00f5a0,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI * 0.35;
    ring1.rotation.y = Math.PI * 0.15;
    globeGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(1.85, 0.008, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI * 0.25;
    ring2.rotation.z = Math.PI * 0.2;
    globeGroup.add(ring2);

    // Part 4: Major Global Financial Nodes (Lat/Lon)
    const cities = [
      { name: 'Manila (DigiCash HQ)', lat: 14.5995, lon: 120.9842, color: 0x88f953 },
      { name: 'Singapore', lat: 1.3521, lon: 103.8198, color: 0x00e5ff },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503, color: 0x00f5a0 },
      { name: 'London', lat: 51.5074, lon: -0.1278, color: 0x00e5ff },
      { name: 'New York', lat: 40.7128, lon: -74.006, color: 0x88f953 },
      { name: 'Dubai', lat: 25.2048, lon: 55.2708, color: 0xffb300 },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093, color: 0x00f5a0 },
    ];

    const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    const nodeGroup = new THREE.Group();
    globeGroup.add(nodeGroup);

    cities.forEach((city) => {
      const pos = latLonToVector3(city.lat, city.lon, 1.21);
      // Beacon cylinder
      const pinGeo = new THREE.CylinderGeometry(0.015, 0.005, 0.08, 8);
      pinGeo.rotateX(Math.PI / 2);
      const pinMat = new THREE.MeshBasicMaterial({ color: city.color });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.lookAt(0, 0, 0);
      nodeGroup.add(pinMesh);

      // Node beacon bulb
      const beaconGeo = new THREE.SphereGeometry(0.025, 12, 12);
      const beaconMat = new THREE.MeshBasicMaterial({ color: city.color });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.copy(pos.clone().multiplyScalar(1.03));
      nodeGroup.add(beaconMesh);
    });

    // Part 5: Intercontinental Glowing Arcs (Transaction Beams)
    const createCurvedArc = (start: THREE.Vector3, end: THREE.Vector3, color: number): THREE.Line => {
      const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(1.48);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(36);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      return new THREE.Line(geo, mat);
    };

    const manilaPos = latLonToVector3(14.5995, 120.9842, 1.22);
    const sgPos = latLonToVector3(1.3521, 103.8198, 1.22);
    const tokyoPos = latLonToVector3(35.6762, 139.6503, 1.22);
    const dubaiPos = latLonToVector3(25.2048, 55.2708, 1.22);
    const londonPos = latLonToVector3(51.5074, -0.1278, 1.22);
    const nyPos = latLonToVector3(40.7128, -74.006, 1.22);

    globeGroup.add(createCurvedArc(manilaPos, sgPos, 0x00f5a0));
    globeGroup.add(createCurvedArc(manilaPos, tokyoPos, 0x00e5ff));
    globeGroup.add(createCurvedArc(sgPos, dubaiPos, 0x88f953));
    globeGroup.add(createCurvedArc(dubaiPos, londonPos, 0x00e5ff));
    globeGroup.add(createCurvedArc(londonPos, nyPos, 0x00f5a0));
    globeGroup.add(createCurvedArc(nyPos, manilaPos, 0x00e5ff));

    // Part 6: Transaction Data Satellites (3 composite procedural satellites)
    const satellites: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const satGroup = new THREE.Group();
      // Body
      const bodyGeo = new THREE.BoxGeometry(0.04, 0.04, 0.07);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.2 });
      satGroup.add(new THREE.Mesh(bodyGeo, bodyMat));
      // Solar wings
      const wingGeo = new THREE.BoxGeometry(0.12, 0.005, 0.03);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x0072ff, roughness: 0.1 });
      satGroup.add(new THREE.Mesh(wingGeo, wingMat));
      // Glow antenna
      const antGeo = new THREE.SphereGeometry(0.012, 8, 8);
      const antMat = new THREE.MeshBasicMaterial({ color: 0x88f953 });
      const ant = new THREE.Mesh(antGeo, antMat);
      ant.position.y = 0.035;
      satGroup.add(ant);

      satellites.push(satGroup);
      scene.add(satGroup);
    }

    // Part 7: Ambient Cyber Particle Starfield
    const starCount = isSoftwareGl ? 80 : 250;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 16;
      starPositions[i + 1] = (Math.random() - 0.5) * 16;
      starPositions[i + 2] = (Math.random() - 0.5) * 16;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with Software WebGL safety
    let frameId: number;
    let clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 60);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime() * speedMultiplier;

      // Orbit rotations
      ring1.rotation.z += 0.003 * speedMultiplier;
      ring2.rotation.z -= 0.004 * speedMultiplier;
      starField.rotation.y += 0.0003;

      // Pulse glow
      glowMesh.scale.setScalar(1 + Math.sin(elapsed * 2.5) * 0.015 * pulseIntensity);

      // Animate satellites
      satellites.forEach((sat, idx) => {
        const angle = elapsed * 0.6 + (idx * Math.PI * 2) / 3;
        const rad = 1.95;
        sat.position.set(Math.cos(angle) * rad, Math.sin(angle * 0.8) * 0.7, Math.sin(angle) * rad);
        sat.rotation.y = -angle;
        sat.rotation.x = Math.sin(elapsed) * 0.2;
      });

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        frameId = requestAnimationFrame(animate);
      }
    };

    if (isSoftwareGl) {
      afterDraw(animate);
    } else {
      frameId = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (isSoftwareGl) {
        clearTimeout(frameId);
      } else {
        cancelAnimationFrame(frameId);
      }
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [compact, interactive, speedMultiplier, pulseIntensity]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Network Node Indicator */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#081b36]/80 border border-[#00e5ff]/30 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#00f5a0]" />
          <span className="text-[#00e5ff] font-semibold tracking-wider uppercase text-[10px]">
            Global Fintech Grid
          </span>
          <span className="text-white/60">|</span>
          <span className="text-white font-medium">{activeCity}</span>
        </div>
      </div>

      {/* Optional Collapsible Bottom Control Dock (Three.js Skill standard) */}
      {showControlsDock && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-xl pointer-events-auto transition-transform duration-300">
          <div className="flex flex-col items-center">
            {/* Collapse / Expand toggle tab */}
            <button
              onClick={() => setIsDockCollapsed(!isDockCollapsed)}
              className="px-4 py-1 mb-1 rounded-t-lg bg-[#071933] border-t border-x border-[#00e5ff]/40 text-[#00e5ff] text-xs font-semibold hover:bg-[#0c2954] transition-colors"
            >
              {isDockCollapsed ? '▴ Show 3D Grid Controls' : '▾ Hide Controls'}
            </button>

            {/* Main Dock Container */}
            {!isDockCollapsed && (
              <div className="w-full p-3.5 rounded-2xl bg-[#07172fe6] border border-[#00e5ff]/30 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Speed Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Speed:</span>
                  {[0.5, 1.0, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeedMultiplier(s)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                        speedMultiplier === s
                          ? 'bg-[#00e5ff] text-[#00222b]'
                          : 'bg-[#0f2c52] text-white hover:bg-[#153c6d]'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                {/* Pulse Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Pulse:</span>
                  {[1.0, 1.8].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPulseIntensity(p)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                        pulseIntensity === p
                          ? 'bg-[#00f5a0] text-[#00222b]'
                          : 'bg-[#0f2c52] text-white hover:bg-[#153c6d]'
                      }`}
                    >
                      {p === 1.0 ? 'Standard' : 'Hyper'}
                    </button>
                  ))}
                </div>

                {/* Node Focus Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {['Manila', 'Tokyo', 'London', 'New York'].map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setActiveCity(`${city} Active Node`);
                        if (onNodeClick) onNodeClick(city);
                      }}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium ${
                        activeCity.includes(city)
                          ? 'bg-[#88f953] text-[#00222b] font-bold'
                          : 'bg-[#0a2342] text-slate-300'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

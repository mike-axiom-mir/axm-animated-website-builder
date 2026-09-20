import { useEffect, useRef } from "react";
import { resolveSceneCue } from "../model/choreography.js";
import { MOTION_PROFILES, SCENE_STATES } from "../model/project.js";

function polygon(ctx, points, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function seeded(seed, index) {
  const x = Math.sin(seed * 91.31 + index * 74.77) * 43758.5453;
  return x - Math.floor(x);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpArray(a, b, t) {
  return a.map((value, index) => lerp(value, b[index], t));
}

function baseRuntime(project) {
  const cue = resolveSceneCue(project.background, project.page.heroSceneCue);
  const state = SCENE_STATES[cue.state] || SCENE_STATES.idle;
  const profile = MOTION_PROFILES[cue.motionProfile] || MOTION_PROFILES.drift;
  return {
    sky: [...state.sky],
    sun: [...state.sun],
    accent: [...state.accent],
    stateSpeed: state.speed,
    motionSpeed: profile.speed,
    motionScale: cue.motionScale,
    atmosphere: cue.atmosphere,
    atomIntensity: cue.atomIntensity,
    cameraX: cue.camera.x,
    cameraY: cue.camera.y,
    cameraZoom: cue.camera.zoom,
  };
}

function targetRuntime(project, sceneCue) {
  const cue = project.page.choreography?.enabled
    ? resolveSceneCue(project.background, sceneCue)
    : resolveSceneCue(project.background, { recipe: "inherit", overrides: {} });
  const state = SCENE_STATES[cue.state] || SCENE_STATES.idle;
  const profile = MOTION_PROFILES[cue.motionProfile] || MOTION_PROFILES.drift;
  return {
    cue,
    sky: state.sky,
    sun: state.sun,
    accent: state.accent,
    stateSpeed: state.speed,
    motionSpeed: profile.speed,
    motionScale: cue.motionScale,
    atmosphere: cue.atmosphere,
    atomIntensity: cue.atomIntensity,
    cameraX: cue.camera.x,
    cameraY: cue.camera.y,
    cameraZoom: cue.camera.zoom,
  };
}

function easeRuntime(live, target, dt) {
  const blendMs = Math.max(0, target.cue.blendMs);
  const amount = blendMs === 0 ? 1 : 1 - Math.exp(-(dt * 1000) / Math.max(30, blendMs / 4));
  live.sky = lerpArray(live.sky, target.sky, amount);
  live.sun = lerpArray(live.sun, target.sun, amount);
  live.accent = lerpArray(live.accent, target.accent, amount);
  live.stateSpeed = lerp(live.stateSpeed, target.stateSpeed, amount);
  live.motionSpeed = lerp(live.motionSpeed, target.motionSpeed, amount);
  live.motionScale = lerp(live.motionScale, target.motionScale, amount);
  live.atmosphere = lerp(live.atmosphere, target.atmosphere, amount);
  live.atomIntensity = lerp(live.atomIntensity, target.atomIntensity, amount);
  live.cameraX = lerp(live.cameraX, target.cameraX, amount);
  live.cameraY = lerp(live.cameraY, target.cameraY, amount);
  live.cameraZoom = lerp(live.cameraZoom, target.cameraZoom, amount);
}

function toneRgb(element, runtime) {
  if (element.tone === "sun") return runtime.sun;
  if (element.tone === "ice") return [205, 246, 255];
  if (element.tone === "muted") return [112, 148, 160];
  return runtime.accent;
}

function drawSceneElement(ctx, width, height, time, project, runtime, element, index) {
  const mobile = width <= 720;
  if (mobile && element.visibility?.mobile === false) return;
  if (!mobile && element.visibility?.desktop === false) return;

  const activeTime = project.background.motion
    ? time * runtime.motionSpeed * runtime.motionScale * element.speed
    : 0;
  const phase = element.phase || 0;
  let radius = Math.max(5, Math.min(width, height) * element.size);
  let x = element.x * width;
  let y = element.y * height;

  if (element.motion === "drift") {
    x = ((x + activeTime * radius * 1.25 + width + radius) % (width + radius * 2)) - radius;
  } else if (element.motion === "float") {
    y += Math.sin(activeTime + phase) * radius * 0.55;
  } else if (element.motion === "pulse") {
    radius *= 1 + Math.sin(activeTime * 1.6 + phase) * 0.22;
  } else if (element.motion === "orbit") {
    x += Math.cos(activeTime + phase) * radius * 0.7;
    y += Math.sin(activeTime + phase) * radius * 0.7;
  }

  const [r, g, b] = toneRgb(element, runtime);
  const alpha = Math.min(1, element.opacity * runtime.atomIntensity);
  radius *= Math.max(0.35, Math.min(1.35, runtime.atomIntensity));

  ctx.save();
  if (element.type === "orb") {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.8);
    glow.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
    glow.addColorStop(0.28, `rgba(${r},${g},${b},${alpha * 0.38})`);
    glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (element.type === "ring") {
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.lineWidth = Math.max(1, radius * 0.08);
    ctx.shadowColor = `rgba(${r},${g},${b},${alpha})`;
    ctx.shadowBlur = radius * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  } else if (element.type === "beacon") {
    const beam = ctx.createLinearGradient(x, y - radius * 3, x, y + radius * 3);
    beam.addColorStop(0, `rgba(${r},${g},${b},0)`);
    beam.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.75})`);
    beam.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.strokeStyle = beam;
    ctx.lineWidth = Math.max(1, radius * 0.05);
    ctx.beginPath();
    ctx.moveTo(x, y - radius * 3);
    ctx.lineTo(x, y + radius * 3);
    ctx.stroke();
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(2, radius * 0.15), 0, Math.PI * 2);
    ctx.fill();
  } else if (element.type === "stream") {
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.lineWidth = Math.max(1, radius * 0.06);
    ctx.beginPath();
    ctx.moveTo(x - radius * 2.2, y);
    ctx.bezierCurveTo(
      x - radius,
      y - radius * (0.4 + Math.sin(activeTime + phase) * 0.3),
      x + radius,
      y + radius * (0.4 + Math.cos(activeTime + phase) * 0.3),
      x + radius * 2.2,
      y,
    );
    ctx.stroke();
  } else if (element.type === "dust") {
    for (let particle = 0; particle < 16; particle += 1) {
      const angle = seeded(project.background.seed + index, particle) * Math.PI * 2;
      const distance = seeded(project.background.seed + index + 9, particle) * radius * 2.3;
      const drift = Math.sin(activeTime + phase + particle) * radius * 0.2;
      const px = x + Math.cos(angle) * distance + drift;
      const py = y + Math.sin(angle) * distance + Math.cos(activeTime + particle) * radius * 0.15;
      const particleAlpha = alpha * (0.25 + seeded(index + 5, particle) * 0.65);
      ctx.fillStyle = `rgba(${r},${g},${b},${particleAlpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 1 + seeded(index + 2, particle) * 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawWorld(ctx, width, height, time, project, keys, runtime) {
  const [sr, sg, sb] = runtime.sky;
  const [ar, ag, ab] = runtime.accent;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `rgb(${sr},${sg},${sb})`);
  gradient.addColorStop(0.56, `rgb(${Math.min(sr + 23, 255)},${Math.min(sg + 32, 255)},${Math.min(sb + 38, 255)})`);
  gradient.addColorStop(1, "#02070b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(width * 0.5 + runtime.cameraX * width, height * 0.5 + runtime.cameraY * height);
  ctx.scale(runtime.cameraZoom, runtime.cameraZoom);
  ctx.translate(-width * 0.5, -height * 0.5);

  const sunX = width * 0.24;
  const sunY = height * 0.34;
  const sunR = Math.min(width, height) * 0.052;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 3.4);
  sunGlow.addColorStop(0, `rgba(${runtime.sun.join(",")},.95)`);
  sunGlow.addColorStop(0.2, `rgba(${runtime.sun.join(",")},.5)`);
  sunGlow.addColorStop(1, `rgba(${runtime.sun.join(",")},0)`);
  ctx.fillStyle = sunGlow;
  ctx.fillRect(sunX - sunR * 4, sunY - sunR * 4, sunR * 8, sunR * 8);

  const mountainColors = ["#183442", "#102b36", "#0b212b", "#071820"];
  for (let layer = 0; layer < 4; layer += 1) {
    const baseline = height * (0.48 + layer * 0.085);
    const step = Math.max(92, width / 9);
    for (let x = -step; x < width + step; x += step) {
      const peak = baseline - height * (0.09 + seeded(project.background.seed + layer, x) * 0.13);
      polygon(ctx, [[x - step, baseline + 100], [x, peak], [x + step, baseline + 100]], mountainColors[layer]);
      polygon(ctx, [[x, peak], [x + step * 0.26, baseline], [x + step, baseline + 100]], "rgba(0,0,0,.13)");
    }
  }

  const water = ctx.createLinearGradient(0, height * 0.54, 0, height);
  water.addColorStop(0, "rgba(26,76,88,.55)");
  water.addColorStop(1, "#030b10");
  ctx.fillStyle = water;
  ctx.fillRect(-width * 0.1, height * 0.55, width * 1.2, height * 0.55);

  const horizon = height * 0.68;
  for (let i = 0; i < 26; i += 1) {
    const x = seeded(project.background.seed, i) * width;
    const towerWidth = 22 + seeded(project.background.seed + 2, i) * 58;
    const towerHeight = height * (0.11 + seeded(project.background.seed + 7, i) * 0.24);
    const y = horizon + (i % 4) * 20;
    ctx.fillStyle = i % 3 ? "#0a222c" : "#0e2e39";
    ctx.fillRect(x, y - towerHeight, towerWidth, towerHeight);
    polygon(ctx, [[x, y - towerHeight], [x + towerWidth * 0.5, y - towerHeight - towerWidth * 0.2], [x + towerWidth, y - towerHeight]], "#163946");
    ctx.fillStyle = `rgba(${ar},${ag},${ab},${0.35 + seeded(8, i) * 0.45})`;
    for (let wx = 7; wx < towerWidth - 4; wx += 12) {
      for (let wy = 12; wy < towerHeight - 5; wy += 19) {
        if ((wx + wy + i) % 5) ctx.fillRect(x + wx, y - towerHeight + wy, 2, 6);
      }
    }
  }

  const motion = project.background.motion
    ? time * runtime.stateSpeed * runtime.motionSpeed * runtime.motionScale
    : 0;
  const ledgeY = height * 0.78;
  polygon(ctx, [[-width * 0.1, ledgeY + 40], [width * 0.3, ledgeY - 35], [width * 0.55, ledgeY + 30], [width * 1.1, ledgeY - 20], [width * 1.1, height * 1.1], [-width * 0.1, height * 1.1]], "#06141a");
  ctx.strokeStyle = `rgba(${ar},${ag},${ab},.65)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-20, ledgeY + 28);
  ctx.bezierCurveTo(width * 0.22, ledgeY - 78, width * 0.62, ledgeY + 85, width + 20, ledgeY - 25);
  ctx.stroke();

  for (let i = 0; i < 12; i += 1) {
    const x = ((i * 211 + motion * (26 + i)) % (width + 120)) - 60;
    const y = height * (0.18 + (i % 5) * 0.075);
    polygon(ctx, [[x - 25, y], [x + 17, y - 7], [x + 28, y + 2], [x + 14, y + 8], [x - 18, y + 6]], "#132f3b");
    ctx.fillStyle = `rgba(${ar},${ag},${ab},.9)`;
    ctx.fillRect(x - 31, y + 1, 8, 3);
  }

  for (const [index, element] of project.background.sceneElements.entries()) {
    drawSceneElement(ctx, width, height, time, project, runtime, element, index);
  }

  if (project.background.type === "game") {
    const dx = (keys.current.ArrowRight ? 1 : 0) - (keys.current.ArrowLeft ? 1 : 0);
    const dy = (keys.current.ArrowDown ? 1 : 0) - (keys.current.ArrowUp ? 1 : 0);
    keys.current.playerX = Math.max(50, Math.min(width - 50, (keys.current.playerX || width * 0.5) + dx * 4));
    keys.current.playerY = Math.max(70, Math.min(height - 70, (keys.current.playerY || height * 0.52) + dy * 4));
    const px = keys.current.playerX;
    const py = keys.current.playerY;
    ctx.shadowColor = `rgb(${ar},${ag},${ab})`;
    ctx.shadowBlur = 22;
    polygon(ctx, [[px, py - 18], [px + 17, py + 15], [px, py + 8], [px - 17, py + 15]], `rgb(${ar},${ag},${ab})`);
    ctx.shadowBlur = 0;
  }

  ctx.restore();
  ctx.fillStyle = `rgba(18,48,60,${0.015 + (runtime.atmosphere / 100) * 0.055})`;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(0,0,0,.12)";
  ctx.fillRect(0, 0, width, height);
}

export function WorldCanvas({ project, interactive, sceneCue }) {
  const canvasRef = useRef(null);
  const keys = useRef({});
  const cueRef = useRef(sceneCue);
  cueRef.current = sceneCue;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const live = baseRuntime(project);
    let frame = 0;
    let width = 0;
    let height = 0;
    let previous = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const keyDown = (event) => { if (interactive) keys.current[event.key] = true; };
    const keyUp = (event) => { keys.current[event.key] = false; };
    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0, (now - previous) / 1000));
      previous = now;
      easeRuntime(live, targetRuntime(project, cueRef.current), dt);
      drawWorld(context, width, height, now / 1000, project, keys, live);
      frame = window.requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [project, interactive]);

  return <canvas className="world-canvas" ref={canvasRef} aria-label="Live animated world with section choreography" />;
}

export function BackgroundRuntime({ project, interactive, sceneCue }) {
  const { type, mediaUrl } = project.background;
  if (type === "video" && mediaUrl) return <video className="background-media" src={mediaUrl} autoPlay loop muted playsInline />;
  if (type === "image" && mediaUrl) return <img className="background-media" src={mediaUrl} alt="Uploaded background asset" />;
  return <WorldCanvas project={project} interactive={interactive} sceneCue={sceneCue} />;
}

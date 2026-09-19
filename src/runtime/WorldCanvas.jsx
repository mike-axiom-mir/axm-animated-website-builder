import { useEffect, useRef } from "react";
import { SCENE_STATES } from "../model/project.js";

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

function drawWorld(ctx, width, height, time, project, keys) {
  const state = SCENE_STATES[project.background.state] || SCENE_STATES.idle;
  const motion = project.background.motion ? time * state.speed : 0;
  const [sr, sg, sb] = state.sky;
  const [ar, ag, ab] = state.accent;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `rgb(${sr},${sg},${sb})`);
  gradient.addColorStop(0.56, `rgb(${Math.min(sr + 23, 255)},${Math.min(sg + 32, 255)},${Math.min(sb + 38, 255)})`);
  gradient.addColorStop(1, "#02070b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const sunX = width * 0.24;
  const sunY = height * 0.34;
  const sunR = Math.min(width, height) * 0.052;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 3.4);
  sunGlow.addColorStop(0, `rgba(${state.sun.join(",")},.95)`);
  sunGlow.addColorStop(0.2, `rgba(${state.sun.join(",")},.5)`);
  sunGlow.addColorStop(1, `rgba(${state.sun.join(",")},0)`);
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
  ctx.fillRect(0, height * 0.55, width, height * 0.45);

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

  const ledgeY = height * 0.78;
  polygon(ctx, [[0, ledgeY + 40], [width * 0.3, ledgeY - 35], [width * 0.55, ledgeY + 30], [width, ledgeY - 20], [width, height], [0, height]], "#06141a");
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

  ctx.fillStyle = "rgba(0,0,0,.12)";
  ctx.fillRect(0, 0, width, height);
}

export function WorldCanvas({ project, interactive }) {
  const canvasRef = useRef(null);
  const keys = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let frame = 0;
    let width = 0;
    let height = 0;

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
      drawWorld(context, width, height, now / 1000, project, keys);
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

  return <canvas className="world-canvas" ref={canvasRef} aria-label="Live low-poly animated world" />;
}

export function BackgroundRuntime({ project, interactive }) {
  const { type, mediaUrl } = project.background;
  if (type === "video" && mediaUrl) {
    return <video className="background-media" src={mediaUrl} autoPlay loop muted playsInline />;
  }
  if (type === "image" && mediaUrl) {
    return <img className="background-media" src={mediaUrl} alt="Uploaded background asset" />;
  }
  return <WorldCanvas project={project} interactive={interactive} />;
}

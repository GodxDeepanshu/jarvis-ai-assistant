/**
 * Tony Stark Arc Reactor Canvas Visualizer
 * Renders rotating electromagnetic coils, central energy core, and glowing flares.
 */
class ArcReactorVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.angle1 = 0;
    this.angle2 = 0;
    this.pulse = 0;
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  animate() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 4;

    ctx.clearRect(0, 0, w, h);

    this.angle1 += 0.02;
    this.angle2 -= 0.035;
    this.pulse = (Math.sin(Date.now() * 0.005) + 1) * 0.5;

    // Outer Glow Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rotating Outer Segment Ring
    ctx.translate(cx, cy);
    ctx.rotate(this.angle1);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 1.5);
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00f0ff";
    ctx.stroke();
    ctx.restore();

    // Rotating Inner Segment Ring
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.angle2);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.65, 0, Math.PI);
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 8 Electromagnetic Core Nodes
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const nx = Math.cos(a) * (r * 0.55);
      const ny = Math.sin(a) * (r * 0.55);
      ctx.beginPath();
      ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#00f0ff";
      ctx.fill();
    }
    ctx.restore();

    // Central Palladium Core Bloom
    ctx.save();
    const coreGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, r * 0.45);
    coreGlow.addColorStop(0, "#ffffff");
    coreGlow.addColorStop(0.3, "rgba(0, 240, 255, 0.9)");
    coreGlow.addColorStop(1, "rgba(0, 240, 255, 0)");
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * (0.35 + 0.08 * this.pulse), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    requestAnimationFrame(this.animate);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ArcReactorVisualizer("arc-reactor-header");
});

import { TOTAL_CYCLE, DAY_LENGTH } from './constants.js';

export class DayNightCycle {
  constructor() {
    this.time = 0; // 0-24000 ticks
    this.dayCount = 1;
  }

  update(dt) {
    const speed = 1; // Game speed: 1 tick per frame
    this.time += speed * dt * 60;

    if (this.time >= TOTAL_CYCLE) {
      this.time -= TOTAL_CYCLE;
      this.dayCount++;
    }
  }

  get isDay() {
    return this.time < DAY_LENGTH;
  }

  get isNight() {
    return this.time >= DAY_LENGTH;
  }

  // Returns 0-1, where 0=midnight, 0.5=noon
  get dayProgress() {
    return this.time / TOTAL_CYCLE;
  }

  // Returns light level 0 (dark) to 1 (bright)
  get lightLevel() {
    const progress = this.dayProgress;
    // Day: 0-0.5 (0 to noon to dusk)
    // Night: 0.5-1 (dusk to midnight to dawn)
    if (progress < 0.25) {
      // Dawn: 0 to 0.25 -> 0 to 1
      return progress / 0.25;
    } else if (progress < 0.5) {
      // Day: 0.25 to 0.5 -> 1
      return 1;
    } else if (progress < 0.75) {
      // Dusk: 0.5 to 0.75 -> 1 to 0
      return 1 - (progress - 0.5) / 0.25;
    } else {
      // Night: 0.75 to 1 -> 0 to 0.2
      return 0.2 * (1 - (progress - 0.75) / 0.25);
    }
  }

  get skyColor() {
    const light = this.lightLevel;
    const r = Math.floor(100 + light * 55);
    const g = Math.floor(120 + light * 80);
    const b = Math.floor(180 + light * 75);
    return `rgb(${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)})`;
  }

  get ambientColor() {
    const light = this.lightLevel;
    const v = Math.floor(light * 255);
    return `rgb(${v},${v},${v})`;
  }

  get timeString() {
    const totalMinutes = (this.time / TOTAL_CYCLE) * 24 * 60;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = Math.floor(totalMinutes % 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  render(ctx, canvas) {
    const w = canvas.width;
    const h = canvas.height;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    const light = this.lightLevel;
    const r1 = Math.floor(30 + light * 70);
    const g1 = Math.floor(30 + light * 120);
    const b1 = Math.floor(80 + light * 175);
    const r2 = Math.floor(20 + light * 50);
    const g2 = Math.floor(20 + light * 80);
    const b2 = Math.floor(50 + light * 120);

    skyGrad.addColorStop(0, `rgb(${r1},${g1},${b1})`);
    skyGrad.addColorStop(0.5, `rgb(${r2},${g2},${b2})`);
    skyGrad.addColorStop(1, `rgb(${Math.floor(r2 * 0.7)},${Math.floor(g2 * 0.7)},${Math.floor(b2 * 0.7)})`);

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Stars at night
    if (this.isNight) {
      const starAlpha = (1 - this.lightLevel) * 0.8;
      ctx.fillStyle = `rgba(255,255,255,${starAlpha})`;

      // Draw some simple stars (fixed positions based on day)
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 137 + 42) % w);
        const sy = ((i * 97 + 13) % (h * 0.6));
        const size = ((i * 7) % 3) + 1;
        ctx.fillRect(sx, sy, size, size);
      }
    }

    // Sun (during day/dawn/dusk)
    if (light > 0.2) {
      const sunAngle = this.dayProgress * Math.PI * 2;
      const sunX = w * 0.2 + Math.cos(sunAngle + Math.PI) * w * 0.3;
      const sunY = h * 0.5 + Math.sin(sunAngle + Math.PI) * h * 0.4;

      ctx.fillStyle = `rgba(255,200,50,${light * 0.9})`;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Moon (at night)
    if (this.isNight) {
      const moonAngle = this.dayProgress * Math.PI * 2 + Math.PI;
      const moonX = w * 0.8 + Math.cos(moonAngle) * w * 0.3;
      const moonY = h * 0.5 + Math.sin(moonAngle) * h * 0.4;

      ctx.fillStyle = 'rgba(200,200,220,0.8)';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Crescent effect
      ctx.fillStyle = this.skyColor;
      ctx.beginPath();
      ctx.arc(moonX + 6, moonY - 3, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
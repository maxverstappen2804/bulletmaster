/**
 * BULLET MASTER // 60 FPS HTML5 Dynamic Canvas Tachometer Gauge
 * Features: High-density sweep, Redline zone, Spring physics needle, Peak-hold ghost indicator,
 * Dynamic glow, and gear shift synchronization.
 */

class TachometerGauge {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Display DPI scaling
    this.dpr = window.devicePixelRatio || 1;
    this.width = 500;
    this.height = 500;
    this.initCanvasSize();

    // Gauge Angles (270 degree total sweep from bottom-left to bottom-right)
    this.startAngle = (135 * Math.PI) / 180;
    this.endAngle = (405 * Math.PI) / 180;
    this.totalAngle = this.endAngle - this.startAngle;

    // RPM Telemetry
    this.maxRPM = 10000;
    this.redlineRPM = 8000;
    this.currentRPM = 800; // Idle RPM
    this.targetRPM = 800;
    this.needleVelocity = 0;
    this.peakRPM = 800;
    this.peakDecayTimer = 0;

    // Digital DOM elements
    this.digitalRPMEl = document.getElementById('digitalRPM');
    this.digitalGearEl = document.getElementById('digitalGear');
    this.digitalPercentageEl = document.getElementById('digitalPercentage');
    this.shiftLightEl = document.getElementById('shiftLight');
    this.shiftLightLabel = document.getElementById('shiftLightLabel');
    this.gaugeStatusText = document.getElementById('gaugeStatusText');

    // Animation frame handle
    this.animId = null;

    // Bind resize
    window.addEventListener('resize', () => this.initCanvasSize());

    // Start 60fps engine loop
    this.start();
  }

  initCanvasSize() {
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  setTargetRPM(rpm, playSound = true) {
    // Clamp
    this.targetRPM = Math.max(0, Math.min(this.maxRPM, rpm));

    if (this.targetRPM > this.peakRPM) {
      this.peakRPM = this.targetRPM;
      this.peakDecayTimer = 80; // Hold peak for ~1.3 seconds
    }

    if (playSound && window.soundEngine) {
      window.soundEngine.playRev(this.targetRPM);
    }

    // Update status text
    if (this.gaugeStatusText) {
      if (this.targetRPM >= this.redlineRPM) {
        this.gaugeStatusText.innerHTML = '<span class="text-cyber-redline font-bold animate-pulse">WARNING: MAXIMUM REDLINE ENGAGED</span>';
      } else if (this.targetRPM >= 5000) {
        this.gaugeStatusText.innerHTML = '<span class="text-cyber-cyan font-bold">HIGH VELOCITY VIRAL TRACTION</span>';
      } else {
        this.gaugeStatusText.innerHTML = '<span class="text-slate-400">ORGANIC SPREAD // NOMINAL</span>';
      }
    }
  }

  rpmToAngle(rpm) {
    const ratio = Math.max(0, Math.min(1, rpm / this.maxRPM));
    return this.startAngle + ratio * this.totalAngle;
  }

  updatePhysics() {
    // Spring-damper physics for realistic automotive needle inertia
    const delta = this.targetRPM - this.currentRPM;
    const springForce = delta * 0.14;
    this.needleVelocity += springForce;
    this.needleVelocity *= 0.72; // Damping
    this.currentRPM += this.needleVelocity;

    // High RPM micro-jitter
    if (this.currentRPM > 8200) {
      const jitter = (Math.random() - 0.5) * (this.currentRPM > 9000 ? 120 : 50);
      this.currentRPM += jitter;
    }

    // Clamp current
    this.currentRPM = Math.max(0, Math.min(this.maxRPM + 150, this.currentRPM));

    // Peak needle decay
    if (this.peakDecayTimer > 0) {
      this.peakDecayTimer--;
    } else {
      this.peakRPM = Math.max(this.currentRPM, this.peakRPM - 35);
    }

    // Update DOM counters
    this.updateHUD();
  }

  updateHUD() {
    const roundedRPM = Math.round(this.currentRPM);
    if (this.digitalRPMEl) {
      this.digitalRPMEl.textContent = roundedRPM.toLocaleString();
    }

    if (this.digitalPercentageEl) {
      const pct = Math.round((this.currentRPM / this.maxRPM) * 100);
      this.digitalPercentageEl.textContent = `${pct}% MAX`;
    }

    // Dynamic Gear calculation based on virality speed
    if (this.digitalGearEl) {
      let gear = 'GEAR 1';
      if (roundedRPM < 1500) gear = 'IDLE';
      else if (roundedRPM < 3200) gear = 'GEAR 2';
      else if (roundedRPM < 5200) gear = 'GEAR 3';
      else if (roundedRPM < 7400) gear = 'GEAR 4';
      else if (roundedRPM < 8800) gear = 'GEAR 5';
      else gear = 'GEAR 6 [R]';
      this.digitalGearEl.textContent = gear;
    }

    // Redline shift light
    if (this.shiftLightEl) {
      if (this.currentRPM >= this.redlineRPM) {
        this.shiftLightEl.classList.add('shift-light-active');
        if (this.shiftLightLabel) this.shiftLightLabel.textContent = 'SHIFT NOW!';
      } else {
        this.shiftLightEl.classList.remove('shift-light-active');
        if (this.shiftLightLabel) this.shiftLightLabel.textContent = 'REDLINE SHIFT';
      }
    }
  }

  drawDial() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const radius = 195;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Outer Metallic Bezel Ring
    this.ctx.save();
    const bezelGrad = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    bezelGrad.addColorStop(0, '#1c2436');
    bezelGrad.addColorStop(0.5, '#0c101a');
    bezelGrad.addColorStop(1, '#2a354c');

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius + 24, 0, Math.PI * 2);
    this.ctx.fillStyle = bezelGrad;
    this.ctx.fill();

    // Dark Carbon Dial Face
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius + 18, 0, Math.PI * 2);
    const dialFace = this.ctx.createRadialGradient(cx, cy, 30, cx, cy, radius + 18);
    dialFace.addColorStop(0, '#0a0d16');
    dialFace.addColorStop(0.7, '#080a11');
    dialFace.addColorStop(1, '#05060b');
    this.ctx.fillStyle = dialFace;
    this.ctx.fill();
    this.ctx.restore();

    // 2. Base Background Track Arc
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, this.startAngle, this.endAngle);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 14;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    // Redline Zone Track Arc (8k to 10k)
    const redlineStartAngle = this.rpmToAngle(this.redlineRPM);
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, redlineStartAngle, this.endAngle);
    this.ctx.strokeStyle = 'rgba(255, 8, 68, 0.35)';
    this.ctx.lineWidth = 14;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    // 3. Active RPM Colored Sweep Arc
    const currentAngle = this.rpmToAngle(this.currentRPM);
    if (this.currentRPM > 100) {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius, this.startAngle, currentAngle);
      
      const arcGrad = this.ctx.createConicGradient(this.startAngle, cx, cy);
      arcGrad.addColorStop(0, '#00f2fe');
      arcGrad.addColorStop(0.4, '#4facfe');
      arcGrad.addColorStop(0.7, '#ffb703');
      arcGrad.addColorStop(0.85, '#ff0844');
      arcGrad.addColorStop(1, '#ff0844');

      this.ctx.strokeStyle = arcGrad;
      this.ctx.lineWidth = 14;
      this.ctx.lineCap = 'round';
      this.ctx.shadowColor = this.currentRPM >= this.redlineRPM ? '#ff0844' : '#00f2fe';
      this.ctx.shadowBlur = this.currentRPM >= this.redlineRPM ? 22 : 14;
      this.ctx.stroke();
    }
    this.ctx.restore();

    // 4. Tick Marks & Digits
    this.drawTicks(cx, cy, radius);

    // 5. Dial Brand & Sub-Labels
    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.font = '600 11px Orbitron, sans-serif';
    this.ctx.fillText('RPM x 1000', cx, cy - 80);

    this.ctx.fillStyle = 'rgba(0, 242, 254, 0.6)';
    this.ctx.font = 'bold 9px JetBrains Mono, monospace';
    this.ctx.fillText('BULLET TELEMETRY', cx, cy - 64);

    // Redline text badge
    this.ctx.fillStyle = '#ff0844';
    this.ctx.font = 'bold 10px Orbitron, sans-serif';
    this.ctx.fillText('REDLINE 8-10K', cx + 70, cy + 90);
    this.ctx.restore();

    // 6. Ghost Peak-Hold Needle
    if (this.peakRPM > 500) {
      this.drawPeakNeedle(cx, cy, radius - 20);
    }

    // 7. Dynamic Main Spinning Needle
    this.drawNeedle(cx, cy, radius - 15);

    // 8. Center Hub Bezel
    this.drawCenterHub(cx, cy);
  }

  drawTicks(cx, cy, radius) {
    const totalTicks = 50; // Every 200 RPM
    this.ctx.save();

    for (let i = 0; i <= totalTicks; i++) {
      const rpm = (i / totalTicks) * this.maxRPM;
      const angle = this.rpmToAngle(rpm);
      const isMajor = i % 5 === 0; // Every 1000 RPM
      const isRedline = rpm >= this.redlineRPM;

      const innerOffset = isMajor ? 32 : 18;
      const x1 = cx + (radius - 12) * Math.cos(angle);
      const y1 = cy + (radius - 12) * Math.sin(angle);
      const x2 = cx + (radius - 12 - innerOffset) * Math.cos(angle);
      const y2 = cy + (radius - 12 - innerOffset) * Math.sin(angle);

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);

      if (isRedline) {
        this.ctx.strokeStyle = isMajor ? '#ff0844' : 'rgba(255, 8, 68, 0.6)';
        this.ctx.lineWidth = isMajor ? 3.5 : 1.5;
        this.ctx.shadowColor = '#ff0844';
        this.ctx.shadowBlur = isMajor ? 8 : 0;
      } else {
        this.ctx.strokeStyle = isMajor ? '#ffffff' : 'rgba(255, 255, 255, 0.25)';
        this.ctx.lineWidth = isMajor ? 3 : 1.5;
        this.ctx.shadowBlur = 0;
      }
      this.ctx.stroke();

      // Major Digits (0 to 10)
      if (isMajor) {
        const textRadius = radius - 62;
        const tx = cx + textRadius * Math.cos(angle);
        const ty = cy + textRadius * Math.sin(angle) + 4;

        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = '700 15px Orbitron, sans-serif';
        this.ctx.fillStyle = isRedline ? '#ff0844' : '#e2e8f0';
        if (isRedline) {
          this.ctx.shadowColor = '#ff0844';
          this.ctx.shadowBlur = 10;
        }
        this.ctx.fillText(i / 5, tx, ty);
        this.ctx.restore();
      }
    }

    this.ctx.restore();
  }

  drawPeakNeedle(cx, cy, length) {
    const angle = this.rpmToAngle(this.peakRPM);
    this.ctx.save();
    this.ctx.beginPath();
    const x1 = cx + (length - 20) * Math.cos(angle);
    const y1 = cy + (length - 20) * Math.sin(angle);
    const x2 = cx + length * Math.cos(angle);
    const y2 = cy + length * Math.sin(angle);

    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.strokeStyle = 'rgba(255, 183, 3, 0.7)';
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.shadowColor = '#ffb703';
    this.ctx.shadowBlur = 8;
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawNeedle(cx, cy, length) {
    const angle = this.rpmToAngle(this.currentRPM);
    const isRedline = this.currentRPM >= this.redlineRPM;

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(angle);

    // Needle drop shadow
    this.ctx.shadowColor = isRedline ? 'rgba(255, 8, 68, 0.8)' : 'rgba(0, 242, 254, 0.7)';
    this.ctx.shadowBlur = isRedline ? 20 : 12;

    // Tapered sport needle polygon
    this.ctx.beginPath();
    this.ctx.moveTo(-18, 0); // Tail
    this.ctx.lineTo(0, -4.5);
    this.ctx.lineTo(length, 0); // Tip
    this.ctx.lineTo(0, 4.5);
    this.ctx.closePath();

    const needleGrad = this.ctx.createLinearGradient(0, 0, length, 0);
    if (isRedline) {
      needleGrad.addColorStop(0, '#ff6a00');
      needleGrad.addColorStop(0.5, '#ff0844');
      needleGrad.addColorStop(1, '#ffffff');
    } else {
      needleGrad.addColorStop(0, '#00b4d8');
      needleGrad.addColorStop(0.6, '#00f2fe');
      needleGrad.addColorStop(1, '#ffffff');
    }

    this.ctx.fillStyle = needleGrad;
    this.ctx.fill();

    // Center illuminated accent strip along needle
    this.ctx.beginPath();
    this.ctx.moveTo(10, 0);
    this.ctx.lineTo(length - 5, 0);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawCenterHub(cx, cy) {
    this.ctx.save();
    // Outer metal cap
    const hubGrad = this.ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, 32);
    hubGrad.addColorStop(0, '#334155');
    hubGrad.addColorStop(0.6, '#1e293b');
    hubGrad.addColorStop(1, '#090d16');

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    this.ctx.fillStyle = hubGrad;
    this.ctx.fill();
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Inner glowing ring
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    this.ctx.fillStyle = this.currentRPM >= this.redlineRPM ? '#ff0844' : '#00f2fe';
    this.ctx.shadowColor = this.currentRPM >= this.redlineRPM ? '#ff0844' : '#00f2fe';
    this.ctx.shadowBlur = 15;
    this.ctx.fill();

    // Center jewel
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();

    this.ctx.restore();
  }

  render() {
    this.updatePhysics();
    this.drawDial();
    this.animId = requestAnimationFrame(() => this.render());
  }

  start() {
    if (!this.animId) {
      this.render();
    }
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}

window.TachometerGauge = TachometerGauge;

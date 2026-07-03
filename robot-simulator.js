// Generative Curl Flow Field × Agent Proximity Graph Simulation
// Replaces the KUKA robotic arm in the opening page to match the academic layout
// Features animated vector flow lines, moving nodes, dynamic connection lines, and zoom/rotate breathing oscillations

class RobotSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.time = 0;
    
    // Set scale for high-DPI displays
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // N = 12 agents (matching FIG.00 in the layout)
    this.numAgents = 12;
    this.agents = [];
    this.initAgents();
    
    // Interaction states
    this.mouse = { x: -1000, y: -1000 };
    this.isMouseDown = false;
    
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    this.canvas.addEventListener('mousedown', () => this.handleMouseDown());
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    // Also track window-level mouse so the field responds even near edges
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    window.addEventListener('mouseleave', () => {
      this.mouse.x = -10000;
      this.mouse.y = -10000;
    });
    
    // Zoom and rotation oscillation variables
    this.zoomScale = 1.05;
    this.rotationAngle = 0;
    
    // Start animation loop
    this.animate();
  }
  
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Clamp coordinates on resize
    if (this.agents && this.agents.length > 0) {
      this.agents.forEach(a => {
        a.x = Math.max(0, Math.min(this.width, a.x));
        a.y = Math.max(0, Math.min(this.height, a.y));
      });
    }
  }
  
  initAgents() {
    this.agents = [];
    for (let i = 0; i < this.numAgents; i++) {
      this.agents.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 2.0,
        vy: (Math.random() - 0.5) * 2.0,
        r: i === 0 ? 5.5 : 4.5 // Agent 0 is slightly larger solid black circle
      });
    }
  }
  
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }
  
  handleMouseLeave() {
    this.mouse.x = -1000;
    this.mouse.y = -1000;
    this.isMouseDown = false;
  }
  
  handleMouseDown() {
    this.isMouseDown = true;
  }
  
  handleMouseUp() {
    this.isMouseDown = false;
  }
  
  getCurlAngle(x, y) {
    const dx = x - this.width / 2;
    const dy = y - this.height / 2;
    
    // Base swirl vector field
    const baseAngle = Math.atan2(dy, dx) + Math.PI / 2;
    
    // Wavy modulation
    const wave = Math.sin(x * 0.008 + this.time * 0.04) * 0.35 +
                 Math.cos(y * 0.008 + this.time * 0.04) * 0.35;
    
    let angle = baseAngle + wave;
    
    // Mouse gravity well — blend toward the mouse direction
    const mx = this.mouse.x;
    const my = this.mouse.y;
    const mdx = mx - x;
    const mdy = my - y;
    const mdist = Math.hypot(mdx, mdy);
    const gravRadius = 280;  // pixels of influence
    
    if (mdist < gravRadius && mdist > 1) {
      // How strongly the line bends toward mouse (0 at edge, 1 at center)
      const strength = Math.pow(1 - mdist / gravRadius, 1.5) * 1.8;
      const mouseAngle = Math.atan2(mdy, mdx);
      // Interpolate angle toward mouse direction
      const diff = mouseAngle - angle;
      // Wrap angle diff to [-π, π]
      const wrappedDiff = ((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      angle += wrappedDiff * strength;
    }
    
    return angle;
  }
  
  update() {
    this.time += 0.12;
    
    // Move agents along flow field vectors with flocking forces
    for (let i = 0; i < this.agents.length; i++) {
      const a = this.agents[i];
      
      // 1. Flow Field Steering Force
      const flowAngle = this.getCurlAngle(a.x, a.y);
      const fx = Math.cos(flowAngle) * 0.12;
      const fy = Math.sin(flowAngle) * 0.12;
      a.vx += fx;
      a.vy += fy;
      
      // 2. Separation Force (Prevents agents from clustering/falling together)
      let sepX = 0;
      let sepY = 0;
      let sepCount = 0;
      const minSeparation = 55; // pixels
      
      for (let j = 0; j < this.agents.length; j++) {
        if (i === j) continue;
        const other = this.agents[j];
        const d = Math.hypot(a.x - other.x, a.y - other.y);
        
        if (d > 0 && d < minSeparation) {
          // Push away from neighbors
          sepX += (a.x - other.x) / d;
          sepY += (a.y - other.y) / d;
          sepCount++;
        }
      }
      
      if (sepCount > 0) {
        a.vx += (sepX / sepCount) * 0.55;
        a.vy += (sepY / sepCount) * 0.55;
      }
      
      // 3. Wandering Force (Adds active "flying around" behavior)
      const wanderAngle = Math.random() * Math.PI * 2;
      a.vx += Math.cos(wanderAngle) * 0.12;
      a.vy += Math.sin(wanderAngle) * 0.12;
      
      // 4. Mouse Interactive Forces
      if (this.mouse.x > -500) {
        const mdx = a.x - this.mouse.x;
        const mdy = a.y - this.mouse.y;
        const mdist = Math.hypot(mdx, mdy);
        
        if (mdist < 120 && mdist > 0) {
          // Repel from mouse cursor
          const strength = this.isMouseDown ? 1.8 : 0.9;
          a.vx += (mdx / mdist) * strength;
          a.vy += (mdy / mdist) * strength;
        }
      }
      
      // 5. Speed Limit
      const speed = Math.hypot(a.vx, a.vy);
      const maxSpeed = 2.8;
      if (speed > maxSpeed) {
        a.vx = (a.vx / speed) * maxSpeed;
        a.vy = (a.vy / speed) * maxSpeed;
      }
      
      // 6. Move
      a.x += a.vx;
      a.y += a.vy;
      
      // 7. Wrap Around Edges (Toroidal topology)
      if (a.x < -20) a.x = this.width + 20;
      if (a.x > this.width + 20) a.x = -20;
      if (a.y < -20) a.y = this.height + 20;
      if (a.y > this.height + 20) a.y = -20;
      
      // 8. Damping
      a.vx *= 0.96;
      a.vy *= 0.96;
    }
  }
  
  drawFlowField() {
    const ctx = this.ctx;
    const step = 28;
    
    for (let x = step; x < this.width; x += step) {
      for (let y = step; y < this.height; y += step) {
        const angle = this.getCurlAngle(x, y);
        const len = 9;
        const ex = x + Math.cos(angle) * len;
        const ey = y + Math.sin(angle) * len;
        
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        
        // Dot at base
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  draw() {
    const ctx = this.ctx;
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw subtle flow field vectors
    this.drawFlowField();
    
    // Draw proximity graph edges between close agents
    for (let i = 0; i < this.agents.length; i++) {
      for (let j = i + 1; j < this.agents.length; j++) {
        const a = this.agents[i];
        const b = this.agents[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        
        if (d < 160) {
          const alpha = (1 - d / 160) * 0.65;
          ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
          ctx.lineWidth = (1 - d / 160) * 1.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    
    // Draw agents
    for (let i = 0; i < this.agents.length; i++) {
      const a = this.agents[i];
      
      // Hollow ring for all but agent 0
      if (i === 0) {
        // Solid black filled circle
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Open circle ring
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.0;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    
    // Label in bottom left corner
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.font = '400 8px "IBM Plex Mono"';
    ctx.textAlign = 'left';
    ctx.fillText('FIG.00 – CURL FLOW FIELD × AGENT PROXIMITY GRAPH · N=12 · GENERATIVE', 14, this.height - 10);
  }
  
  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

window.initRobotSimulator = function(canvasId) {
  return new RobotSimulator(canvasId);
};

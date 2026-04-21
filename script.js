var cv = document.getElementById('cv');
var ctx = cv.getContext('2d');
var W, H, t = 0, mx, my, mode = 'warp';
var stars = [], particles = [];

function resize() {
  var wrap = cv.parentElement;
  W = cv.width = wrap.offsetWidth;
  H = cv.height = 580;
  mx = W / 2; my = H / 2;
  initMode();
}

function initMode() {
  stars = []; particles = [];
  ctx.clearRect(0, 0, W, H);
  if (mode === 'warp') {
    for (var i = 0; i < 800; i++) {
      var a = Math.random() * Math.PI * 2;
      var r = 10 + Math.random() * Math.min(W, H) * 0.5;
      stars.push({ a: a, r: r, z: Math.random() * W, spd: 0.5 + Math.random() * 2, hue: 180 + Math.random() * 80, size: Math.random() * 2 });
    }
  }
  if (mode === 'galaxy') {
    for (var i = 0; i < 1500; i++) {
      var arm = i % 3;
      var d = Math.pow(Math.random(), 0.6) * Math.min(W, H) * 0.44;
      var a = arm * (Math.PI * 2 / 3) + d * 0.013 + (Math.random() - 0.5) * 0.5;
      stars.push({ a: a, r: d, spd: 0.005 + Math.random() * 0.005, hue: [200, 270, 30][arm], size: Math.random() * 2, b: 60 + Math.random() * 40 });
    }
  }
  if (mode === 'fluid') {
    for (var i = 0; i < 200; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, size: 6 + Math.random() * 18, hue: 180 + Math.random() * 60 });
    }
  }
}

function setMode(m) {
  mode = m;
  ['b0','b1','b2','b3','b4'].forEach(function(id) {
    var el = document.getElementById(id);
    el.style.background = 'rgba(0,0,0,0.5)';
    el.style.borderColor = 'rgba(255,255,255,0.2)';
    el.style.color = 'rgba(255,255,255,0.6)';
    el.classList.remove('on');
  });
  var idx = {warp:'b0',lightning:'b1',galaxy:'b2',fluid:'b3',fireworks:'b4'}[m];
  document.getElementById(idx).classList.add('on');
  initMode();
}

function drawWarp() {
  ctx.fillStyle = 'rgba(0,0,5,0.15)';
  ctx.fillRect(0, 0, W, H);
  var cx = W / 2, cy = H / 2;
  var ox = (mx - cx) * 0.05, oy = (my - cy) * 0.05;
  for (var i = 0; i < stars.length; i++) {
    var s = stars[i];
    s.z -= s.spd * 3;
    if (s.z <= 0) s.z = W;
    var pz = s.z / W;
    var sx = cx + ox + Math.cos(s.a) * s.r / pz;
    var sy = cy + oy + Math.sin(s.a) * s.r / pz * 0.55;
    var px2 = cx + ox + Math.cos(s.a) * s.r / (pz + 0.05);
    var py2 = cy + oy + Math.sin(s.a) * s.r / (pz + 0.05) * 0.55;
    if (sx < 0 || sx > W || sy < 0 || sy > H) continue;
    var alpha = Math.min(1, (1 - pz) * 1.5);
    var hue = s.hue + t * 0.5;
    ctx.strokeStyle = 'hsla(' + hue + ',100%,85%,' + alpha + ')';
    ctx.lineWidth = Math.max(0.5, (1 - pz) * 3);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(px2, py2); ctx.stroke();
    ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.5, (1 - pz) * 2.5), 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + hue + ',100%,95%,' + alpha + ')';
    ctx.fill();
  }
  for (var r = 12; r >= 1; r--) {
    ctx.beginPath();
    var rr = r * 20 + Math.sin(t * 0.05 + r) * 8;
    ctx.ellipse(cx + ox * 0.1, cy + oy * 0.1, rr, rr * 0.5, t * 0.02, 0, Math.PI * 2);
    ctx.strokeStyle = 'hsla(' + ((t * 2 + r * 25) % 360) + ',100%,65%,' + (1 - r / 13) * 0.6 + ')';
    ctx.lineWidth = 1.5; ctx.stroke();
  }
  var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
  g.addColorStop(0, 'rgba(100,220,255,0.5)');
  g.addColorStop(0.5, 'rgba(50,100,255,0.15)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2); ctx.fill();
}

function boltLine(x1, y1, x2, y2, depth, hue) {
  if (depth <= 0) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    return;
  }
  var mx2 = (x1 + x2) / 2 + (Math.random() - 0.5) * 80 / depth;
  var my2 = (y1 + y2) / 2 + (Math.random() - 0.5) * 80 / depth;
  boltLine(x1, y1, mx2, my2, depth - 1, hue);
  boltLine(mx2, my2, x2, y2, depth - 1, hue);
  if (Math.random() < 0.3 && depth > 1) {
    boltLine(mx2, my2, mx2 + (Math.random() - 0.5) * 120, my2 + (Math.random() - 0.5) * 120, depth - 2, hue + 40);
  }
}

function drawLightning() {
  ctx.fillStyle = 'rgba(0,0,8,0.3)';
  ctx.fillRect(0, 0, W, H);
  var n = 2 + Math.floor(Math.random() * 3);
  for (var i = 0; i < n; i++) {
    var hue = 200 + Math.random() * 100;
    ctx.strokeStyle = 'hsla(' + hue + ',100%,90%,0.9)';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 20; ctx.shadowColor = 'hsla(' + hue + ',100%,80%,1)';
    boltLine(mx, my, Math.random() < 0.5 ? 0 : W, Math.random() * H, 5, hue);
  }
  for (var i = 0; i < 2; i++) {
    var hue = 260 + Math.random() * 60;
    ctx.strokeStyle = 'hsla(' + hue + ',100%,90%,0.7)';
    ctx.lineWidth = 1;
    ctx.shadowColor = 'hsla(' + hue + ',100%,80%,1)';
    boltLine(mx, my, Math.random() * W, H, 4, hue);
  }
  var g = ctx.createRadialGradient(mx, my, 0, mx, my, 50);
  g.addColorStop(0, 'rgba(180,140,255,0.8)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, 50, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
}

function drawGalaxy() {
  ctx.fillStyle = 'rgba(0,0,5,0.12)';
  ctx.fillRect(0, 0, W, H);
  var cx = W / 2 + (mx - W / 2) * 0.05;
  var cy = H / 2 + (my - H / 2) * 0.05;
  var tilt = 0.38;
  for (var i = 0; i < stars.length; i++) {
    var s = stars[i];
    s.a += s.spd;
    var px = cx + Math.cos(s.a) * s.r;
    var py = cy + Math.sin(s.a) * s.r * tilt;
    var tw = 0.6 + Math.sin(t * 0.04 + i) * 0.4;
    ctx.beginPath(); ctx.arc(px, py, s.size * tw, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + (s.hue + t * 0.2) + ',100%,' + s.b + '%,' + tw * 0.9 + ')';
    ctx.fill();
  }
  for (var g2 = 5; g2 >= 0; g2--) {
    var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20 + g2 * 15);
    grd.addColorStop(0, 'rgba(255,240,200,' + (0.9 - g2 * 0.12) + ')');
    grd.addColorStop(0.5, 'rgba(180,140,255,' + (0.3 - g2 * 0.04) + ')');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 20 + g2 * 15, (20 + g2 * 15) * tilt, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFluid() {
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.fillRect(0, 0, W, H);
  for (var i = 0; i < stars.length; i++) {
    var p = stars[i];
    var dx = mx - p.x, dy = my - p.y;
    var d = Math.sqrt(dx * dx + dy * dy) + 1;
    p.vx += dx / d / d * 60;
    p.vy += dy / d / d * 60;
    p.vx *= 0.93; p.vy *= 0.93;
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    var spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    var hue = p.hue + spd * 5;
    var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size + spd * 2);
    g.addColorStop(0, 'hsla(' + hue + ',10%,92%,0.95)');
    g.addColorStop(0.4, 'hsla(' + hue + ',60%,65%,0.5)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.size + spd * 2, p.size, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
    ctx.fill();
  }
}

function spawnFirework() {
  var x = mx + (Math.random() - 0.5) * 200;
  var y = my + (Math.random() - 0.5) * 150;
  var hue = Math.random() * 360;
  var count = 80 + Math.floor(Math.random() * 80);
  for (var i = 0; i < count; i++) {
    var a = Math.random() * Math.PI * 2;
    var spd = 2 + Math.random() * 8;
    particles.push({ x: x, y: y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: 1, hue: hue + Math.random() * 40, size: 1.5 + Math.random() * 2.5 });
  }
  for (var i = 0; i < 12; i++) {
    var a = Math.random() * Math.PI * 2;
    particles.push({ x: x, y: y, vx: Math.cos(a) * (1 + Math.random() * 4), vy: Math.sin(a) * (1 + Math.random() * 4), life: 1, hue: hue + 180, size: 3 + Math.random() * 4, trail: true });
  }
}

function drawFireworks() {
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(0, 0, W, H);
  if (t % 18 === 0) spawnFirework();
  for (var i = particles.length - 1; i >= 0; i--) {
    var p = particles[i];
    p.vy += 0.06;
    p.vx *= 0.98; p.vy *= 0.98;
    p.x += p.vx; p.y += p.vy;
    p.life -= p.trail ? 0.018 : 0.013;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(' + p.hue + ',100%,' + (p.trail ? 80 : 70) + '%,' + p.life + ')';
    ctx.fill();
    if (!p.trail) {
      ctx.strokeStyle = 'hsla(' + p.hue + ',100%,90%,' + p.life * 0.5 + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4); ctx.stroke();
    }
  }
}

function loop() {
  t++;
  if (mode === 'warp') drawWarp();
  else if (mode === 'lightning') drawLightning();
  else if (mode === 'galaxy') drawGalaxy();
  else if (mode === 'fluid') drawFluid();
  else if (mode === 'fireworks') drawFireworks();
  requestAnimationFrame(loop);
}

cv.addEventListener('mousemove', function(e) {
  var r = cv.getBoundingClientRect();
  mx = (e.clientX - r.left) * (W / r.width);
  my = (e.clientY - r.top) * (H / r.height);
});

cv.addEventListener('click', function(e) {
  var r = cv.getBoundingClientRect();
  mx = (e.clientX - r.left) * (W / r.width);
  my = (e.clientY - r.top) * (H / r.height);
  if (mode === 'fireworks') { spawnFirework(); spawnFirework(); spawnFirework(); }
});

window.addEventListener('resize', resize);
resize();
loop();
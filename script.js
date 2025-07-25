const canvas = document.getElementById('bowCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

window.addEventListener('resize', () => {
  resizeCanvas();
  updateScale();
});

const bowImage = new Image();
bowImage.src = 'moño.png'; // Imagen del moño

let SCALE = 2;
const USER_SCALE = 3; // Cambia esto para hacer el moño más grande o pequeño

function updateScale() {
  const maxMoñoSize = Math.min(window.innerWidth, window.innerHeight) * 0.8;
  const imageMaxDim = Math.max(bowImage.width, bowImage.height);
  SCALE = (maxMoñoSize / imageMaxDim) * USER_SCALE;
}

// Ajustar STEP según el dispositivo
let STEP = 6;
if (window.innerWidth < 768) {
  STEP = 2; // Menos partículas en móviles
}

let particles = [];
let targetPositions = [];

bowImage.onload = () => {
  updateScale();

  const tempCanvas = document.createElement('canvas');
  const tctx = tempCanvas.getContext('2d');
  tempCanvas.width = bowImage.width;
  tempCanvas.height = bowImage.height;
  tctx.drawImage(bowImage, 0, 0);

  const imgData = tctx.getImageData(0, 0, bowImage.width, bowImage.height);
  const data = imgData.data;

  for (let y = 0; y < bowImage.height; y += STEP) {
    for (let x = 0; x < bowImage.width; x += STEP) {
      let index = (y * bowImage.width + x) * 4 + 3;
      if (data[index] > 128) {
        let posX = (x - bowImage.width / 2) * SCALE;
        let posY = (y - bowImage.height / 2) * SCALE;
        let posZ = (Math.random() - 0.5) * 160 * SCALE;
        targetPositions.push({ x: posX, y: posY, z: posZ });
      }
    }
  }

  let maxDistance = 0;
  const distances = [];

  for (let i = 0; i < targetPositions.length; i++) {
    const p = targetPositions[i];
    let dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
    distances.push(dist);
    if (dist > maxDistance) maxDistance = dist;
  }

  for (let i = 0; i < targetPositions.length; i++) {
    particles.push({
      x: 0,
      y: 0,
      z: 0,
      target: targetPositions[i],
      size: Math.random() * 2 + 1,
      color: `hsl(330, 80%, ${60 + Math.random() * 20}%)`,
      distanceNorm: distances[i] / maxDistance
    });
  }

  animate();
};

let formationProgress = 0;
let rotationY = 0;

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  rotationY += 0.002;
  formationProgress = Math.min(1, formationProgress + 0.015);

  particles.forEach(p => {
    let progressForParticle = Math.max(0, (formationProgress - p.distanceNorm) / (1 - p.distanceNorm + 0.0001));
    progressForParticle = Math.min(progressForParticle, 1);

    p.x += (p.target.x - p.x) * 0.05 * progressForParticle;
    p.y += (p.target.y - p.y) * 0.05 * progressForParticle;
    p.z += (p.target.z - p.z) * 0.05 * progressForParticle;

    let cosY = Math.cos(rotationY);
    let sinY = Math.sin(rotationY);
    let xRot = p.x * cosY - p.z * sinY;
    let zRot = p.x * sinY + p.z * cosY;

    let scale = 600 / (600 + zRot);
    let x2d = xRot * scale;
    let y2d = p.y * scale;

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(x2d, y2d, p.size * scale, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
  requestAnimationFrame(animate);
}

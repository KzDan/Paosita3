const canvas = document.getElementById('bowCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const bowImage = new Image();
bowImage.src = 'moño.png'; // tu moño coquette rosa

let particles = [];
let targetPositions = [];

bowImage.onload = () => {
  const tempCanvas = document.createElement('canvas');
  const tctx = tempCanvas.getContext('2d');
  tempCanvas.width = bowImage.width;
  tempCanvas.height = bowImage.height;
  tctx.drawImage(bowImage, 0, 0);

  const imgData = tctx.getImageData(0, 0, bowImage.width, bowImage.height);
  const data = imgData.data;

  // Extraer TODOS los píxeles opacos (relleno completo)
  for (let y = 0; y < bowImage.height; y += 5) {
    for (let x = 0; x < bowImage.width; x += 5) {
      let index = (y * bowImage.width + x) * 4 + 3;
      if (data[index] > 128) {  // píxel opaco
        let posX = x - bowImage.width / 2;
        let posY = y - bowImage.height / 2;
        let posZ = (Math.random() - 0.5) * 160;
        targetPositions.push({ x: posX, y: posY, z: posZ });
      }
    }
  }

  // Calcular distancias para animación adentro-hacia-fuera
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
      x: 0, // Empiezan en el centro (para efecto adentro-hacia-fuera)
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
    // El progreso individual depende de la distancia normalizada para que se forme de adentro hacia fuera
    let progressForParticle = Math.max(0, (formationProgress - p.distanceNorm) / (1 - p.distanceNorm + 0.0001));
    progressForParticle = Math.min(progressForParticle, 1);

    // Interpolamos la posición desde el centro (0,0,0) a su posición objetivo según el progreso individual
    p.x += (p.target.x - p.x) * 0.05 * progressForParticle;
    p.y += (p.target.y - p.y) * 0.05 * progressForParticle;
    p.z += (p.target.z - p.z) * 0.05 * progressForParticle;

    // Rotación Y 3D
    let cosY = Math.cos(rotationY);
    let sinY = Math.sin(rotationY);
    let xRot = p.x * cosY - p.z * sinY;
    let zRot = p.x * sinY + p.z * cosY;

    // Proyección perspectiva simple
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

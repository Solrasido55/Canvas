const canvas = document.querySelector("canvas");
const dpr = window.devicePixelRatio;
const ctx = canvas.getContext("2d");

let canvasWidth, canvasHeight, particles, TOTAL;

function init() {
  canvasWidth = innerWidth;
  canvasHeight = innerHeight;

  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";

  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;
  ctx.scale(dpr, dpr);

  particles = [];
  TOTAL = canvasWidth / 20;

  for (let i = 0; i < TOTAL; i++) {
    const x = randomNumberBetween(0, canvasWidth);
    const y = randomNumberBetween(0, canvasHeight);
    const radius = randomNumberBetween(50, 100);
    const vy = randomNumberBetween(1, 5);
    const particle = new Particle(x, y, radius, vy);
    particles.push(particle);
  }
}

const feGaussianBlur = document.querySelector("feGaussianBlur");
const feColorMatrix = document.querySelector("feColorMatrix");

const controls = new (function () {
  this.blurValue = 40;
  this.alphaChannel = 100;
  this.alphaOffset = -23;
  this.acc = 1.03;
})();

let gui = new dat.GUI();

const gooeyEffect = gui.addFolder("Gooey Effect");
const particleProperty = gui.addFolder("Particle Property");

gooeyEffect.add(controls, "blurValue", 0, 100).onChange(value => {
  feGaussianBlur.setAttribute("stdDeviation", value);
});

gooeyEffect.add(controls, "alphaChannel", 1, 200).onChange(value => {
  feColorMatrix.setAttribute(
    "values",
    `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${value} ${controls.alphaOffset}`
  );
});

gooeyEffect.add(controls, "alphaOffset", -40, 40).onChange(value => {
  feColorMatrix.setAttribute(
    "values",
    `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${controls.alphaChannel} ${value}`
  );
});

particleProperty.add(controls, "acc", 1, 1.5, 0.01).onChange(value => {
  particles.forEach(particle => (particle.acc = value));
});

gooeyEffect.open();
particleProperty.open();

class Particle {
  constructor(x, y, radius, vy) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vy = vy;
    this.acc = 1.03;
  }

  update() {
    this.vy *= this.acc;
    this.y += this.vy;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, (Math.PI / 180) * 360);
    ctx.fillStyle = "orange";
    ctx.fill();
    ctx.closePath();
  }
}

const randomNumberBetween = (min, max) => {
  return Math.random() * (max - min + 1) + min;
};

let interval = 1000 / 60;
let now, delta;
let then = Date.now();

function animate() {
  window.requestAnimationFrame(animate);
  now = Date.now();
  delta = now - then;
  if (delta < interval) return;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  particles.forEach(particle => {
    particle.update();
    particle.draw();
    if (particle.y > canvasHeight + particle.radius) {
      particle.y = 0 - particle.radius;
      particle.x = randomNumberBetween(0, canvasWidth);
      particle.radius = randomNumberBetween(50, 100);
      particle.vy = randomNumberBetween(1, 5);
    }
  });
  then = now - (delta % interval);
}

window.addEventListener("load", () => {
  init();
  animate();
});

window.addEventListener("resize", init);

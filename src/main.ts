import "./style.css";

const canvas = document.querySelector("#app canvas")! as HTMLCanvasElement;
const c = canvas.getContext("2d")!;
let scale: {
  factor: number;
  offsetX: number;
  offsetY: number;
};
autoScale();
handleProjectiles();

let game: {
  score: number;
  player: Player;
  enemies: Set<Enemy>;
  projectiles: Set<Projectile>;
  particles: Set<Particle>;
};
function init() {
  game = {
    score: 0,
    player: new Player({
      position: { x: 50, y: 50 },
      radius: 5,
      color: "green",
    }),
    enemies: new Set<Enemy>(),
    projectiles: new Set<Projectile>(),
    particles: new Set<Particle>(),
  };
  window.game = game;
  requestAnimationFrame(animate);
}

function animate(time: DOMHighResTimeStamp) {
  update(time);
  render();
  requestAnimationFrame(animate);
}

let lastEnemyTime = -1000;

function update(time: DOMHighResTimeStamp) {
  if (time > lastEnemyTime + 1000) {
    lastEnemyTime = time;
    spawnEnemy();
  }
  for (const projectile of game.projectiles) {
    projectile.update();
  }
  for (const enemy of game.enemies) {
    enemy.update();
  }
}

function render() {
  c.fillStyle = "rgba(0,0,0,0.05)";
  c.fillRect(0, 0, canvas.width, canvas.height);

  for (const projectile of game.projectiles) {
    projectile.draw();
  }

  for (const enemy of game.enemies) {
    enemy.draw();
  }

  game.player.draw();
}

class Entity {
  position: Offset;
  velocity: Offset;
  radius: number;
  color: string;

  constructor({
    position,
    velocity = { x: 0, y: 0 },
    radius,
    color,
  }: {
    position: Offset;
    velocity?: Offset;
    radius: number;
    color: string;
  }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  draw() {
    const { color } = this;
    const {
      position: { x, y },
      radius,
    } = getScaledValues(this);
    c.beginPath();
    c.arc(x, y, radius, 0, Math.PI * 2, false);
    c.fillStyle = color;
    c.fill();
  }
}

class Player extends Entity {}

class Enemy extends Entity {}
class Projectile extends Entity {
  color = "white";
}
class Particle extends Entity {}

interface Offset {
  x: number;
  y: number;
}

function getScaledValues(entity: Entity) {
  const { factor, offsetX, offsetY } = scale;
  const position = {
    x: entity.position.x * factor - offsetX,
    y: entity.position.y * factor - offsetY,
  };
  const radius = entity.radius * factor;
  return { position, radius };
}

function autoScale() {
  function updateScale() {
    if (innerWidth > innerHeight) {
      scale = {
        factor: innerWidth / 50,
        offsetX: 0,
        offsetY: innerWidth - innerHeight,
      };
    } else {
      scale = {
        factor: innerHeight / 50,
        offsetX: innerHeight - innerWidth,
        offsetY: 0,
      };
    }
    window.scale = scale;
    canvas.width = innerWidth * 2;
    canvas.height = innerHeight * 2;

    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
  }

  let resizeDebounce: number;
  addEventListener("resize", () => {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(() => {
      updateScale();
    }, 100);
  });

  updateScale();
}
function handleProjectiles() {
  canvas.addEventListener("pointerdown", (event) => {
    const distance = {
      x: event.clientX - innerWidth / 2,
      y: event.clientY - innerHeight / 2,
    };
    const angle = Math.atan2(distance.y, distance.x);

    console.log(distance, angle, event);

    game.projectiles.add(
      new Projectile({
        position: { ...game.player.position },
        velocity: { x: Math.cos(angle), y: Math.sin(angle) },
        color: "white",
        radius: 1,
      })
    );
  });
}
function spawnEnemy() {
  const position =
    Math.random() < 0.5
      ? { x: Math.random() < 0.5 ? 0 : 100, y: Math.random() * 100 }
      : { x: Math.random() * 100, y: Math.random() < 0.5 ? 0 : 100 };

  const distance = {
    x: game.player.position.x - position.x,
    y: game.player.position.y - position.y,
  };
  const angle = Math.atan2(distance.y, distance.x);

  game.enemies.add(
    new Enemy({
      position,
      velocity: { x: Math.cos(angle) / 10, y: Math.sin(angle) / 10 },
      radius: Math.random() * 5,
      color: `hsl(${Math.random() * 360}, 50%,50%)`,
    })
  );
}
init();

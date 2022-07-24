import { audio } from "./audio";
import { Enemy, Entity, Particle, Player, Projectile } from "./entities";
import { autoScale } from "./scale";
import "./style.css";

const canvas = document.querySelector("#app canvas")! as HTMLCanvasElement;
const menu = document.querySelector("#menu")! as HTMLDivElement;
const scoreEl = document.querySelector("#score")! as HTMLDivElement;
const c = canvas.getContext("2d")!;
let animationId: number;
autoScale(canvas);
handleProjectiles();
handleMenu();

let game: {
  running: boolean;
  score: number;
  player: Player;
  enemies: Set<Enemy>;
  projectiles: Set<Projectile>;
  particles: Set<Particle>;
};
function startGame() {
  menu.classList.add("hidden");
  game = {
    running: true,
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
  if (!animationId) {
    animationId = requestAnimationFrame(animate);
  }
}
function gameOver() {
  audio.play("game-over");
  game.running = false;
  menu.classList.remove("hidden");
}

function animate(time: DOMHighResTimeStamp) {
  update(time);
  render();
  animationId = requestAnimationFrame(animate);
}

let lastEnemyTime = -1000;

function update(time: DOMHighResTimeStamp) {
  if (time > lastEnemyTime + 1000) {
    lastEnemyTime = time;
    spawnEnemy();
  }
  for (const particle of game.particles) {
    particle.update();
    if (isOutOfBounds(particle) || particle.alpha <= 0) {
      game.particles.delete(particle);
    }
  }
  for (const projectile of game.projectiles) {
    projectile.update();
    if (isOutOfBounds(projectile)) {
      game.projectiles.delete(projectile);
    }
  }
  for (const enemy of game.enemies) {
    enemy.update();

    for (const projectile of game.projectiles) {
      const distance = Math.hypot(
        projectile.position.x - enemy.position.x,
        projectile.position.y - enemy.position.y
      );
      if (distance - projectile.radius < 2) {
        game.projectiles.delete(projectile);
        audio.play("enemy-hit2");
        if (enemy.radius > 3) {
          game.score += 100;
          enemy.radius *= 0.5;
        } else {
          game.score += 250;
          game.enemies.delete(enemy);
        }
        explode(enemy, projectile);
      }
    }
  }
  if (!game.running) {
    return;
  }
  for (const enemy of game.enemies) {
    const distance = Math.hypot(
      game.player.position.x - enemy.position.x,
      game.player.position.y - enemy.position.y
    );
    if (distance - enemy.radius < 2) {
      explode(game.player, enemy);
      gameOver();
    }
  }
}

function render() {
  c.fillStyle = "rgba(0,0,0,0.05)";
  c.fillRect(0, 0, canvas.width, canvas.height);

  for (const particle of game.particles) {
    particle.draw(c);
  }

  for (const projectile of game.projectiles) {
    projectile.draw(c);
  }

  for (const enemy of game.enemies) {
    enemy.draw(c);
  }

  if (game.running) {
    game.player.draw(c);
  }

  scoreEl.textContent = `${game.score}`;
}
function handleProjectiles() {
  canvas.addEventListener("pointerdown", (event) => {
    const distance = {
      x: event.clientX - innerWidth / 2,
      y: event.clientY - innerHeight / 2,
    };
    const angle = Math.atan2(distance.y, distance.x);

    game.projectiles.add(
      new Projectile({
        position: { ...game.player.position },
        velocity: { x: Math.cos(angle), y: Math.sin(angle) },
        color: "white",
        radius: 1,
      })
    );
    audio.play("projectile");
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
      radius: Math.random() * 4 + 1,
      color: `hsl(${Math.random() * 360}, 50%,50%)`,
    })
  );
}
function isOutOfBounds(entity: Entity) {
  const { x, y } = entity.position;
  return x < 0 || y < 0 || x > 100 || y > 100;
}
function handleMenu() {
  menu.querySelector("button")?.addEventListener("click", () => {
    startGame();
  });
}
function explode(entity: Entity, other: Entity) {
  for (let i = 0; i < entity.radius ** 2 + 4; i++) {
    const velocity = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    };
    game.particles.add(
      new Particle({
        position: { ...other.position },
        radius: 0.5,
        color: entity.color,
        velocity,
        alpha: 0.5,
      })
    );
  }
}
startGame();

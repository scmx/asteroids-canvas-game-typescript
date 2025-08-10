import { handleAudio } from "./audio";
import { Enemy, Entity, Particle, Player, Pool, Projectile } from "./entities";
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
const audio = handleAudio();
const pointerAngles = new Map()

let game: {
  running: boolean;
  score: number;
  player: Player;
  enemies: Pool<Enemy>;
  projectiles: Pool<Projectile>;
  particles: Pool<Particle>;
};
function startGame() {
  audio.play("buzz");
  menu.classList.add("hidden");
  game = {
    running: true,
    score: 0,
    player: new Player().start({
      position: { x: 50, y: 50 },
      radius: 5,
      color: "green",
    }),
    enemies: new Pool(Enemy, 100),
    projectiles: new Pool(Projectile, 100),
    particles: new Pool(Particle, 100),
  };
  (window as any).game = game;
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
  const spawnInterval = Math.max(500, 1000 - Math.pow(game.score, 2 / 3));
  if (time > lastEnemyTime + spawnInterval) {
    lastEnemyTime = time;
    spawnEnemy();
  }
  for (const particle of game.particles) {
    particle.update();
    if (isOutOfBounds(particle) || particle.alpha <= 0) {
      particle.free = true
    }
  }
  for (const projectile of game.projectiles) {
    projectile.update();
    if (isOutOfBounds(projectile)) {
      projectile.free = true
    }
  }
  for (const enemy of game.enemies) {
    if (enemy.free) {
      continue;
    }
    enemy.update();

    for (const projectile of game.projectiles) {
      const distance = Math.hypot(
        projectile.position.x - enemy.position.x,
        projectile.position.y - enemy.position.y,
      );
      if (distance - projectile.radius >= 2) {
        continue;
      }
      projectile.free = true
      audio.play("enemy-hit2");
      if (enemy.radius > 3) {
        game.score += 100;
        enemy.radius *= 0.5;
      } else {
        game.score += 250;
        enemy.free = true
      }
      explode(enemy, projectile);
    }

    for (const otherEnemy of game.enemies) {
      if (otherEnemy === enemy) {
        continue;
      }
      if (otherEnemy.free) {
        continue;
      }
      if (enemy.free) {
        continue;
      }
      const distance = Math.hypot(
        otherEnemy.position.x - enemy.position.x,
        otherEnemy.position.y - enemy.position.y,
      );
      if (distance - otherEnemy.radius >= 2) {
        continue;
      }
      audio.play("enemy-hit2");
      let [smallest, largest] =
        otherEnemy.radius < enemy.radius
          ? [otherEnemy, enemy]
          : [enemy, otherEnemy];
      if (largest.speed * 3 < smallest.speed) {
        [smallest, largest] = [largest, smallest];
      } else {
        largest.velocity.x *= 0.95;
        largest.velocity.y *= 0.95;
      }
      largest.radius = Math.sqrt(
        (Math.pow(largest.radius, 2) * Math.PI + Math.pow(smallest.radius, 2)) /
        Math.PI,
      );
      if (smallest.radius > 3) {
        smallest.radius *= 0.5;
      } else {
        smallest.free = true
      }
      explode(smallest, largest);
    }

    if (enemy.position.x >= 100) {
      enemy.position.x = 0;
    }
    if (enemy.position.x < 0) {
      enemy.position.x = 100;
    }
    if (enemy.position.y >= 100) {
      enemy.position.y = 0;
    }
    if (enemy.position.y < 0) {
      enemy.position.y = 100;
    }
  }
  const pos = game.player.position
  if (pos.x >= 100) pos.x = 0;
  if (pos.x < 0) pos.x = 100;
  if (pos.y >= 100) pos.y = 0;
  if (pos.y < 0) pos.y = 100;
  for (const [, angle] of pointerAngles) {
    spawnProjectile(angle)
  }
  for (const gamepad of navigator.getGamepads()) {
    if (!gamepad?.connected) continue
    if (game.running) {
      const [x, y, x2, y2] = gamepad.axes
      if (Math.abs(x) > 0.4 || Math.abs(y) > 0.4) {
        game.player.position.x += x / 10
        game.player.position.y += y / 10
      }
      if (Math.abs(x2) > 0.4 || Math.abs(y2) > 0.4) {
        const angle = Math.atan2(y2, x2)
        spawnProjectile(angle)
      }
    } else {
      const buttonPressedIndexes = gamepad.buttons.flatMap((b, i) => b.pressed ? [i] : [])
      const abxy = [0, 1, 2, 3]
      if (abxy.some(index => buttonPressedIndexes.includes(index))) {
        startGame();
      }
    }
  }
  if (!game.running) {
    return;
  }
  for (const enemy of game.enemies) {
    const distance = Math.hypot(
      game.player.position.x - enemy.position.x,
      game.player.position.y - enemy.position.y,
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
function spawnProjectile(angle: number) {
  game.projectiles.getFree()?.start({
    position: { ...game.player.position },
    velocity: { x: Math.cos(angle), y: Math.sin(angle) },
    color: "white",
    radius: 1,
  })

  audio.play("projectile");
}
function handleProjectiles() {
  canvas.addEventListener("pointerdown", (event) => {
    audio.start()
    const distance = {
      x: event.clientX - innerWidth / 2,
      y: event.clientY - innerHeight / 2,
    };
    const angle = Math.atan2(distance.y, distance.x);
    pointerAngles.set(event.pointerId, angle)
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!pointerAngles.has(event.pointerId)) return
    const distance = {
      x: event.clientX - innerWidth / 2,
      y: event.clientY - innerHeight / 2,
    };
    const angle = Math.atan2(distance.y, distance.x);
    pointerAngles.set(event.pointerId, angle)
  })
  canvas.addEventListener("pointerup", (event) => {
    pointerAngles.delete(event.pointerId)
  })
  canvas.addEventListener("pointerleave", (event) => {
    pointerAngles.delete(event.pointerId)
  })
  canvas.addEventListener("pointercancel", (event) => {
    pointerAngles.delete(event.pointerId)
  })
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
  const speed = Math.random() * 0.75 + 0.5;

  game.enemies.getFree()?.start({
    position,
    velocity: {
      x: (Math.cos(angle) / 10) * speed,
      y: (Math.sin(angle) / 10) * speed,
    },
    radius: Math.random() * 4 + 1,
    color: `hsl(${Math.random() * 360}, 50%,50%)`,
  });
}
function isOutOfBounds(entity: Entity) {
  const { x, y } = entity.position;
  return x < 0 || y < 0 || x > 100 || y > 100;
}
function handleMenu() {
  menu.querySelector("button")?.addEventListener("pointerdown", () => {
    startGame();
    audio.start();
  });
}
function explode(entity: Entity, other: Entity) {
  for (let i = 0; i < entity.radius ** 2 + 4; i++) {
    const velocity = {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    };
    game.particles.getFree()?.start({
      position: { ...other.position },
      radius: 0.5,
      color: entity.color,
      velocity,
      alpha: 0.5,
    });
  }
}
startGame();

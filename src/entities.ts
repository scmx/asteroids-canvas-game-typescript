import { scale } from "./scale";

interface Offset {
  x: number;
  y: number;
}
export class Entity {
  position: Offset;
  velocity: Offset;
  radius: number;
  color: string;
  alpha: number;

  constructor({
    position,
    velocity = { x: 0, y: 0 },
    radius,
    color,
    alpha = 1,
  }: {
    position: Offset;
    velocity?: Offset;
    radius: number;
    color: string;
    alpha?: number;
  }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.alpha = alpha;
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  draw(c: CanvasRenderingContext2D) {
    const { color } = this;
    const {
      position: { x, y },
      radius,
    } = getScaledValues(this);
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(x, y, radius, 0, Math.PI * 2, false);
    c.fillStyle = color;
    c.fill();
    c.restore();
  }
}

export class Player extends Entity {}

export class Enemy extends Entity {}

export class Projectile extends Entity {
  color = "white";
}

export class Particle extends Entity {
  update() {
    super.update();
    this.velocity.x *= 0.9999;
    this.velocity.y *= 0.9999;
    this.alpha -= 0.01;
  }
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

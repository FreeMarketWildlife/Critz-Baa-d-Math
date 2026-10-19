// World units are viewport widths/heights. A fixed crossing time preserves operation
// order while launch point, gravity, height, side, and angular velocity vary.
export const CROSSING_TIME = .8;
export const FIXED_STEP = 1 / 120;

export function launchFlight(side, random = Math.random) {
  const x = side < 0 ? .08 + random() * .16 : .92 - random() * .16;
  const y = 1.09;
  const gravity = 1.75 + random() * .65;
  const crossingY = .34 + random() * .15;
  return {
    x, y, vx: (.5 - x) / CROSSING_TIME,
    vy: (crossingY - y - .5 * gravity * CROSSING_TIME ** 2) / CROSSING_TIME,
    gravity, age: 0, angle: (random() - .5) * .5,
    spin: (random() - .5) * 2.2, crossed: false, trail: [],
  };
}

export function advanceFlight(body, dt) {
  const oldAge = body.age;
  body.x += body.vx * dt;
  body.y += body.vy * dt + .5 * body.gravity * dt * dt;
  body.vy += body.gravity * dt;
  body.age += dt;
  body.angle += body.spin * dt;
  return oldAge < CROSSING_TIME && body.age >= CROSSING_TIME;
}

export const flightIsGone = body => body.age > CROSSING_TIME && body.y > 1.18;

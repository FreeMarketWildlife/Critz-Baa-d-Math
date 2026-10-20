// Height is measured in viewport heights. It deliberately has no upper limit.
export const LIFT_DELAY = 10;
export const LANDING_RAGE = .5;
export const createLevitation = () => ({ calm: 0, height: 0, velocity: 0, falling: false, impact: 0 });

export function stepLevitation(state, dt, buildingRage) {
  state.impact = Math.max(0, state.impact - dt * 2);
  if (buildingRage) {
    state.calm = 0;
    if (state.height > 0 && !state.falling) {
      state.falling = true;
      state.velocity = Math.min(0, state.velocity);
    }
  }
  if (state.falling) {
    // Gravity makes higher ascents produce longer falls; no teleport to the grass.
    state.velocity -= 3.2 * dt;
    state.height += state.velocity * dt;
    if (state.height <= 0) {
      state.height = state.velocity = state.calm = 0;
      state.falling = false;
      state.impact = 1;
      return LANDING_RAGE;
    }
  } else if (!buildingRage) {
    const before = state.calm;
    state.calm += dt;
    const liftTime = Math.max(0, state.calm - Math.max(before, LIFT_DELAY));
    if (liftTime > 0) {
      const speed = .105 + Math.min(.2, (state.calm - LIFT_DELAY) * .003);
      state.velocity = speed;
      state.height += speed * liftTime;
    }
  }
  return 0;
}

export const cameraHeight = height => Math.max(0, height - .32);

import {
  ScoreboardIdentity,
  ScoreboardObjective,
  world,
} from "@minecraft/server";

/**
 * Get score from entity on specific objectives
 *
 * @param {string|Player|Entity|ScoreboardIdentity} target
 * Scoreboard Identity class. Use string for fake players.
 *
 * @param {string|ScoreboardObjective} objective
 * ScoreboardObjective class. Use string for simple method.
 *
 * @param {boolean} zero
 * Return zero instead if entity doesn't has score, or else, return NaN.
 * Default set to true
 */
export function getScore(target, objective, zero = true) {
  if (typeof objective === "string")
    objective = world.scoreboard.getObjective(objective);

  if (typeof target === "string")
    target = world.scoreboard
      .getParticipants()
      .find((tgt) => tgt.displayName === target);

  if (!target) return zero ? 0 : NaN;
  return objective.getScore(target);
}

/**
 * Test target score
 *
 * @param {string|ScoreboardIdentity} target
 * ScoreboardIdentity class. Use string for fake players
 *
 * @param {string|ScoreboardObjective} objective
 * ScoreboardObjective class. Use string for simple method.
 *
 * @param {{min?: Number, max?: Number}} options
 * Test score with min/max range value.
 * Default check if entity score is exist.
 */
export function testScore(target, objective, options) {
  const score = getScore(target, objective, false);

  if (isNaN(score)) return false;

  if (
    ("min" in options && score < options.min) ||
    ("max" in options && score > options.max)
  )
    return false;
  return true;
}

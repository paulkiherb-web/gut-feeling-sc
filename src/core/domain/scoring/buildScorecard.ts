import { calculateEnergyScore } from '../../store/calculators/calculateEnergyScore';
import { calculateGoalAlignment } from '../../store/calculators/calculateGoalAlignment';
import { calculateNutritionScore } from '../../store/calculators/calculateNutritionScore';
import { calculateReadinessScore } from '../../store/calculators/calculateReadinessScore';
import { calculateRecoveryScore } from '../../store/calculators/calculateRecoveryScore';
import { calculateSleepScore } from '../../store/calculators/calculateSleepScore';
import type { Scorecard } from '../../store/types/state';
import type { ScoreCalculatorContext } from '../../store/calculators/_helpers';

export const buildScorecard = (context: ScoreCalculatorContext): Scorecard => {
  const energy = calculateEnergyScore(context);
  const recovery = calculateRecoveryScore(context);
  const sleep = calculateSleepScore(context);
  const nutrition = calculateNutritionScore(context);
  const goalAlignment = calculateGoalAlignment(context);

  return {
    energy,
    recovery,
    sleep,
    nutrition,
    goalAlignment,
    readiness: calculateReadinessScore({ energy, recovery, sleep, nutrition, goalAlignment }, context.goals),
  };
};

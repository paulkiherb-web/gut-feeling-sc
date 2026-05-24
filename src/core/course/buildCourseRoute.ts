import type {
  CourseGap,
  CourseKey,
  CoursePhase,
  CourseRoute,
  CourseRouteNode,
  CourseRouteNodeStatus,
  IdealPath,
  RealPath,
} from './types';

interface BuildCourseRouteInput {
  course: CourseKey;
  idealPath: IdealPath;
  realPath: RealPath;
  gap: CourseGap;
}

const PHASES: CoursePhase[] = ['morning', 'day', 'evening', 'sleep'];
const PHASE_TITLES: Record<CoursePhase, string> = {
  morning: 'Утро',
  day: 'День',
  evening: 'Вечер',
  sleep: 'Сон',
};

function pickPhaseStatus(
  phase: CoursePhase,
  realPath: RealPath,
  gap: CourseGap,
  currentPhase: CoursePhase,
): CourseRouteNodeStatus {
  const phaseOrder = PHASES.indexOf(phase);
  const currentOrder = PHASES.indexOf(currentPhase);

  if (phaseOrder < currentOrder) {
    // Past phase
    if (gap.status === 'far_out' || gap.status === 'slightly_out') {
      return 'drifted';
    }
    return 'completed';
  }
  if (phaseOrder === currentOrder) return 'current';
  return 'locked';
}

function currentPhaseByClock(): CoursePhase {
  const h = new Date().getHours();
  if (h < 11) return 'morning';
  if (h < 17) return 'day';
  if (h < 22) return 'evening';
  return 'sleep';
}

export function buildCourseRoute({
  course,
  idealPath,
  realPath,
  gap,
}: BuildCourseRouteInput): CourseRoute {
  const currentPhase = currentPhaseByClock();
  const nodes: CourseRouteNode[] = [];

  PHASES.forEach((phase, i) => {
    const anchors = idealPath.dayParts[phase];
    const primary = anchors[0];
    const status = pickPhaseStatus(phase, realPath, gap, currentPhase);
    nodes.push({
      id: `main.${phase}`,
      title: PHASE_TITLES[phase],
      description: primary?.description ?? 'Фаза дня',
      phase,
      type: 'main',
      status,
      anchorId: primary?.id,
      x: 10 + i * 28,
      y: 50,
    });
  });

  // Add branch + return when there's drift
  const hasDrift = gap.status === 'slightly_out' || gap.status === 'far_out';
  if (hasDrift) {
    nodes.push({
      id: 'branch.drift',
      title: 'Отклонение',
      description: gap.strongestDrift
        ? `Уход в сторону: ${gap.strongestDrift}`
        : 'Небольшое отклонение от маршрута',
      phase: 'day',
      type: 'branch',
      status: 'drifted',
      x: 52,
      y: 78,
    });

    if (gap.easiestReturn) {
      nodes.push({
        id: 'return.soft',
        title: gap.easiestReturn.title,
        description: gap.easiestReturn.description,
        phase: 'evening',
        type: 'return',
        status: 'return_available',
        x: 70,
        y: 78,
      });
    }
  }

  const currentNode = nodes.find((n) => n.status === 'current') ?? null;

  let headline: string;
  let explanation: string;
  if (gap.status === 'unknown') {
    headline = 'Маршрут дня готов';
    explanation = 'Первые отметки сделают карту точнее.';
  } else if (gap.status === 'inside_corridor') {
    headline = 'Ты в коридоре маршрута';
    explanation = 'Можно сохранить курс мягким вечером.';
  } else if (gap.status === 'slightly_out') {
    headline = 'Маршрут слегка отклонился';
    explanation = gap.easiestReturn
      ? `Мягкий возврат: ${gap.easiestReturn.title.toLowerCase()}.`
      : 'Есть мягкий возврат рядом.';
  } else {
    headline = 'Маршрут ушёл в сторону';
    explanation = gap.easiestReturn
      ? `Ближайшая развилка: ${gap.easiestReturn.title.toLowerCase()}.`
      : 'Можно вернуть курс одним спокойным шагом.';
  }

  return {
    course,
    nodes,
    currentNodeId: currentNode?.id ?? null,
    headline,
    explanation,
  };
}

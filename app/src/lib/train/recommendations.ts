export interface ScenarioSummary {
  slug: string;
  category: string;
  title: string;
  locale?: string | null;
  verified?: boolean;
}

export interface PracticeOutcome {
  scenarioSlug: string;
  result: "passed" | "failed";
  completedAt: string;
}

export interface ScenarioRecommendation extends ScenarioSummary {
  reason: string;
  score: number;
}

export interface RecommendationOptions {
  locale?: string | null;
  now?: Date;
}

const PASSED_COOLDOWN_DAYS = 14;
const FAILED_RETRY_DAYS = 7;

function daysSince(dateValue: string, now: Date): number {
  const elapsed = now.getTime() - new Date(dateValue).getTime();
  return Math.max(0, elapsed / (1000 * 60 * 60 * 24));
}

export function recommendScenarios(
  scenarios: ScenarioSummary[],
  outcomes: PracticeOutcome[],
  options: RecommendationOptions | Date = {}
): ScenarioRecommendation[] {
  const context = options instanceof Date ? { now: options } : options;
  const now = context.now ?? new Date();
  const familyLanguage = context.locale?.split("-")[0].toLowerCase();
  const english = familyLanguage === "en";
  const latestOutcomes = new Map<string, PracticeOutcome>();
  for (const outcome of outcomes) {
    const previous = latestOutcomes.get(outcome.scenarioSlug);
    if (!previous || new Date(outcome.completedAt) > new Date(previous.completedAt)) {
      latestOutcomes.set(outcome.scenarioSlug, outcome);
    }
  }

  const practicedCategories = new Set(
    scenarios
      .filter((scenario) => latestOutcomes.has(scenario.slug))
      .map((scenario) => scenario.category)
  );

  return scenarios
    .flatMap((scenario) => {
      const outcome = latestOutcomes.get(scenario.slug);
      const scenarioLanguage = scenario.locale?.split("-")[0].toLowerCase();
      const localeBoost = Boolean(
        scenario.verified && familyLanguage && scenarioLanguage && familyLanguage === scenarioLanguage
      );
      if (!outcome) {
        const categoryReason = practicedCategories.has(scenario.category)
          ? (english ? "Ready for another practice" : "Sẵn sàng để luyện tiếp")
          : (english ? `The ${scenario.category} category has not been practiced` : `Danh mục ${scenario.category} chưa luyện`);
        return [{
          ...scenario,
          score: (practicedCategories.has(scenario.category) ? 70 : 100) + (localeBoost ? 25 : 0),
          reason: localeBoost ? `${categoryReason}; ${english ? "matches the family language" : "phù hợp ngôn ngữ gia đình"}` : categoryReason,
        }];
      }

      const age = daysSince(outcome.completedAt, now);
      if (outcome.result === "passed" && age < PASSED_COOLDOWN_DAYS) return [];

      if (outcome.result === "failed" && age >= FAILED_RETRY_DAYS) {
        return [{
          ...scenario,
          score: 95 + (localeBoost ? 25 : 0),
          reason: english
            ? `The previous result needs reinforcement; practice again${localeBoost ? "; matches the family language" : ""}`
            : `Kết quả trước cho thấy dấu hiệu này chưa an toàn; nên luyện lại${localeBoost ? "; phù hợp ngôn ngữ gia đình" : ""}`,
        }];
      }

      return [{
        ...scenario,
        score: 40 + (localeBoost ? 25 : 0),
        reason: english
          ? `Available when reinforcement is useful${localeBoost ? "; matches the family language" : ""}`
          : `Có thể luyện lại khi cần củng cố${localeBoost ? "; phù hợp ngôn ngữ gia đình" : ""}`,
      }];
    })
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title, "vi"));
}

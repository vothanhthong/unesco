import TriggerPage from "@/app/trigger/page";

interface PageProps {
  searchParams: Promise<{ scenario_slug?: string }>;
}

export default async function NewTrainSessionPage({ searchParams }: PageProps) {
  const { scenario_slug: scenarioSlug } = await searchParams;
  return <TriggerPage embedded initialScenarioSlug={scenarioSlug} />;
}

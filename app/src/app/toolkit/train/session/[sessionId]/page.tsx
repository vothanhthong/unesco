import { redirect } from "next/navigation";
import TriggerPage from "@/app/trigger/page";

interface PageProps {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ scenario_slug?: string }>;
}

export default async function TrainSessionPage({ params, searchParams }: PageProps) {
  const { sessionId } = await params;
  const { scenario_slug: scenarioSlug } = await searchParams;

  if (!/^\d{4}$/.test(sessionId)) redirect("/toolkit/train");

  return <TriggerPage embedded initialSessionId={sessionId} initialScenarioSlug={scenarioSlug} />;
}

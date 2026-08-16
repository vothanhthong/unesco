"use client";

import ToolkitFeedback from "@/components/toolkit/ToolkitFeedback";

export default function ToolkitError({ reset }: { reset: () => void }) {
  return <ToolkitFeedback reset={reset} />;
}

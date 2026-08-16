import { redirect } from "next/navigation";
import ToolkitHome from "@/components/toolkit/ToolkitHome";
import { getAuthenticatedContext } from "@/lib/auth/server";

export default async function ToolkitHomePage() {
  const auth = await getAuthenticatedContext();
  if (auth.user) redirect("/toolkit/train");
  return <ToolkitHome />;
}

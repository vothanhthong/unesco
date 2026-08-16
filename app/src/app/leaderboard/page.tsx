import TopContributors from "@/components/contribute/TopContributors";
import ToolkitNavigation from "@/components/toolkit/ToolkitNavigation";
import styles from "@/components/toolkit/toolkit.module.css";

export default function LeaderboardPage() { return <div className={styles.shell}><ToolkitNavigation /><main className={styles.main}><TopContributors /></main></div>; }
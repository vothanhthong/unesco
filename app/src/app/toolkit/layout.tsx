import type { ReactNode } from "react";
import ToolkitNavigation from "@/components/toolkit/ToolkitNavigation";
import styles from "@/components/toolkit/toolkit.module.css";
import ToolkitFooter from "@/components/toolkit/ToolkitFooter";

export default function ToolkitLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <ToolkitNavigation />
      <main className={styles.main} id="main-content">
        {children}
        <ToolkitFooter />
      </main>
    </div>
  );
}

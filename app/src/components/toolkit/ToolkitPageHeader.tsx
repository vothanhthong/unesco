import type { ReactNode } from "react";
import styles from "./toolkit.module.css";

interface ToolkitPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export default function ToolkitPageHeader({
  eyebrow,
  title,
  description,
  children,
}: ToolkitPageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </header>
  );
}

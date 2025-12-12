'use client';

import { useRouter } from 'next/navigation';
import { useNavigation } from '@/lib/contexts/NavigationContext';
import styles from "./TopBar.module.css";

type TopBarProps = {
  breadcrumb?: string[];
};

export function TopBar({ breadcrumb = [] }: TopBarProps) {
  const router = useRouter();
  const { breadcrumbs } = useNavigation();

  // 使用 NavigationContext 中的面包屑（如果可用），否则使用传入的
  const displayBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : breadcrumb.map(label => ({ label, path: '' }));

  const handleBreadcrumbClick = (path: string, index: number) => {
    // 点击面包屑项时导航到对应路径
    if (path && index < displayBreadcrumbs.length - 1) {
      router.push(path);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.breadcrumb}>
          {displayBreadcrumbs.map((item, index) => (
            <span key={index}>
              <button
                className={`${styles.breadcrumbItem} ${
                  index === displayBreadcrumbs.length - 1 ? styles.breadcrumbItemActive : styles.breadcrumbItemClickable
                }`}
                onClick={() => handleBreadcrumbClick(item.path, index)}
                disabled={index === displayBreadcrumbs.length - 1}
              >
                {item.label}
              </button>
              {index < displayBreadcrumbs.length - 1 && <span className={styles.breadcrumbSeparator}> / </span>}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.right}>
        <button className={`${styles.button} ${styles.buttonText}`}>
          Share
        </button>
        <button className={styles.button}>
          ⋯
        </button>
        <button className={styles.button}>
          ⊕
        </button>
      </div>
    </header>
  );
}



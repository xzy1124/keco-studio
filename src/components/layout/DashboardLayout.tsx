'use client';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '@/lib/contexts/AuthContext';
import AuthForm from '@/components/authform/AuthForm';
import styles from './DashboardLayout.module.css';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, userProfile, signOut } = useAuth();

  // While loading auth state or when unauthenticated, show the auth form
  if (isLoading || !isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <div className={styles.dashboard}>
      <Sidebar userProfile={userProfile} onAuthRequest={signOut} />
      <div className={styles.main}>
        <TopBar />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}


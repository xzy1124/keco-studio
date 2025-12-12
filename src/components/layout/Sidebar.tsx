'use client';

import projectIcon from "@/app/assets/images/projectIcon.svg";
import libraryIcon from "@/app/assets/images/libraryIcon.svg";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSupabase } from "@/lib/SupabaseContext";
import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { NewLibraryModal } from "@/components/libraries/NewLibraryModal";
import { listProjects, Project, deleteProject } from "@/lib/services/projectService";
import { listLibraries, Library, deleteLibrary } from "@/lib/services/libraryService";
import styles from "./Sidebar.module.css";

type UserProfile = {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

type SidebarProps = {
  userProfile?: UserProfile | null;
  onAuthRequest?: () => void;
};

export function Sidebar({ userProfile, onAuthRequest }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useSupabase();
  // 获取显示名称：优先 username，其次 full_name，最后 email
  const displayName = userProfile?.username || userProfile?.full_name || userProfile?.email || "Guest";
  const isGuest = !userProfile;
  
  // 获取头像：如果有有效的 avatar_url 则使用，否则使用默认头像或首字母
  const hasValidAvatar = userProfile?.avatar_url && userProfile.avatar_url.trim() !== "";
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const [avatarError, setAvatarError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleLogout = async () => {
    setShowMenu(false);
    try {
      await supabase.auth.signOut();
      // 调用父组件的回调以确保状态同步
      if (onAuthRequest) {
        onAuthRequest();
      }
    } catch (error) {
      console.error('Logout failed', error);
      // 即使登出失败，也尝试调用回调以保持状态一致
      if (onAuthRequest) {
        onAuthRequest();
      }
    }
  };

  const handleAuthNav = async () => {
    setShowMenu(false);
    if (onAuthRequest) {
      onAuthRequest();
      return;
    }
    // fallback: sign out and let caller react to auth state change
    await supabase.auth.signOut();
  };

  // data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingLibraries, setLoadingLibraries] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentIds = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const projectId = parts[0] || null;
    const libraryId = parts[1] || null;
    return { projectId, libraryId };
  }, [pathname]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    setError(null);
    try {
      const data = await listProjects(supabase);
      setProjects(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchLibraries = async (projectId?: string | null) => {
    if (!projectId) {
      setLibraries([]);
      return;
    }
    setLoadingLibraries(true);
    setError(null);
    try {
      const data = await listLibraries(supabase, projectId);
      setLibraries(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load libraries");
    } finally {
      setLoadingLibraries(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchLibraries(currentIds.projectId);
  }, [currentIds.projectId]);

  // actions
  const handleProjectClick = (projectId: string) => {
    router.push(`/${projectId}`);
  };

  const handleLibraryClick = (projectId: string, libraryId: string) => {
    router.push(`/${projectId}/${libraryId}`);
  };

  const handleProjectDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project? All libraries under it will be removed.')) return;
    try {
      await deleteProject(supabase, projectId);
      if (currentIds.projectId === projectId) {
        router.push('/projects');
      }
      fetchProjects();
      setLibraries([]);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete project');
    }
  };

  const handleLibraryDelete = async (libraryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this library?')) return;
    try {
      await deleteLibrary(supabase, libraryId);
      fetchLibraries(currentIds.projectId);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete library');
    }
  };

  const handleProjectCreated = () => {
    setShowProjectModal(false);
    fetchProjects();
  };

  const handleLibraryCreated = () => {
    setShowLibraryModal(false);
    fetchLibraries(currentIds.projectId);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.avatarContainer} ref={menuRef}>
          {hasValidAvatar && !avatarError ? (
            <Image
              src={userProfile.avatar_url!}
              alt={displayName}
              width={40}
              height={40}
              className={styles.avatar}
              onClick={() => setShowMenu(!showMenu)}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div
              className={styles.logo}
              onClick={() => setShowMenu(!showMenu)}
            >
              {avatarInitial}
            </div>
          )}
          {showMenu && (
            <div className={styles.dropdownMenu}>
              {isGuest ? (
                <button className={styles.logoutButton} onClick={handleAuthNav}>
                  登录 / 注册
                </button>
              ) : (
                <button className={styles.logoutButton} onClick={handleLogout}>
                  退出登录
                </button>
              )}
            </div>
          )}
        </div>
        <div className={styles.headerText}>
          <div className={styles.title}>{displayName}</div>
          <div className={styles.subtitle}>for game designers</div>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <label className={styles.searchLabel}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            placeholder="Search for..."
            className={styles.searchInput}
          />
        </label>
      </div>

      <div className={styles.content}>
        <div className={styles.sectionTitle}>
          <span>Projects</span>
          <button className={styles.addButton} onClick={() => setShowProjectModal(true)}>+</button>
        </div>
        {loadingProjects && <div className={styles.hint}>Loading projects...</div>}
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.sectionList}>
          {projects.map((project) => {
            const isActive = currentIds.projectId === project.id;
            return (
              <div
                key={project.id}
                className={`${styles.item} ${isActive ? styles.itemActive : styles.itemInactive}`}
                onClick={() => handleProjectClick(project.id)}
              >
                <Image
                  src={projectIcon} 
                  alt="Project"
                  width={20}
                  height={20}
                  className={styles.itemIcon}
                />
                <span className={styles.itemText}>{project.name}</span>
                <span className={styles.itemActions}>
                  <button
                    className={styles.iconButton}
                    aria-label="Delete project"
                    onClick={(e) => handleProjectDelete(project.id, e)}
                  >
                    ×
                  </button>
                </span>
              </div>
            );
          })}
          {!loadingProjects && projects.length === 0 && (
            <div className={styles.hint}>No projects. Create one.</div>
          )}
        </div>

        <div className={styles.sectionTitle}>
          <span>Libraries</span>
          <button
            className={styles.addButton}
            onClick={() => setShowLibraryModal(true)}
            disabled={!currentIds.projectId}
            title={currentIds.projectId ? "New Library" : "Select a project first"}
          >
            +
          </button>
        </div>
        {loadingLibraries && <div className={styles.hint}>Loading libraries...</div>}
        <div className={styles.sectionList}>
          {libraries.map((lib) => {
            const isActive = currentIds.libraryId === lib.id;
            return (
              <div
                key={lib.id}
                className={`${styles.item} ${isActive ? styles.itemActive : styles.itemInactive}`}
                onClick={() => handleLibraryClick(lib.project_id, lib.id)}
              >
                <Image
                  src={libraryIcon}
                  alt="Library"
                  width={20}
                  height={20}
                  className={styles.itemIcon}
                />
                <span className={styles.itemText}>{lib.name}</span>
                <span className={styles.itemActions}>
                  <button
                    className={styles.iconButton}
                    aria-label="Delete library"
                    onClick={(e) => handleLibraryDelete(lib.id, e)}
                  >
                    ×
                  </button>
                </span>
              </div>
            );
          })}
          {!loadingLibraries && currentIds.projectId && libraries.length === 0 && (
            <div className={styles.hint}>No libraries. Create one.</div>
          )}
        </div>
      </div>

      <NewProjectModal
        open={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onCreated={() => handleProjectCreated()}
      />

      <NewLibraryModal
        open={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
        projectId={currentIds.projectId || ''}
        onCreated={() => handleLibraryCreated()}
      />
    </aside>
  );
}



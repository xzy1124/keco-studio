'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/SupabaseContext';
import { listProjects, Project } from '@/lib/services/projectService';
import { NewProjectModal } from '@/components/projects/NewProjectModal';

export default function ProjectsPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listProjects(supabase);
      setProjects(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreated = (projectId: string) => {
    fetchProjects();
    router.push(`/${projectId}`);
  };

  const goToProject = (id: string) => {
    router.push(`/${id}`);
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>Projects</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: 'none',
            background: '#4f46e5',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          New Project
        </button>
      </div>

      {loading && <div>Loading projects...</div>}
      {error && <div style={{ color: '#dc2626' }}>{error}</div>}

      {!loading && projects.length === 0 && (
        <div style={{ color: '#64748b' }}>No projects yet. Create your first project.</div>
      )}

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => goToProject(project.id)}
            style={{
              padding: '12px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              cursor: 'pointer',
              background: 'white',
            }}
          >
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{project.name}</div>
            {project.description && (
              <div style={{ color: '#475569', fontSize: '14px', marginTop: '4px' }}>
                {project.description}
              </div>
            )}
          </div>
        ))}
      </div>

      <NewProjectModal open={showModal} onClose={() => setShowModal(false)} onCreated={handleCreated} />
    </div>
  );
}


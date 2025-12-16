'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSupabase } from '@/lib/SupabaseContext';
import { getProject, Project } from '@/lib/services/projectService';
import { getLibrary, Library } from '@/lib/services/libraryService';
import { useAuth } from '@/lib/contexts/AuthContext';
import { PredefineEditor } from '@/components/editor/PredefineEditor';

export default function LibraryPage() {
  const params = useParams();
  const supabase = useSupabase();
  const projectId = params.projectId as string;
  const libraryId = params.libraryId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [library, setLibrary] = useState<Library | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useAuth();
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !libraryId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [projectData, libraryData] = await Promise.all([
          getProject(supabase, projectId),
          getLibrary(supabase, libraryId, projectId),
        ]);
        
        if (!projectData) {
          setError('Project not found');
          return;
        }
        
        if (!libraryData) {
          setError('Library not found');
          return;
        }
        
        setProject(projectData);
        setLibrary(libraryData);
      } catch (e: any) {
        setError(e?.message || 'Failed to load library');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, libraryId, supabase]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading library...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#dc2626' }}>{error}</div>
      </div>
    );
  }

  if (!library || !project) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Library not found</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {userProfile ? (
        <PredefineEditor
          docId={`${projectId}-${libraryId}`}
          ownerLabel={userProfile.username || userProfile.email}
        />
      ) : (
        <div style={{ color: '#dc2626' }}>Please sign in to edit.</div>
      )}
    </div>
  );
}


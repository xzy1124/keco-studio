'use client';

import { SupabaseClient } from '@supabase/supabase-js';

export type Project = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  default_library_id?: string;
};

type CreateProjectInput = {
  name: string;
  description?: string;
};

const trimOrNull = (value?: string | null) => {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export async function createProject(
  supabase: SupabaseClient,
  input: CreateProjectInput
): Promise<{ projectId: string; defaultLibraryId: string }> {
  const name = input.name.trim();
  const description = trimOrNull(input.description ?? null);

  if (!name) {
    throw new Error('Project name is required.');
  }

  // Prefer RPC to ensure transactional creation with default Resource library
  const { data, error } = await supabase.rpc('create_project_with_default_resource', {
    p_name: name,
    p_description: description,
  });

  if (error) {
    throw error;
  }

  if (!data || !data[0]) {
    throw new Error('Project creation failed.');
  }

  return {
    projectId: data[0].project_id,
    defaultLibraryId: data[0].library_id,
  };
}

export async function listProjects(supabase: SupabaseClient): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw error;
  }

  return data;
}

export async function deleteProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) {
    throw error;
  }
}


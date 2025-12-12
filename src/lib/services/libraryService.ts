'use client';

import { SupabaseClient } from '@supabase/supabase-js';

export type Library = {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type CreateLibraryInput = {
  projectId: string;
  name: string;
  description?: string;
};

const trimOrNull = (value?: string | null) => {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

async function resolveProjectId(supabase: SupabaseClient, projectIdOrName: string): Promise<string> {
  if (isUuid(projectIdOrName)) return projectIdOrName;
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('name', projectIdOrName)
    .limit(1)
    .single();
  if (error || !data) {
    throw new Error('Project not found');
  }
  return data.id;
}

export async function createLibrary(
  supabase: SupabaseClient,
  input: CreateLibraryInput
): Promise<string> {
  const name = input.name.trim();
  const description = trimOrNull(input.description ?? null);

  if (!name) {
    throw new Error('Library name is required.');
  }

  const projectId = await resolveProjectId(supabase, input.projectId);

  const { data, error } = await supabase
    .from('libraries')
    .insert({
      project_id: projectId,
      name,
      description,
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function listLibraries(
  supabase: SupabaseClient,
  projectId: string
): Promise<Library[]> {
  const resolvedProjectId = await resolveProjectId(supabase, projectId);

  const { data, error } = await supabase
    .from('libraries')
    .select('*')
    .eq('project_id', resolvedProjectId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getLibrary(
  supabase: SupabaseClient,
  libraryId: string,
  projectId?: string
): Promise<Library | null> {
  let query = supabase.from('libraries').select('*');

  if (isUuid(libraryId)) {
    query = query.eq('id', libraryId);
  } else {
    if (!projectId) {
      throw new Error('Project id is required when using a library name.');
    }
    const resolvedProjectId = await resolveProjectId(supabase, projectId);
    query = query.eq('project_id', resolvedProjectId).eq('name', libraryId);
  }

  const { data, error } = await query.single();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function deleteLibrary(
  supabase: SupabaseClient,
  libraryId: string
): Promise<void> {
  const { error } = await supabase.from('libraries').delete().eq('id', libraryId);
  if (error) {
    throw error;
  }
}


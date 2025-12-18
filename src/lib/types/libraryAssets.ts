export type LibrarySummary = {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
};

export type SectionConfig = {
  id: string;
  libraryId: string;
  name: string;
  orderIndex: number;
};

export type PropertyConfig = {
  id: string;
  sectionId: string;
  key: string;
  name: string;
  valueType: 'string' | 'number' | 'boolean' | 'enum' | 'tag' | 'other';
  orderIndex: number;
};

export type AssetRow = {
  id: string;
  libraryId: string;
  name: string;
  slug?: string | null;
  figmaNodeId?: string | null;
  propertyValues: Record<string, string | number | boolean | null>;
};



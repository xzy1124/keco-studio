# UI/Data Contracts: Library Asset Table View

## Overview

The Library 展示页 consumes **read-only** data for:
- Library metadata (title/description).  
- Predefine-driven schema: Sections and Properties.  
- Asset rows with property values.

This contract describes the **TypeScript-level shapes** and expected behavior, independent of whether data is fetched via direct Supabase queries or thin `/api` routes.

## Types

```ts
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
  propertyValues: Record<string, string | number | boolean | null>; // keyed by PropertyConfig.key
};
```

## Data Fetch Contracts

### 1) Load Library Summary

- **Purpose**: 获取当前 library 的基本信息，用于页面标题和辅助文案。  
- **Signature (conceptual)**:

```ts
async function getLibrarySummary(libraryId: string): Promise<LibrarySummary>;
```

- **Error model**:  
  - 如果 library 不存在或当前用户无权限，抛出/返回「not found/forbidden」错误，由页面渲染错误状态。  
  - 其它错误（网络/未知）以通用错误处理，展示重试按钮。

### 2) Load Predefine Schema for Library

- **Purpose**: 读取某 library 下的 Sections & Properties 配置，用于两行表头。  
- **Signature (conceptual)**:

```ts
async function getLibrarySchema(
  libraryId: string
): Promise<{
  sections: SectionConfig[];
  properties: PropertyConfig[];
}>;
```

- **Behavior**:  
  - `sections` 按 `orderIndex` 排序返回。  
  - `properties` 至少包含所有 `sectionId` 对应 section 的字段；表头渲染时按 (section.orderIndex, property.orderIndex) 排序。  
  - 如果 library 暂无 Section/Property，则返回空数组，前端展示「尚未配置属性」状态。

### 3) Load Asset Rows with Property Values

- **Purpose**: 加载当前 library 下所有资产及其属性值，用于表格行。  
- **Signature (conceptual)**:

```ts
async function getLibraryAssetsWithProperties(
  libraryId: string
): Promise<AssetRow[]>;
```

- **Behavior**:  
  - 每个 `AssetRow.propertyValues` 包含以 `PropertyConfig.key` 为键的值；缺失属性使用 `null` 或缺失键表示。  
  - 若 library 下没有任何资产，返回空数组，前端展示空状态。  
  - 实现可以是 Supabase join 查询，也可以是多次查询后在前端聚合。

- **Error model**: 与其它函数一致，统一通过空/错误状态组件展示。

## Rendering Contract

- Library 展示页在拿到 `LibrarySummary`、`SectionConfig[]`、`PropertyConfig[]` 和 `AssetRow[]` 后：  
  - Header 第一行：以 Section 为单元，跨越该 Section 下 property 数量的列。  
  - Header 第二行：以 Property 为单元，顺序按照 (Section.orderIndex, Property.orderIndex)。  
  - Body：每个 AssetRow 对应一行；单元格内容通过 `propertyValues[property.key]` 获取，若值为 `null` 或 undefined 则显示统一占位（如「未定义」或 `—`）。

## Non-Goals for This Contract

- 不规定具体 HTTP 路由或 Supabase SQL；实现可以选择 server actions、直接 Supabase client 或 `/api` routes。  
- 不包含资产创建/编辑/删除的写接口；本 feature 仅关注只读展示。  
- 不强制要求任何与 Figma 的 runtime 合约；F2C MCP 仅在开发期辅助。



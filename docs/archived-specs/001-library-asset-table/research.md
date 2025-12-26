# Research: Library Asset Table View

**Date**: 2025-12-18  
**Feature**: Library Asset Table View  
**Context**: Next.js 14 App Router + Supabase + existing predefine configuration UI

## Decisions

### 1) Source of truth for Sections & Properties

**Decision**: Use the existing predefine schema (Sections + Fields/Properties) as the single source of truth for Library 展示表头。  
**Rationale**: The predefine 页面已经允许新增/编辑 Section 与 Property，且已经有对应 Supabase 存储和 hooks；复用比再造一套列配置简单且更不会产生偏差。  
**Alternatives**:  
- 在 Library 展示页单独维护一份列配置 — 拒绝，容易和 predefine 不一致。  
- 从 Figma 动态读取列配置 — 拒绝，Figma 结构复杂且不稳定，适合校验而不是 runtime 依赖。

### 2) Source of assets and property values

**Decision**: 资产行（每一行）来自现有 library 资产表/视图（如 components/variants），属性值通过一张或多张「资产属性」表（例如 `library_asset_properties`）或等价结构组合查询，在前端聚合为 `AssetRow`。  
**Rationale**: 与 predefine schema 一致的方式是：Section/Property 仅定义「字段」，具体值按 asset + property 存储；前端只需要拿到「资产列表 + 属性值 map」，即可按列渲染。  
**Alternatives**:  
- 把所有属性值都塞进 asset 行的 JSON 字段 — 可行但不透明，不利于后续查询和演进。  
- 仅在前端临时计算属性值而不落库 — 不满足规范和持久化需求。

### 3) Table layout & responsiveness

**Decision**: 使用一个单一表格组件 `LibraryAssetsTable`，第一行为 Section 级表头（通过 `colSpan` 或样式实现分组），第二行为 Property 级表头，支持横向滚动和固定左侧「资产信息」列。  
**Rationale**: 符合 Figma 表格设计（两层表头），也利于后续扩展（如在 Section 分组上增加 hover/说明）。  
**Alternatives**:  
- 为每个 Section 建一个独立子表格 — 视觉和交互都偏离 Figma，且更复杂。  
- 只展示 Property 行，不展示 Section 分组 — 简化但偏离设计和需求。

### 4) F2C MCP 使用方式

**Decision**: 将 F2C MCP 对 Figma 的访问限定在「开发和规范对齐阶段」，用来：  
- 获取 Figma 中「Component library」表格的列/行示例，辅助确定 Section/Property 命名和顺序；  
- 校验实现后的截图或 DOM 截取是否在 spacing/排版上偏差较大。  
运行时不直接访问 Figma。  
**Rationale**: 避免在生产环境引入 Figma API 依赖和复杂鉴权，同时仍然满足「UI 与设计稿高度一致」的目标。  
**Alternatives**:  
- 在运行时从 Figma API 读取数据 — 增加外部依赖和延迟，不必要。  
- 完全不使用 F2C MCP — 风险是和设计逐步产生偏差，不符合宪章。

### 7) Figma 表格结构 vs `library_field_definitions` 对齐策略（US3）

**Decision**:  
- 使用 F2C MCP 针对 `Keco - Component library` 中的 Library 资产表格节点（例如 [`1151:8997`](https://www.figma.com/design/oiV14T1GHrP3jqecu50tbg/Keco---Component-library?node-id=1151-8997&t=L4jXlQLENncTBlx6-4)）生成开发期参考代码（`.temp/index.tsx`）与结构摘要（`.temp/figma-library-table.json`）。  
- 通过人工/脚本对比 Figma 表格列的「分组（Section）」与「列名（Property）」顺序，与 Supabase 中 `public.library_field_definitions` 的 `section + label + order_index` 配置进行一一映射。  
- 若发现命名或顺序上的差异：  
  - 优先建议调整 `library_field_definitions` 以贴合 Figma；  
  - 如因历史数据或业务原因无法完全对齐，则在本文件中记录「有意偏离」的点，并在代码注释中补充映射说明。  

**Current Status**:  
- `.temp/index.tsx`：由 F2C MCP 从 Figma 节点导出的整页布局代码，用于读取真实的列名/分组。  
- `.temp/figma-library-table.json`：当前为 `draft`，仅记录 Figma 源信息和文件位置，后续可按需要补充 `sections/properties/sampleRows` 等结构化字段。  
- 实际的字段定义以 `public.library_field_definitions` 为准，Figma 主要作为设计规范和回归对比的参考源。  

**How to use in practice**:  
1. 打开 Figma 链接与 `.temp/index.tsx`，确定「Section 名称」和每个 Section 下的「列名」顺序。  
2. 在 Supabase 控制台或 SQL 中查看当前 Library 的 `library_field_definitions` 行，按 `section, order_index` 排序。  
3. 对比两者：  
   - 若发现 Figma 有列而 schema 中缺失 → 决定是否新增对应的 field definition。  
   - 若 Figma 与 schema 命名/顺序不一致 → 记录在本文件的 Notes 区，或扩展 `.temp/figma-library-table.json` 的 `sections/properties` 字段。  
4. 在 `LibraryAssetsTable` 的样式或文案更新前，优先确保 schema 与 Figma 在「列结构」层面的一致性。  

### 5) Error/empty state behavior

**Decision**:  
- 当 library 下没有任何资产时：展示空表状态 + 引导文案，例如「当前 Library 暂无资产，请在编辑器中创建或从 Figma 导入」。  
- 当部分资产缺失某些 Property 值时：在单元格中统一显示「未定义」或 `—` 标记，而不是留空。  
- 当加载失败时：展示错误提示和「重试」按钮，而不会渲染半截表格导致布局错乱。  
**Rationale**: 满足 spec 中的 edge cases，并符合宪章 IV（Resilient Async & Error Handling）。  
**Alternatives**:  
- 直接隐藏缺失值 — 可能被误解为「值为空」而非「未填写」。  
- 失败时空白页面 — 不利于排查和恢复。

### 6) Performance & data volume

**Decision**: 首版不做复杂分页，在预期「≤ 100 个资产 × ≤ 30 个属性」范围内，通过表格滚动+虚拟化（如后续需要）满足性能；如未来数据量显著增长，再在 Library 展示页增加分页/筛选能力。  
**Rationale**: 当前 scope 下先保证实现简单和 UI 完整性，避免过早优化。  
**Alternatives**:  
- 一开始就实现分页/后端排序 — 增加复杂度，不符合当前需求优先级。

## Best Practices

- 复用 predefine 中的类型和 hooks（如 `SectionConfig`, `FieldConfig`, `useSchemaData`）来减少一份 schema 维护。  
- 表格单元格内容限制单行或最多两行，超出部分用 `title` 或 tooltip 显示完整内容，避免破坏布局。  
- 把和 Figma 相关的 mapping 假设写在代码注释和本目录文档中，避免隐式依赖。

## Open Questions Resolved

1. 是否需要在运行时访问 Figma：不需要，只在开发中用 F2C MCP。  
2. 表头结构的来源：完全由 predefine 配置驱动。  
3. 缺失属性值和空 Library 的 UX：使用统一占位文案和空状态组件。



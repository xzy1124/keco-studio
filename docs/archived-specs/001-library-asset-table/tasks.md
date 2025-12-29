# Tasks: Library Asset Table View

**Input**: Design documents from `/specs/001-library-asset-table/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-table.md`, `quickstart.md`

**Tests**: 本 feature 以可用性验证和手动对比 Figma 为主，不强制自动化测试；仅为关键组件预留 1 个基础单元测试任务。

**Organization**: Tasks 按用户故事分组，以便每个 story 可以独立实现和验证。

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 确认现有基础设施满足 Library 展示需求，无需新增项目级基础设施。

- [x] T001 确认 Supabase migrations 已应用（含 `projects`, `libraries`, `library_field_definitions`, `library_assets`, `library_asset_values`）并可在本地启动 `/home/a1136/Workspace/keco-studio` 项目。

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 为所有用户故事准备共享的类型、服务骨架和路由占位，确保后续工作在统一结构上进行。  
**⚠️ CRITICAL**: 完成本阶段后再开始各用户故事。

- [x] T002 创建 `lib/types/libraryAssets.ts` 中的 TS 类型骨架（`LibrarySummary`, `SectionConfig`, `PropertyConfig`, `AssetRow`），与 `contracts/ui-table.md` 中定义对齐。
- [x] T003 创建 `lib/services/libraryAssetsService.ts` 文件，定义空的 `getLibrarySummary`, `getLibrarySchema`, `getLibraryAssetsWithProperties` 函数签名，暂不实现具体 Supabase 查询。
- [x] T004 在 `components/libraries/LibraryAssetsTable.module.css` 中创建基础样式文件（空或最小结构），为后续表格样式实现预留命名空间。
- [x] T005 在 `components/libraries/LibraryAssetsTable.tsx` 中创建组件骨架，接收 `library`, `sections`, `properties`, `rows` props，并渲染一个最简表格占位（不含两层表头逻辑），用于打通路由到组件的渲染链路。
- [x] T006 在 `src/app/(dashboard)/[projectId]/[libraryId]/page.tsx` 中添加/调整 Library 展示页容器，使其在加载完成时调用 `libraryAssetsService` 并渲染 `LibraryAssetsTable`（可先使用 mock 数据占位），保留加载/错误状态占位。

**Checkpoint**: Library 展示页路由打通，能在浏览器中看到占位表格和基本加载/错误占位状态。

---

## Phase 3: User Story 1 - 浏览单个 Library 的资产属性表格 (Priority: P1) 🎯 MVP

**Goal**: 在 Library 展示页显示该 library 下所有资产的属性表格，第一行表头为 Section，第二行表头为 Property，每一行代表一个资产，与 predefine 配置和 Figma 结构一致（功能优先于完整像素级样式）。  
**Independent Test**: 仅实现本故事时，用户可在一个已配置好 Section/Property 且有资产数据的 library 上打开展示页，清晰看到两层表头和多行资产数据，并能理解每个资产的属性取值。

-### Implementation for User Story 1
-
- [x] T007 [US1] 在 `lib/services/libraryAssetsService.ts` 中实现 `getLibrarySummary`，基于现有 `public.libraries` 表或 `libraryService.ts` 获取库名与描述，并处理 not-found/forbidden 错误。
- [x] T008 [US1] 在 `lib/services/libraryAssetsService.ts` 中实现 `getLibrarySchema`，从 `public.library_field_definitions` 查询指定 `library_id` 的所有定义，并在服务层聚合出 `sections: SectionConfig[]` 与 `properties: PropertyConfig[]`（按 `section` + `order_index` 排序）。
- [x] T009 [US1] 在 `lib/services/libraryAssetsService.ts` 中实现 `getLibraryAssetsWithProperties`，联合 `public.library_assets` 与 `public.library_asset_values`，构建 `AssetRow[]`（行包含 `id`, `libraryId`, `name`, `propertyValues[fieldId]`，缺失值为 `null`）。
- [x] T010 [US1] 在 `src/app/(dashboard)/[projectId]/[libraryId]/page.tsx` 中接入 `getLibrarySummary`, `getLibrarySchema`, `getLibraryAssetsWithProperties`，添加加载/错误/空数据状态逻辑（包括：无资产、有资产但无字段、有字段但无资产）。
- [x] T011 [P] [US1] 在 `components/libraries/LibraryAssetsTable.tsx` 中实现两层表头渲染：第一行使用 Section 分组单元格（计算每个 Section 下 Property 数量以设置 `colSpan`），第二行渲染 Property 名称列。
- [x] T012 [P] [US1] 在 `components/libraries/LibraryAssetsTable.tsx` 中实现表体渲染逻辑：每个 `AssetRow` 为一行，左侧固定列展示资产名称，右侧根据 `properties` 顺序渲染单元格，读取 `row.propertyValues[property.id]` 并对 `null/undefined` 显示统一占位（如 `—`）。
- [x] T013 [P] [US1] 在 `components/libraries/LibraryAssetsTable.module.css` 中实现基础布局样式（表头两行、分组边界、单元格对齐、hover 状态），尽量贴近 Figma 的间距/颜色/字体，但可以先实现一个清晰可读的版本。
- [x] T014 [US1] 在 `src/app/(dashboard)/[projectId]/[libraryId]/predefine` 现有 hooks/types 的基础上，确保 `library_field_definitions` 的变更（新增/删除/重排）在刷新 Library 展示页后能正确影响表头结构（如有必要，提取/复用公共类型）。
- [ ] T015 [US1] 手动在本地创建一个带有 2–3 个 Section、若干 Property 和 10+ 资产的示例 Library，验证：表头与 predefine 一致、每一行资产数据正确渲染、无 Section 的 Property 或缺失值能正确展示。

**Checkpoint**: Library 展示页完成双层表头 + 资产行的渲染逻辑，支撑至少一个真实示例 library 的浏览，满足 SC-001 的理解时间目标（人工验证）。

---

## Phase 4: User Story 2 - 基于最新 predefine 配置自动更新表头 (Priority: P2)

**Goal**: 当 predefine 中新增、修改或删除 Section / Property 后，Library 展示页表头结构在刷新/重开页面时自动同步，无需人工维护列配置。  
**Independent Test**: 仅实现本故事（假设 US1 已完成）时，用户可在 predefine 中调整字段配置，并在刷新 Library 展示页后观察到表头结构、列顺序与配置完全一致。

### Implementation for User Story 2

- [ ] T016 [US2] 确认 `getLibrarySchema` 完全依赖数据库中 `library_field_definitions`，不缓存或硬编码 Section/Property，确保刷新页面时总是读取最新配置。
- [ ] T017 [P] [US2] 在 `lib/services/libraryAssetsService.ts` 中为 `getLibrarySchema` 和 `getLibraryAssetsWithProperties` 补充必要的排序/过滤逻辑（例如剔除已删除标记字段，如将来存在），确保字段增删改只需更新数据即可反映到展示。
- [ ] T018 [P] [US2] 在 `components/libraries/LibraryAssetsTable.tsx` 中确保表头和行渲染都是以 `sections` 和 `properties` props 为唯一来源，不保留本地静态列定义，以便 props 改变时 React 重新渲染正确表头。
- [ ] T019 [US2] 编写一个本地测试流程文档片段（可追加在 `quickstart.md`），描述如何在 predefine 中增删改字段并检查 Library 展示页表头变化，以用作回归检查清单。

**Checkpoint**: 多次在 predefine 中调整 Section/Property 后，刷新 Library 展示页表头可正确反映所有变更，且资产行仍然与新结构对齐。

---

## Phase 5: User Story 3 - 通过 F2C-mcp 获取 Figma 信息驱动 Library 展示 (Priority: P3)

**Goal**: 在开发和验收阶段使用 F2C MCP 工具从 Figma (`Keco - Component library`) 中获取/查看设计表格信息，与实际实现对比，确保列结构、命名和布局与设计稿高度一致。  
**Independent Test**: 即使只实现本故事（假设 US1 已完成），也能通过 F2C MCP 导出的 Figma 信息和浏览器中的 Library 展示页进行一一对比，验证字段命名和排列顺序是否一致。

### Implementation for User Story 3

- [x] T020 [US3] 使用 F2C MCP 对接 Figma 文件 `Keco - Component library`，获取 library 资产表格的列与示例行信息，并在本地生成一份参考 JSON/markdown（存放于 `specs/001-library-asset-table/.temp/` 或类似位置，仅用于开发）。
- [x] T021 [P] [US3] 对比 Figma 导出的字段结构与 `library_field_definitions` 中当前配置，记录命名/顺序上的差异，并在 `research.md` 或额外文档中注明当前实现如何贴合或有意偏离设计。
- [x] T022 [P] [US3] 根据 Figma 的间距/字号/配色，在 `components/libraries/LibraryAssetsTable.module.css` 中细化样式（如 header 对齐、行高、hover 状态），并对照 Figma 做一次视觉走查。
- [x] T023 [US3] 在 `quickstart.md` 中补充一节「与 Figma 对比」步骤，指导如何运行 F2C MCP、打开对应 Figma 页面以及在浏览器中对比 Library 展示页，以便后续回归验证。

**Checkpoint**: 有一套可重复的 Figma 对齐流程和文档，开发者可以通过 F2C MCP 和 quickstart 中的步骤快速验证 Library 展示表格与设计稿的一致性。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 提升整体质量和可维护性，覆盖多个用户故事的共性问题。

- [ ] T024 [P] 在 `tests/components/LibraryAssetsTable.test.tsx` 中为 `LibraryAssetsTable` 添加基础渲染与空/缺失值行为的单元测试，用假数据验证两层表头和占位文案是否符合预期。
- [ ] T025 代码整理与注释补全：为 `libraryAssetsService.ts` 中的查询逻辑和 `LibraryAssetsTable.tsx` 中的列分组算法添加清晰英文注释，解释与 Supabase schema 与 Figma 的对应关系。
- [ ] T026 [P] 按 `quickstart.md` 中描述完整走一遍手动验证流程（包含错误路径），修正在实际操作中发现的任何小问题（如边距、对齐、loading/empty 文案）。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，可立即开始。  
- **Foundational (Phase 2)**: 依赖 Phase 1 完成，阻塞所有用户故事实现。  
- **User Stories (Phases 3–5)**: 均依赖 Foundational 完成；  
  - US1 (P1) 为 MVP，优先完成；  
  - US2 (P2) 在 US1 完成后可并行或顺序进行；  
  - US3 (P3) 理论上可在 US1 完成后独立进行，但通常建议在表格基础稳定后再做 Figma 对齐。  
- **Polish (Phase 6)**: 依赖至少 US1 完成，最好在 US2/US3 完成后执行。

### User Story Dependencies

- **User Story 1 (P1)**: 仅依赖 Foundation，可独立交付为 MVP。  
- **User Story 2 (P2)**: 逻辑上建立在 US1 表格实现之上（需要已有渲染链路和基础服务），但实现方式主要是确保配置驱动，无强耦合。  
- **User Story 3 (P3)**: 建立在 US1 的实现和基本样式之上，聚焦 Figma 对齐和 dev 工具链，不改变核心数据流。

### Parallel Opportunities

- 标记为 `[P]` 的任务可以在不同文件上并行推进，例如：  
  - Phase 2 中的样式、组件骨架和服务骨架可以并行开发。  
  - US1 中表头渲染（T011）、行渲染（T012）与样式细化（T013）可在类型和服务稳定后并行推进。  
  - US3 中 Figma 数据获取（T020）、差异分析（T021）和样式微调（T022）可由不同开发者并行处理。

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1–2，确保类型、服务骨架与路由占位到位。  
2. 聚焦 Phase 3 (US1)，实现两层表头与资产行渲染，验证在一个示例 library 上可用。  
3. 按 `quickstart.md` 的步骤人工验证 SC-001 和主要 acceptance scenarios。  
4. 如有需要，可在此阶段先进行一次小范围 demo 或内测。

### Incremental Delivery

1. 在 MVP 稳定后，实现 Phase 4 (US2)，使字段配置变更无需改代码即可反映到表头。  
2. 再按需实现 Phase 5 (US3)，加入 Figma 对齐与 F2C MCP 流程，提升规范一致性。  
3. 最后执行 Phase 6（Polish），完善单测、注释和 quickstart 流程，减少后续维护成本。



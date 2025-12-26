# Feature Specification: Library Asset Table View

**Feature Branch**: `001-library-asset-table`  
**Created**: 2025-12-18  
**Status**: Draft  
**Input**: User description: "现在library的predefine页面已经完成，可以去新建section，在section里也可以增加property定义（fieldItem.ts）。但是关于library的展示页面还没有实现设计稿：https://www.figma.com/design/oiV14T1GHrP3jqecu50tbg/Keco---Component-library?node-id=1151-8997&t=L4jXlQLENncTBlx6-4 。这个表格的表头（第一行）是predefine的section，第二行就是section下的property。所以现在最重要的就是怎么把library下的asset用表格展示属性。当然第一步肯定是通过F2C-mcp工具获取到figma设计稿的信息，然后根据我说得需求去实现。"

Reference design: [Keco - Component library (Figma)](https://www.figma.com/design/oiV14T1GHrP3jqecu50tbg/Keco---Component-library?node-id=1151-8997&t=L4jXlQLENncTBlx6-4)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 浏览单个 Library 的资产属性表格 (Priority: P1)

作为设计师/开发者，当我打开某个 component library 的 Library 页面时，我可以看到该 library 下所有资产（components/variants 等）以表格形式展示，每个资产的一行中包含按 predefine Section 和 Section 下 Property 组织的属性列，与 Figma 中的设计表格结构一致。

**Why this priority**: 这是 library 的基础浏览能力，是后续筛选、对比、规范审查等行为的前提，无法浏览资产属性时 Library 页面几乎没有价值。

**Independent Test**: 仅实现该用户故事（无筛选、排序等高级能力）时，用户已可以通过打开 Library 页面、浏览表头 Section/Property 和多行资产数据，完成「了解当前 library 已定义哪些属性、每个资产的取值」这一完整任务。

**Acceptance Scenarios**:

1. **Given** 已存在一个 library，且在 predefine 页面中配置了至少 1 个 Section 与其下若干 Property，并且 library 下存在若干资产，  
   **When** 用户在应用中打开该 library 的「展示」页面，  
   **Then** 页面展示一个表格，表格第一行按 Section 分组展示列头，第二行在每个 Section 下展示对应 Property 的列头，后续每一行对应一个资产，展示资产名称及各 Property 的取值。
2. **Given** 某个 Section 下暂时没有任何 Property，  
   **When** 用户在 Library 页面查看表格，  
   **Then** 该 Section 在表头中仍有分组显示，但不会出现空的 Property 列（或使用约定好的占位显示），整体表格布局不被破坏。

---

### User Story 2 - 基于最新 predefine 配置自动更新表头 (Priority: P2)

作为 Library 的维护者，当我在 predefine 页面新增、修改或删除 Section / Property 配置时，我希望 Library 展示页的表头结构可以自动同步更新，无需手动维护列配置。

**Why this priority**: 保证展示表格与配置的单一事实来源保持一致，避免字段配置和展示脱节，减少维护成本和错误。

**Independent Test**: 即使只实现自动同步表头（不考虑高级交互），也可以通过在 predefine 中调整 Section/Property，然后刷新 Library 页面，观察表头结构变化，验证配置驱动的展示闭环。

**Acceptance Scenarios**:

1. **Given** 已存在 Library 展示表格，且 predefine 中新增了一个 Section 以及其下至少一个 Property，  
   **When** 用户刷新或重新打开 Library 展示页面，  
   **Then** 新增的 Section 出现在第一列表头行中，对应的 Property 出现在第二列表头行中，并在资产行中出现对应的空值或默认值。
2. **Given** predefine 中删除了某个 Property，  
   **When** 用户刷新或重新打开 Library 展示页面，  
   **Then** 表格第二列表头行中不再出现该 Property 列，资产行中也不再显示该列的数据。

---

### User Story 3 - 通过 F2C-mcp 获取 Figma 信息驱动 Library 展示 (Priority: P3)

作为系统维护者，我希望 Library 展示表格的资产及属性数据可以通过 F2C-mcp 工具从 Figma 设计稿中获取或校验，从而确保实际展示与设计稿保持一致，并减少手动录入工作量。

**Why this priority**: 将 Figma 中的真实组件信息与 Library 展示联通，能避免规范与实现偏差，也为后续自动化校验或同步打下基础。

**Independent Test**: 即使只实现从 Figma 通过 F2C-mcp 拉取基本资产列表和部分属性信息，也可以通过对比 Figma 上指定 Library 页面（例如 `Keco - Component library` 中的资产列表）和应用中的表格内容来独立验证这一能力。

**Acceptance Scenarios**:

1. **Given** F2C-mcp 工具已经配置好访问对应 Figma 文件和节点（如 `Keco - Component library` 的 library 表格节点），  
   **When** 系统触发从 Figma 拉取或更新 Library 资产信息，  
   **Then** Library 展示表格中资产的名称和基础信息与 Figma 中相应组件列表保持一致。
2. **Given** Figma 中某个资产的关键属性（如尺寸、状态标记等）已在 predefine 中映射为某个 Section / Property，  
   **When** 系统通过 F2C-mcp 获取并更新该资产的数据，  
   **Then** Library 展示表格中对应资产行、对应 Property 列的值与 Figma 中的设计信息一致或满足约定的映射规则。

---

### Edge Cases

- 当某个 library 下暂时没有任何资产时，Library 展示页如何表现（例如展示空表格状态和引导信息，而不是报错或空白页）。
- 当 predefine 中存在多个 Section、多个 Property，总字段数较多导致表格横向空间不足时，如何在不破坏信息结构的前提下进行滚动或自适应展示。
- 当某些资产缺失部分 Property 的值时，如何在表格中以统一、易懂的方式展示缺失（例如统一的「未定义」标记，而不是留空导致误解）。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Library 展示页面，用表格形式列出指定 library 下的所有资产，每一行代表一个资产。
- **FR-002**: System MUST generate the table header based on predefine 配置：第一行以 Section 为分组单元，第二行在各 Section 下展示对应 Property 的列头，保持与 Figma 设计稿结构一致。
- **FR-003**: Users MUST be able to open a specific library’s 展示页，从表格中清晰辨认资产名称以及各 Section / Property 的取值，不需要额外点击即可获取主属性信息。
- **FR-004**: System MUST update the header structure of the Library 表格 whenever predefine 中的 Section 或 Property 配置发生新增、修改或删除，使展示始终与最新配置保持一致。
- **FR-005**: System MUST handle cases where assets have missing values for certain Properties by显示统一的缺省状态文案或标记，而不是导致表格结构错位或渲染失败。
- **FR-006**: System MUST integrate with the F2C-mcp 工具以获取或校验来自 Figma 设计稿的 library 资产信息，使实际展示的资产列表与指定 Figma 文件中的 library 资产保持一致程度符合预期。
- **FR-007**: System MUST allow the Library 展示页在资产数量较多时仍保持可用性，例如通过合理的分页或滚动行为，让用户可以逐步浏览全部资产及其属性。

### Key Entities *(include if feature involves data)*

- **Library**: 表示一个组件库实体，包含名称、唯一标识、与 Figma 文件/节点的对应关系，以及其下属的资产集合。
- **Section**: 由 predefine 页面配置的属性分组单元，用于在表格第一行中作为列分组标题，包含名称、顺序等信息。
- **Property**: 属于某个 Section 的具体字段定义，用于在表格第二行中作为具体列头，包含名称、类型（如文本、枚举等）、显示顺序等信息。
- **Asset**: Library 下的具体条目（如组件、变体等），在表格中对应一行，包含资产标识、名称以及与各 Property 对应的属性值集合。
- **Figma Mapping**: 描述 Library/Asset/Property 与 Figma 中具体文件、页面、节点或组件的映射关系，用于通过 F2C-mcp 获取或校验数据。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 在已有 Section / Property 配置且 library 至少包含 20 个资产的情况下，用户从打开 Library 展示页到理解某个资产的关键属性信息所需时间不超过 30 秒，且在可用性测试中至少 90% 的用户能顺利完成该任务。
- **SC-002**: 当在 predefine 中新增或删除 Section / Property 后，刷新 Library 展示页即可看到表头结构与配置一致，手动检查 3 个以上示例场景时，表头与配置的一致性达到 100%。
- **SC-003**: 在引入 F2C-mcp 集成后，随机抽取至少 20 个资产进行对比，Library 展示表格中的资产名称及至少 1 个关键属性与 Figma 设计稿中对应信息的一致率达到 95% 及以上。
- **SC-004**: 在包含 100 个以上资产、每个资产至少 10 个 Property 的场景下，Library 展示页在常规使用设备上仍能保持流畅滚动和清晰展示，在内部体验反馈中与可用性相关的负面反馈率不超过 10%。



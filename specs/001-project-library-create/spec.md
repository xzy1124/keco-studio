# Feature Specification: Project & Library Creation

**Feature Branch**: `001-project-library-create`  
**Created**: 2025-12-12  
**Status**: Draft  
**Input**: User description: "现在项目需要实现新建project和新建library功能 并且项目已经去除了space层级结构！保留了project和library。我描述一下https://www.figma.com/design/oiV14T1GHrP3jqecu50tbg/Keco?node-id=928-73881&t=L4jXlQLENncTBlx6-4  这个figma设计稿是新建project的页面，点击新建项目按钮，就会出现一个弹窗组件：https://www.figma.com/design/oiV14T1GHrP3jqecu50tbg/Keco?node-id=928-74209&t=L4jXlQLENncTBlx6-4 ，组件功能就是设置项目的名称，项目的一些说明，所以需要建 项目的一个数据库表来保存项目信息；新建完项目后，页面是这个样子： 左侧 libraries处会出现几个默认的文件夹，点击其中一个文件夹就可以进行新建library，新建library的过程和project一样，都是一个弹窗组件，里面可以设置library的name和一些说明，所以也需要建立一个library表，建好library后，页面就是这个样子的：https://www.figma.com/design/oiV14T1GHrP3jqecu50tbg/Keco?node-id=1049-64881&t=L4jXlQLENncTBlx6-4，点击建好的library后，右侧就是tiptap编辑区域了。 可以使用f2c-mcp根据获取到具体figma设计稿的样式细节哦。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create project via modal (Priority: P1)

An authenticated user clicks “New Project”, fills in project name and description in a modal, confirms, and sees the project appear with a default Resource library in the left pane.

**Why this priority**: Project creation is the entry point; without it no downstream work is possible.

**Independent Test**: From an empty project list, create a project and verify it appears with default libraries without needing other features.

**Acceptance Scenarios**:

1. **Given** the user is on the projects view, **When** they open the New Project modal and provide a valid name, **Then** the project is created, the modal closes, and the project appears in the list with the default Resource library visible.
2. **Given** the New Project modal is open, **When** the user submits with missing required fields, **Then** inline validation prevents submission and explains what to fix.

---

### User Story 2 - Create library within a project (Priority: P1)

Within an existing project’s library list, the user clicks “New Library”, fills name and description in a modal, confirms, and sees the new library added under that project.

**Why this priority**: Libraries are the core content containers; users must be able to add them immediately after project creation.

**Independent Test**: From a project that already exists, create a library and verify it appears in the library list with no other actions needed.

**Acceptance Scenarios**:

1. **Given** a project is open and its libraries are visible, **When** the user submits the New Library modal with a valid name, **Then** the library appears in the list under that project and the modal closes.
2. **Given** the New Library modal is open, **When** the user submits a name that duplicates an existing library in the same project, **Then** the system blocks submission and explains duplication is not allowed.

---

### User Story 3 - Open library to edit content (Priority: P2)

The user clicks any library in the project list and the right content area loads the library’s rich text editor, ready for editing.

**Why this priority**: Editing is the primary value after libraries exist; must be quick and reliable.

**Independent Test**: With an existing library, click it and verify the editor loads and is ready for input without additional steps.

**Acceptance Scenarios**:

1. **Given** a library exists, **When** the user selects it from the list, **Then** the main pane shows the library title/metadata and an editable rich text area.
2. **Given** the editor is loaded, **When** the user switches to another library, **Then** the content area updates to the newly selected library without stale data.

### Edge Cases

- Project name missing or only whitespace when submitting the New Project modal.
- Library name missing or only whitespace when submitting the New Library modal.
- Duplicate project name (if uniqueness is enforced) or duplicate library name within the same project.
- Creation failure (e.g., network/server error) while submitting a modal.
- Default libraries partially created (some succeed, some fail) after project creation.
- User navigates away or closes modal mid-entry; no unintended drafts should persist.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to open a New Project modal from the projects view.
- **FR-002**: The New Project modal MUST require project name and support optional description with inline validation on submit.
- **FR-003**: Upon successful project creation, the system MUST create and display one default library (“Resource”) under that project.
- **FR-004**: Users MUST be able to open a New Library modal from within a project’s library list.
- **FR-005**: The New Library modal MUST require library name and support optional description with inline validation on submit.
- **FR-006**: The system MUST prevent duplicate library names within the same project and inform the user when conflicts occur.
- **FR-007**: Selecting a library MUST load its details and editable content into the main pane promptly and reliably.
- **FR-008**: Validation errors or backend failures during project/library creation MUST be surfaced in-context without closing the modal.
- **FR-009**: The system MUST persist created projects and libraries so that refreshing or revisiting shows the latest state.
- **FR-010**: The default Resource library created with a new project MUST be clearly visible in the library list immediately after creation.

### Key Entities *(include if feature involves data)*

- **Project**: Represents a workspace for libraries; key attributes include identifier, name, description, created/updated timestamps, owner/creator reference.
- **Library**: Represents a content container under a project; key attributes include identifier, project reference, name, description, created/updated timestamps.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of users can create a new project with required fields in under 1 minute from opening the modal.
- **SC-002**: 100% of newly created projects show the default Resource library immediately after creation.
- **SC-003**: 95% of library creation attempts succeed on the first try when required fields are valid.
- **SC-004**: Library selection loads the editor view within 2 seconds for 95% of attempts, with correct library title and content shown.
- **SC-005**: Reported user errors related to missing/invalid input during creation are reduced to fewer than 2% of creation attempts after validation is applied.

## Clarifications

### Session 2025-12-12
- Q: What default libraries are auto-created with a new project? → A: Create only one default library: Resource.

## Assumptions

- Default libraries after project creation: only one default library “Resource”.
- Project names are unique per user; library names are unique within a project.
- Users are already authenticated before accessing project and library creation flows.

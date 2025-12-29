# Quickstart: Library Asset Table View

## Prereqs

- Supabase 环境变量已配置：`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`。  
- 已有至少一个项目和一个 library（可按 `001-project-library-create` 的流程创建）。  
- 在该 library 的 predefine 页面中配置了至少 1 个 Section 和若干 Property。

## Steps

1) Install & run dev server

```bash
cd /home/a1136/Workspace/keco-studio
pnpm install
pnpm dev
```

2) Prepare data in predefine

- 在 dashboard 中选择某个项目和其下的一个 library。  
- 打开 `Predefine` 页面：`/(dashboard)/[projectId]/[libraryId]/predefine`。  
- 新建至少一个 Section，并在其中添加多个 Property（例如「尺寸」「状态」「语义类型」等），保存成功。

3) Open Library 展示页

- 在同一个 library 下，打开 Library 展示页（`/(dashboard)/[projectId]/[libraryId]` 对应的页面）。  
- 预期看到：  
  - 页面顶部显示 library 名称/描述。  
  - 中间为表格：第一行按 Section 分组的表头，第二行为 Property 表头，下面每一行代表一个资产。  
  - 若当前 library 暂无资产，则显示空状态文案和引导。

4) Manual checks

- 修改 predefine 中 Section / Property 顺序或新增/删除 Property，刷新 Library 展示页：  
  - 验证两行表头结构与最新配置一致。  
- 为几个资产补齐部分属性值，留一部分为空：  
  - 验证已填属性正确落在对应单元格；缺失值显示统一占位文案。  
- 人肉对比 Figma 设计稿（`Keco - Component library`）与页面：  
  - 检查字体、间距、颜色、hover/active 状态是否与设计一致（小误差可接受，但不应肉眼明显偏离）。

## 与 Figma 对比（US3）

1) 通过 F2C MCP 同步 Figma 表格信息  

- 在本机的 Cursor / MCP 环境中，使用 F2C MCP 连接到 Figma 账号。  
- 使用以下 Figma 链接作为来源：  
  - `https://www.figma.com/design/oiV14T1GHrP3jqecu50tbg/Keco---Component-library?node-id=1151-8997&t=L4jXlQLENncTBlx6-4`  
- 通过 F2C MCP 对上面的节点运行一次导出，将生成的代码写入：  
  - `specs/001-library-asset-table/.temp/index.tsx`  
- 如需结构化对比，可在 `.temp/figma-library-table.json` 中补充/更新 `sections`、`properties`、`sampleRows` 字段，记录从 Figma 读到的列结构和示例行。  

2) 在浏览器中打开 Library 展示页  

- 按前文步骤，启动 dev server 并打开某个已配置好的 Library 展示页：  
  - 路由：`/(dashboard)/[projectId]/[libraryId]`。  
- 确保该 Library 已配置与 Figma 对应的 Section/Property，并且有若干资产行。  

3) 一一对比字段命名与顺序  

- 在 Figma 中观察表格的表头结构：  
  - 第一行：Section 分组标题及其排列顺序；  
  - 第二行：各 Section 下 Property 的列名及顺序。  
- 在浏览器中观察 Library 展示页：  
  - 验证 Section 分组的名称与顺序是否与 Figma 一致；  
  - 验证每个 Section 下 Property 的名称与顺序是否一致。  
- 如发现差异：  
  - 若是命名不一致：评估是否应调整 `library_field_definitions.label` 或在文档中记录有意偏离；  
  - 若是顺序不一致：调整 `library_field_definitions.order_index`，再刷新页面验证。  

4) 视觉细节对齐  

- 使用 Figma 设计与浏览器页面并排对比：  
  - 检查表头行高、内边距、字体大小/字重、颜色；  
  - 检查 hover 行背景、空值占位符样式是否与设计期望接近。  
- 如需更精细的对齐，可以：  
  - 参考 `.temp/index.tsx` 中的 Tailwind 类或数值，微调 `LibraryAssetsTable.module.css` 中的 padding、字体和颜色。  

5) Error paths to verify

- 断网或 Supabase 返回错误时：  
  - Library 展示页应展示明显的错误提示和重试按钮，而不是空白或崩溃。  
- Library 存在但 predefine 中尚未配置任何 Section/Property：  
  - 展示「尚未配置属性」的提示，避免渲染结构错误的表格。



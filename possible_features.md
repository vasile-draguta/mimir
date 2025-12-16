# Feature Ideas

- Make sure mode changes adjust prompts before `generateContext()` calls
- [ ] Build history panel:
  - Repurpose side panel (`src/sidepanel/App.svelte`) to list recent lookups
  - Include timestamp and source URL
  - Store entries in `chrome.storage`
- [x] Implement keyboard activation:
  - Add shortcuts (e.g., Alt+D) in `App.svelte`
  - Allow popover opening without 500ms mouse hold
- [ ] Add share/export options:
  - Add copy-to-clipboard and export-to-Markdown buttons in `Popover.svelte`
  - Allow sharing or saving generated context
- [x] Provide whole paragraph for context
- [ ] Add arrow/shape to popup component:
  - Show a small shape/arrow coming from the side where the popover was generated

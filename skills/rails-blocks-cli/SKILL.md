---
name: rails-blocks-cli
description: Use this skill when the user wants an AI agent to add, update, inspect, preview, or read docs for Rails Blocks UI components in a Rails app using the rails-blocks CLI instead of MCP. Trigger for requests like "install the accordion component", "add Rails Blocks dropdown", "update Rails Blocks Stimulus controllers", "preview Rails Blocks files", or "use Rails Blocks Pro components". Do not use for general Rails UI work unrelated to Rails Blocks.
---

# Rails Blocks CLI

Use the `rails-blocks` CLI to discover, preview, install, and update Rails Blocks components in a Rails app.

Default to ERB partials unless the app already uses ViewComponent.

## Requirements

- Ruby 3.2 or newer.
- The command is available after `gem install rails-blocks-cli`.
- Run commands from the target Rails app root.

## Workflow

1. Confirm the command is being run from the Rails app root.
2. Check the CLI with `rails-blocks doctor`. If the command is missing, install it with `gem install rails-blocks-cli`.
3. Discover components with `rails-blocks list`, `rails-blocks list --free`, or `rails-blocks search QUERY`.
4. Read docs before installing with `rails-blocks docs COMPONENT`; inspect examples with `rails-blocks examples COMPONENT` when useful.
5. Preview file writes before changing the app: `rails-blocks install COMPONENT --dry-run`.
6. Summarize the files the dry run would write and ask before making changes.
7. Install with `rails-blocks install COMPONENT --as erb_template` unless ViewComponent is the better fit.
8. Use custom paths instead of moving files after install: `--path app/views/components` and `--stimulus-path app/javascript/controllers`.
9. After installation, inspect `git diff` and report the changed files.

## Updates

1. Review changes first with `rails-blocks diff COMPONENT --as erb_template` or `rails-blocks diff stimulus NAME`.
2. Apply updates only after review with `rails-blocks update COMPONENT --as erb_template` or `rails-blocks update stimulus NAME`.
3. Inspect `git diff` after updating.

## Rules

- Use `--dry-run` before installs or updates unless the user explicitly approves writing files.
- Do not pass `--force` unless the user explicitly approves overwriting existing files.
- If the user asks for all free components, use `rails-blocks install --all --free --dry-run` first.
- If the user asks for Pro components, run `rails-blocks login` first or ask them to provide `RAILS_BLOCKS_API_TOKEN`.
- If styling, JavaScript behavior, or dependency issues appear, tell the user to complete the Rails Blocks installation guide before retrying component installs.
- Prefer the app's existing component style. Use ViewComponent when the app already uses ViewComponent; otherwise use ERB partials.

## Gotchas

- Free components do not require a Rails Blocks account.
- Pro components require a Pro token.
- Required Stimulus controllers are installed automatically when missing.
- Existing files are skipped unless `--force` is passed.
- Run commands from the target Rails app root, not from a gem or engine subdirectory.

## Common Commands

```bash
rails-blocks list --free
rails-blocks search dropdown
rails-blocks docs accordion
rails-blocks install accordion --dry-run
rails-blocks install accordion --as erb_template
rails-blocks install accordion --as view_component
rails-blocks diff accordion --as erb_template
rails-blocks update accordion --as erb_template
rails-blocks diff stimulus tooltip
rails-blocks update stimulus tooltip
rails-blocks login
rails-blocks doctor
```

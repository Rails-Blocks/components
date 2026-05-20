# Rails Blocks Components

Free, open-source Rails UI components from [Rails Blocks](https://railsblocks.com), ready to browse, copy, and install in your Rails app.

This repo is the source for the free Rails Blocks component files. You can read the docs, inspect the examples, download the packages, or let the Rails Blocks CLI and MCP server pull from GitHub for you.

## What's Included

- `registry.json` - the component index used by the Rails Blocks CLI and MCP server.
- `components/` - docs, usage examples, and package manifests for each free component.
- `stylesheets/rails_blocks.css` - the Rails Blocks custom CSS used by the components.
- `stimulus_controllers/` - Stimulus controllers used by the free components.
- `packages/0.1.1/` - immutable zip packages and SHA256 checksums.

## Usage

Install components with the Rails Blocks CLI:

```bash
rails-blocks list --free
rails-blocks install accordion --as erb_template
rails-blocks update stimulus --all --free
```

The CLI reads this repo directly, so free components can be installed without signing in to Rails Blocks.

## Agent Skill

Install the Rails Blocks CLI skill in AI agents that support Agent Skills:

```bash
npx skills add Rails-Blocks/components --skill rails-blocks-cli
```

The skill teaches agents to use the `rails-blocks` CLI directly, with dry-run previews before file writes.

## License

The free Rails Blocks components in this repository are published under the MIT License.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # run ESLint
```

## Stack

- **Next.js 16.2.4** with App Router (`src/app/`)
- **React 19.2.4**
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- JavaScript (no TypeScript)

## Architecture

This is a bare Create Next App scaffold — only the default boilerplate exists. The intended project is a lifting diary app; all feature code is yet to be written.

- `src/app/layout.js` — root layout with Geist font setup and global CSS
- `src/app/page.js` — home page (currently default scaffold)
- `src/app/globals.css` — global styles
- `public/` — static assets

New routes go under `src/app/` using the App Router file conventions (`page.js`, `layout.js`, `loading.js`, etc.). Read `node_modules/next/dist/docs/` before writing Next.js code — this version has breaking changes from prior releases.

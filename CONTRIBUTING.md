# Contributing

Thanks for your interest in contributing to Focus Timer!

## Getting Started

1. Fork the repository and clone it locally
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## Development

- `npm run dev` — starts Vite dev server at `http://localhost:5173`
- `npm run build` — builds the production bundle into `dist/`
- `npm run preview` — serves the production build locally

The project uses Node 20. If you use [nvm](https://github.com/nvm-sh/nvm), run `nvm use` in the project root to switch automatically.

## Making Changes

- Keep the component self-contained — styles live inside `FocusTimer.jsx` as a `<style>` tag
- Respect the existing motion and accessibility patterns (`prefers-reduced-motion`, ARIA labels, focus-visible states)
- Test on both desktop and mobile before submitting

## Submitting a Pull Request

1. Create a branch: `git checkout -b your-feature`
2. Commit your changes with a clear message
3. Push and open a PR against `main`
4. Describe what you changed and why

All PRs are welcome — bug fixes, improvements, or new features.

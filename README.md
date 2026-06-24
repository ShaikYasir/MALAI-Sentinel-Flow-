# React + Vite + Tailwind CSS

A modern web application template combining React, Vite, and Tailwind CSS for fast development and beautiful, responsive UIs.

## Features

- ⚡ **Vite** - Lightning-fast build tool and dev server
- ⚛️ **React 19** - Latest React with hooks and features
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔄 **Hot Module Replacement (HMR)** - Instant updates during development
- 📦 **Optimized Builds** - Fast, production-ready bundles

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm

### Installation

The project is pre-configured with all dependencies. If needed, install them:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── App.jsx          # Main App component
├── App.css          # (removed - using Tailwind)
├── index.css        # Tailwind directives
├── main.jsx         # Entry point
└── assets/          # Static assets
```

## Tailwind CSS

Tailwind is configured with:

- Content paths for JSX files in `src/`
- PostCSS and Autoprefixer for vendor prefixes
- Default theme with customization support

Edit `tailwind.config.js` to customize colors, fonts, and other design tokens.

## ESLint

This project includes ESLint configuration. Check [the template docs](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react) for extending the configuration.

## Learn More

- [Vite Documentation](https://vite.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## License

MIT

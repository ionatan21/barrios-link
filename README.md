# Barrios Link

A modern URL shortener built with React and Vite.

Live demo: [barrios-link](https://barrios-link.vercel.app/)

## Features

- Shorten long URLs into compact links
- Clean and modern user interface
- Animated gradient background
- Copy shortened URLs with one click
- View and manage your shortened links

## Tech Stack

- React 19
- Vite
- React Router DOM
- Tailwind CSS
- shadcn/ui components
- Three.js for 3D effects

## Installation

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

## Usage

Start the development server:
```bash
pnpm dev
```

Build for production:
```bash
pnpm build
```

Preview production build:
```bash
pnpm preview
```

## Project Structure

```
src/
├── components/       # React components
│   ├── Shortenurl/  # Main URL shortener component
│   ├── Redirect/    # URL redirect handler
│   ├── 404/         # Not found page
│   └── ui/          # Reusable UI components
├── config/          # Configuration files
└── lib/             # Utility functions
```

## License

MIT

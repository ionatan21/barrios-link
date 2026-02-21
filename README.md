# Barrios Link

A modern URL shortener built with React and Vite.

Live demo: [barrios-link](https://b-lnk.vercel.app//)

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

## Environment Management

This project uses environment-specific configurations to handle different API and app URLs for development and production environments.

### Development Environment

When running locally with `pnpm dev`, the application uses:
- **API URL**: `http://localhost:3000` (local backend)
- **App URL**: `http://localhost:5173` (Vite dev server)

Shortened links will be created as: `http://localhost:5173/BaGyz0`

**Configuration**: Defined in [`.env.development`](.env.development)

### Production Environment

When deployed to Vercel with `pnpm build`, the application uses:
- **API URL**: `https://barrios-link-backend.com` (backend)
- **App URL**: `https://barrios-link.com` (frontend)

Shortened links will be created as: `https://barrios-link.com/BaGyz0`

**Configuration**: Defined in [`.env.production`](.env.production)

### Customizing URLs

To use different ports or domains:

1. **Development**: Edit `.env.development`
   ```env
   VITE_API_URL=http://localhost:YOUR_PORT
   VITE_APP_URL=http://localhost:VITE_PORT
   ```

2. **Production**: Edit `.env.production`
   ```env
   VITE_API_URL=https://your-api-domain.com
   VITE_APP_URL=https://your-app-domain.com
   ```

Vite automatically loads the appropriate `.env` file based on the environment.

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

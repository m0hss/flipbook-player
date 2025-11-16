# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## FlipBook Portfolio

A modern PDF flipbook viewer built with React, featuring:
- Interactive page flipping with support for both mobile and desktop
- PDF upload and management via Vercel Blob storage
- Protected admin area with Basic Auth
- Responsive design with dark mode

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `VITE_BASIC_AUTH_USER` and `VITE_BASIC_AUTH_PASS`: Credentials for the `/upload` admin page
   - `BASIC_AUTH_USER` and `BASIC_AUTH_PASS`: Same credentials for API routes (server-side)
   - `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token (get from Vercel Dashboard > Storage)

3. **Development:**
   ```bash
   npm run dev
   ```

4. **Deploy to Vercel:**
   - Connect your repository to Vercel
   - Add environment variables in Vercel Dashboard > Settings > Environment Variables
   - Create a Blob store in Vercel Dashboard > Storage
   - Deploy!

### Features

#### PDF Upload (`/upload`)
- Protected route requiring Basic Auth credentials
- Upload PDFs to Vercel Blob storage
- Manage custom PDF library (add/delete)
- PDFs are persisted in cloud storage

#### PDF Viewer (`/`)
- Smooth page flipping animations
- Zoom and pan controls
- Responsive layout for mobile and desktop
- Support for mixed portrait/landscape PDFs
- Full-screen mode

### Tech Stack

- **Frontend:** React + Vite
- **PDF Rendering:** react-pdf + pdf.js
- **Flipbook:** react-pageflip
- **Storage:** Vercel Blob
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

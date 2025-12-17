# Mimir 🧠

A Chrome extension that provides instant context for any text you highlight so you don't have to Google it.

## 🎬 Demo

<video src="https://github.com/user-attachments/assets/89595b4f-c71c-4b51-a7c8-108e140017a3" width="320" height="240" controls></video>

## 🚀 Quick Start

**v1.0.0 is now available!** The backend server is hosted, so you can use the extension right away:

1. Download `crx-Mimir-1.0.0.zip` from the [latest release](https://github.com/vasile-draguta/mimir/releases/latest)
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode"
4. Drag and drop the zip file onto the page
5. Start highlighting text and hold down the click on the highlighted text!

## ✨ Features

- **Instant Context** - Highlight any text on a webpage and get AI-powered context instantly
- **Beautiful UI** - Glassmorphism inspired popover with smooth animations
- **Works Everywhere** - Seamlessly integrates with any website
- **Light & Dark Mode** - Automatically adapts to your browsing environment

## 🚀 How It Works

1. **Highlight** any text on a webpage, hold the click on the highlighted text or press `CMD + K`
2. **Wait** for the popover to appear
3. **Read** the contextual explanation without leaving the page

No more opening 10 tabs to understand what you're reading.

## 🛠️ Tech Stack

- **Frontend**: Svelte 5, TypeScript, TailwindCSS, Vite
- **Extension**: CRXJS Vite Plugin
- **Backend**: Express.js with Groq AI

## 📦 Installation

### From Source

1. Clone the repository:
```bash
git clone git@github.com:vasile-draguta/mimir.git
cd mimir
```

2. Install dependencies:
```bash
bun install
```

3. Start development server for the frontend:
```bash
bun run dev
```

4. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory

5. Start development server for the backend:
```bash
cd server
bun run dev
```

### Production Build

1. Build the frontend:
```bash
bun run build
```

2. Build the backend:
```bash
cd server
bun run build
```

## 📁 Project Structure

```
mimir/
├── src/
│   ├── assets/           # Static assets (icons, images)
│   ├── content/          # Content script (injected into pages)
│   │   ├── api/          # API client for backend
│   │   ├── composables/  # Reusable Svelte logic
│   │   ├── utils/        # Utility functions
│   │   ├── views/        # UI components (App.svelte, Popover.svelte)
│   │   ├── main.ts       # Content script entry point
│   │   └── style.css     # Glassmorphism styles
│   ├── popup/            # Extension popup UI
│   └── sidepanel/        # Side panel UI
├── server/               # Express.js backend API
│   └── src/
│       ├── middleware/   # Auth, rate limiting, validation
│       ├── routes/       # API endpoints
│       ├── services/     # LLM service (Groq)
│       └── index.ts      # Server entry point
├── manifest.config.ts    # Chrome extension manifest
└── vite.config.ts        # Vite build configuration
```

## 🔧 Configuration

Create a `.env` file in the `server` directory:

```env
GROQ_API_KEY=your_groq_api_key
API_KEY=your_api_key_for_auth
```

Create a `.env` file in the root directory for the frontend:

```env
VITE_API_URL=http://localhost:3000
VITE_API_KEY=your_api_key_for_auth
```

---

Built with ❤️ and a desire to never Google the same thing twice.

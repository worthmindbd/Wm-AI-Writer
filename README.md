# Wm AI Writer

A stateless, single-page SEO content creation tool powered by Google Gemini API.

## Overview

Wm AI Writer helps content creators generate SEO-optimized articles with:
- AI-powered content generation using Google Gemini API
- Smart keyword integration (focus + LSI keywords)
- Automatic image prompt suggestions mapped to content sections
- WordPress-ready formatted output
- Professional "green village" themed UI with dark/light mode

## Quick Start

```bash
# Clone or navigate to the project directory
cd Wm-AI-Writer

# Run the initialization script
./init.sh
```

The script will:
1. Check Node.js 18+ is installed
2. Install all dependencies
3. Set up Tailwind CSS with custom green village theme
4. Start the development server on http://localhost:5173

## Requirements

- **Node.js** 18 or higher
- **npm** (comes with Node.js)
- **Google Gemini API Key** (provided by you at runtime)

## How It Works

1. **Enter your Gemini API Key** - Stored securely in your browser's localStorage only
2. **Input Keywords** - Provide a focus keyword and LSI (Latent Semantic Indexing) keywords
3. **Select/Write Title** - Choose from AI suggestions or write your own
4. **Generate Content** - AI creates SEO-optimized content with proper structure
5. **Get Image Prompts** - Receive AI-generated image prompts mapped to content sections
6. **Export** - Copy to clipboard (WordPress-ready) or download as text/Markdown

## Features

### Content Generation
- AI-powered SEO-optimized articles
- Proper heading structure (H1, H2, H3)
- Bullet points and numbered lists
- Conclusion and call-to-action sections
- Multiple content tones (professional, casual, friendly)
- Multiple formats (blog post, article, product description)
- Multi-language support

### Image Prompts
- 3 thumbnail/hero image prompts
- Additional prompts based on LSI keywords
- Calculated based on content length
- Mapped to specific content sections
- Rich, descriptive prompts for AI image generation

### SEO Tools
- Meta description generation
- URL slug suggestions
- Keyword density analysis
- Focus keyword highlighting
- LSI keyword usage tracking
- SEO score calculation
- Readability score

### Output Options
- One-click copy to clipboard (WordPress-ready)
- Edit generated content before export
- Download as text file
- Download as Markdown file
- Word count and reading time estimation

## Design

**Theme:** Green Village (earth greens, natural tones)

**Light Mode Colors:**
- Primary: Forest green (#2D5016)
- Secondary: Sage green (#8B9A6B)
- Accent: Moss green (#4A6741)
- Background: Cream/off-white (#FDFCF8)

**Dark Mode Colors:**
- Primary: Light forest green (#4A7C2D)
- Secondary: Muted sage (#A8B89B)
- Background: Dark earth (#1A1E18)

## Security & Privacy

- ✅ No user accounts or authentication required
- ✅ API key stored only in your browser's localStorage
- ✅ API key masked in UI (never shown in plain text)
- ✅ API key transmitted directly to Google Gemini API only
- ✅ No data sent to any third-party servers except Google Gemini API
- ✅ No backend server - pure client-side application

## Development

### Technology Stack
- **Frontend:** Vite + React + TypeScript
- **Styling:** Tailwind CSS (custom green village theme)
- **State Management:** React hooks (useState, useContext, useEffect)
- **API:** Direct Google Gemini API calls (client-side)
- **Storage:** localStorage (API key and theme preference only)

### Project Structure
```
Wm-AI-Writer/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API integration
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   └── App.tsx         # Main app component
├── public/             # Static assets
├── init.sh             # Development setup script
└── README.md           # This file
```

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check
```

## Notes

- This is a **stateless application** - no database or backend server
- All data persistence happens in your browser's localStorage
- Your API key never leaves your browser except to Google's Gemini API
- No content is stored on any server

## License

[Your License Here]

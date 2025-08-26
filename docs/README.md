# Synthesia SDK Documentation

This directory contains the complete documentation website for the Synthesia TypeScript SDK, built with [Starlight](https://starlight.astro.build/) - a modern documentation framework powered by Astro.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:4321

# Build for production
npm run build
```

## 📁 Project Structure

```
docs/
├── public/                 # Static assets (favicon, images)
├── src/
│   ├── assets/            # Build-time assets (logos, hero images)
│   ├── components/        # Custom Astro components
│   ├── content/
│   │   └── docs/          # Documentation content (Markdown/MDX)
│   │       ├── api-reference/     # Videos, Templates, Webhooks, Uploads APIs
│   │       ├── examples/          # Code examples and patterns
│   │       ├── getting-started/   # Installation, quickstart, auth
│   │       ├── guides/            # Step-by-step tutorials
│   │       ├── resources/         # Avatars, voices, webhook events
│   │       └── index.mdx          # Homepage
│   ├── styles/            # Custom CSS and theming
│   └── env.d.ts          # TypeScript environment definitions
├── .gitignore             # Git ignore rules (dist/, node_modules/, etc.)
├── astro.config.mjs       # Astro & Starlight configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## 🧞 Available Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |

## 📚 Documentation Content

Complete SDK documentation covering:

- **Getting Started** - Installation, quickstart, and authentication
- **API Reference** - Videos, Templates, Webhooks, and Uploads APIs  
- **Guides** - Step-by-step tutorials for common use cases
- **Examples** - Practical code examples and integration patterns
- **Resources** - Avatars, voices, and webhook events reference

Based on the official [Synthesia API documentation](https://docs.synthesia.io/reference) with SDK-specific examples, TypeScript types, and best practices.

## ✨ Features

### Built-in Starlight Features
- ✅ **Responsive Design** - Mobile, tablet, desktop optimized
- ✅ **Full-Text Search** - Powered by Pagefind
- ✅ **Dark/Light Mode** - Automatic theme switching
- ✅ **Code Highlighting** - Syntax highlighting with Shiki
- ✅ **Navigation** - Auto-generated sidebar from frontmatter
- ✅ **Table of Contents** - Auto-generated from headings (H2-H4)
- ✅ **SEO Optimized** - Meta tags, descriptions, Open Graph
- ✅ **MDX Support** - Use components in Markdown

### Custom Enhancements
- ✅ **API Documentation Styling** - Custom CSS for API reference
- ✅ **External Link Indicators** - Visual indicators for official API links
- ✅ **Status Badges** - Required/optional parameter badges
- ✅ **Callout Boxes** - Info, warning, error, and success callouts

## 📝 Adding New Documentation

### Creating New Pages

1. Create a `.md` or `.mdx` file in the appropriate directory under `src/content/docs/`
2. Add frontmatter with title, description, and sidebar order:

```markdown
---
title: Your Page Title
description: Brief description of the page content.
sidebar:
  order: 1
---

Your content here...
```

### Updating Navigation

The sidebar is auto-generated but can be customized in `astro.config.mjs`:

```javascript
sidebar: [
  {
    label: 'Section Name',
    autogenerate: { directory: 'section-directory' },
  },
]
```

## 🎨 Customization

### Components
- Custom components: `src/components/`
- Override Starlight defaults as needed
- Use Astro components for complex layouts

### Assets
- Static assets: `public/` directory  
- Build-time assets: `src/assets/`
- Images optimized automatically

## 📄 Content Guidelines

### Writing Style
- Use clear, concise language
- Include complete, working code examples
- Link to official Synthesia API documentation
- Provide TypeScript type information
- Include error handling examples

### Code Examples
- Always test examples before publishing
- Use proper TypeScript typing
- Show both success and error cases
- Include helpful comments

### Links
- Official API docs: `> 📖 **Official Documentation**: [Link Text](URL)`
- Use relative links for internal documentation
- Mark external links appropriately

## 🚀 Deployment

The documentation builds to static files and can be deployed anywhere:

```bash
npm run build
# Deploy the dist/ folder
```

**Recommended hosting:**
- [Netlify](https://netlify.com/) - Zero-config deployment
- [Vercel](https://vercel.com/) - Automatic deployments  
- [GitHub Pages](https://pages.github.com/) - Free hosting
- [Cloudflare Pages](https://pages.cloudflare.com/) - Fast global CDN

## 🔗 Related Links

- [Starlight Documentation](https://starlight.astro.build/)
- [Astro Documentation](https://docs.astro.build/)
- [Official Synthesia API Docs](https://docs.synthesia.io/reference)
- [Synthesia SDK on GitHub](https://github.com/synthesia-io/@androettop/synthesia-sdk)

## 📋 Development Notes

- Node.js 16+ required
- Uses Astro 4.x and Starlight 0.15+
- All content in `src/content/docs/` with frontmatter
- Auto-generated sidebar navigation
- Custom CSS for API documentation styling
# LuminousArizona.com

A photography portfolio website built with Eleventy (11ty) showcasing Arizona's unique places and landscapes.

**Developed by:** CelticParser

---

## Installation

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn package manager
- Git

### Clone and Install

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd LuminousArizona.com
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start
   ```

   The site will be available at `http://localhost:8080` (or the port shown in your terminal).

---

## NPM Commands

### Development Commands

- **`npm run start`** - Builds Sass and starts Eleventy dev server with watch mode
- **`npm run dev`** - Alias for `npm run start`

### Build Commands

- **`npm run build`** - Production build: compresses Sass and builds Eleventy site
- **`npm run build:sass`** - Build Sass to CSS (development)
- **`npm run build:sass:prod`** - Build Sass to CSS (production, compressed, no source maps)
- **`npm run build:eleventy`** - Build Eleventy site only

### Watch Commands

- **`npm run watch:sass`** - Watch Sass files and auto-compile on changes
- **`npm run watch:eleventy`** - Watch Eleventy files and rebuild on changes

### Utility Commands

- **`npm run clean`** - Remove the `public` build directory
- **`npm run todos`** - Scan the codebase for TODO comments and update the README.md TODO section
- **`npm run watch:todos`** - Watch for file changes and automatically update the README.md TODO section

---

## Eleventy Commands

### Common Eleventy CLI Commands

These commands can be run directly with `npx eleventy` or via npm scripts:

- **`eleventy`** - Build the site once
- **`eleventy --serve`** - Build and serve with auto-reload (used in `watch:eleventy`)
- **`eleventy --watch`** - Build and watch for changes
- **`eleventy --output=./dist`** - Specify custom output directory
- **`eleventy --formats=liquid,md`** - Specify which template formats to process
- **`eleventy --quiet`** - Suppress verbose output (already enabled in config)

### Eleventy Configuration

The Eleventy configuration is in `eleventy.config.js` and includes:
- Custom collections: `projects`, `images`, `about`, `posts`
- Image processing with multiple formats (AVIF, WebP, JPEG) and responsive widths
- RSS feed generation
- XML sitemap generation
- Custom filters and shortcodes

---

## Git Commands

### Common Git Workflow Commands

#### Initial Setup
```bash
git clone <repository-url>
git remote add origin <repository-url>
```

#### Daily Workflow
```bash
# Check status
git status

# Stage all changes
git add .

# Stage specific files
git add <filename>

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push origin <branch-name>

# Pull latest changes
git pull origin <branch-name>
```

#### Branch Management
```bash
# Create and switch to new branch
git checkout -b <branch-name>

# Switch branches
git checkout <branch-name>

# List all branches
git branch -a

# Delete local branch
git branch -d <branch-name>

# Delete remote branch
git push origin --delete <branch-name>
```

#### Useful Commands
```bash
# View commit history
git log

# View changes in working directory
git diff

# Remove file from Git (keeps local file)
git rm --cached <filename>

# Remove directory from Git and filesystem
git rm -r <directory-name>
git commit -m "Remove directory"
git push origin <branch-name>

# Undo last commit (keeps changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- <filename>
```

---

## Project Structure

### Directory Structure

```
LuminousArizona.com/
├── src/                          # Source files
│   ├── _/                        # Eleventy configuration files
│   │   ├── _data/                # Global data files (site.yml, metadata.json)
│   │   ├── includes/             # Reusable template includes
│   │   │   ├── framework/        # Core framework includes
│   │   │   │   └── shortcodes/   # Shortcode includes
│   │   │   └── theme/            # Theme-specific includes
│   │   ├── layouts/              # Page layout templates
│   │   └── sass/                 # Sass stylesheets
│   │       ├── framework/        # Bootstrap and framework styles
│   │       └── theme/            # Theme-specific styles
│   ├── about/                    # About page content
│   ├── assets/                   # Static assets (images, fonts, CSS, JS)
│   ├── essays/                   # Photo essay / image pages (markdown, flat *.md)
│   ├── projects/                 # Project landing pages: <project-name>.md
│   ├── feed.md                   # RSS feed template
│   ├── sitemap.liquid            # XML sitemap template
│   ├── image-sitemap.liquid      # Image sitemap template
│   └── *.md                      # Root level pages (home.md, license.md, etc.)
├── public/                       # Built site (generated, gitignored)
├── eleventy.config.js            # Eleventy configuration
├── netlify.toml                  # Netlify deployment configuration
└── package.json                  # NPM dependencies and scripts
```

### Includes Structure

#### Framework Includes (`src/_/includes/framework/`)

Core reusable components used across the site:

- **Navigation & Menus:**
  - `header.liquid` - Site header with logo and navigation
  - `menu-main.liquid` - Main navigation menu
  - `menu-main-mobile.liquid` - Mobile navigation menu
  - `menu-footer.liquid` - Footer menu
  - `project-navigation.liquid` - Previous/next project navigation
  - `image-navigation.liquid` - Previous/next image navigation within projects
  - `project-breadcrumb.liquid` - Breadcrumb navigation for projects

- **Content Components:**
  - `heading.liquid` - Page heading component
  - `content.liquid` - Content wrapper
  - `card-project.liquid` - Project card component
  - `card-post.liquid` - Blog post card component
  - `project-gallery.liquid` - Project image gallery
  - `sidebar.liquid` - Sidebar component

- **Shortcodes (`framework/shortcodes/`):**
  - `responsive-image.liquid` - Responsive image with multiple formats
  - `image.liquid` - Basic image shortcode
  - `figure.liquid` - Figure with caption
  - `youtube.liquid` - YouTube embed

- **SEO & Meta:**
  - `seo-meta-tags.liquid` - SEO meta tags
  - `og-meta-tags.liquid` - Open Graph meta tags
  - `feed.liquid` - RSS feed link
  - `favicon.liquid` - Favicon links

- **Analytics & Tracking:**
  - `google-analytics.liquid` - Google Analytics
  - `google-tag-manager.liquid` - Google Tag Manager
  - `plausible-analytics.liquid` - Plausible Analytics
  - `umami-analytics.liquid` - Umami Analytics

- **Forms & Contact:**
  - `form-contact-netlify.liquid` - Netlify contact form
  - `form-contact-formspree.liquid` - Formspree contact form
  - `contact.liquid` - Contact page component

- **Other Components:**
  - `footer.liquid` - Site footer
  - `cookie-consent.liquid` - Cookie consent banner
  - `fonts.liquid` - Font loading
  - `logo.liquid` - Site logo
  - `pagination.liquid` - Pagination controls
  - `breadcrumbs.liquid` - Breadcrumb navigation

#### Theme Includes (`src/_/includes/theme/`)

Theme-specific components:

- **`tripod-map.liquid`** - Google Maps integration showing tripod locations
  - Used in: `project-portrait.liquid`, `project-landscape.liquid`, `image-portrait.liquid`, `image-landscape.liquid`
  - Displays map markers for image locations
  - Uses Google Maps AdvancedMarkerElement API

- **`cards/`** - Card components
  - `card-project.liquid` - Project card styling
  - `card-post.liquid` - Blog post card styling

#### How Includes Link Up

1. **Layouts** (`src/_/layouts/`) use includes from `framework/` and `theme/`:
   ```liquid
   {% include 'framework/header' %}
   {% include 'framework/project-navigation' %}
   {% include 'theme/tripod-map' %}
   ```

2. **Framework includes** can use other framework includes:
   ```liquid
   {% include 'framework/shortcodes/responsive-image', src: image %}
   ```

3. **Includes are referenced** without the `.liquid` extension:
   - `{% include 'framework/header' %}` → `src/_/includes/framework/header.liquid`
   - `{% include 'theme/tripod-map' %}` → `src/_/includes/theme/tripod-map.liquid`

4. **Data flows** from front matter → layout → includes:
   - Page front matter → Layout variables → Include parameters

---

## Netlify Deployment

### Configuration

The project includes a `netlify.toml` file with the following configuration:

```toml
[build]
  publish = "public"
  command = "npm run build"
```

### Deployment Steps

1. **Connect Repository to Netlify:**
   - Log in to [Netlify](https://www.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

2. **Configure Build Settings:**
   - Build command: `npm run build` (already in netlify.toml)
   - Publish directory: `public` (already in netlify.toml)
   - Node version: Use Node.js 18.x or higher

3. **Environment Variables (if needed):**
   - Add any required environment variables in Netlify dashboard
   - Under Site settings → Build & deploy → Environment

4. **Deploy:**
   - Netlify will automatically deploy on every push to your main branch
   - Or trigger manual deploy from the Netlify dashboard

### Netlify Features Used

- **Automatic Deployments:** Deploys on every Git push
- **Preview Deployments:** Creates preview URLs for pull requests
- **Form Handling:** Netlify Forms for contact forms (see `form-contact-netlify.liquid`)
- **Redirects:** Can be configured in `netlify.toml` if needed

### Custom Domain Setup

1. Go to Site settings → Domain management
2. Add your custom domain
3. Follow Netlify's DNS configuration instructions

---

## Open Source Assets

### Core Framework & Build Tools

#### Eleventy (11ty)
- **What:** Static site generator
- **Where:** `package.json`, `eleventy.config.js`
- **Link:** https://www.11ty.dev/
- **Usage:** Core SSG framework, processes templates and generates static HTML

#### Sass
- **What:** CSS preprocessor
- **Where:** `package.json`, `src/_/sass/style.scss`
- **Link:** https://sass-lang.com/
- **Usage:** Stylesheet compilation, located in `src/_/sass/`

### Eleventy Plugins

#### @11ty/eleventy-img
- **What:** Image processing plugin
- **Where:** `eleventy.config.js`, `src/_/includes/framework/shortcodes/responsive-image.liquid`
- **Link:** https://www.11ty.dev/docs/plugins/image/
- **Usage:** Generates responsive images in multiple formats (AVIF, WebP, JPEG) with multiple widths

#### @11ty/eleventy-plugin-syntaxhighlight
- **What:** Syntax highlighting for code blocks
- **Where:** `eleventy.config.js`
- **Link:** https://www.11ty.dev/docs/plugins/syntaxhighlight/
- **Usage:** Adds syntax highlighting to code blocks in markdown

#### @11ty/eleventy-plugin-rss
- **What:** RSS feed generation
- **Where:** `eleventy.config.js`, `src/feed.md`
- **Link:** https://www.11ty.dev/docs/plugins/rss/
- **Usage:** Generates RSS/Atom feeds from collections

### Markdown Processing

#### markdown-it-attrs
- **What:** Markdown attribute extension
- **Where:** `eleventy.config.js`
- **Link:** https://github.com/arve0/markdown-it-attrs
- **Usage:** Allows HTML attributes in markdown (e.g., `{.class-name}`)

### CSS Framework

#### Bootstrap 5
- **What:** CSS framework
- **Where:** `src/_/sass/framework/bootstrap/`
- **Link:** https://getbootstrap.com/
- **Usage:** Grid system, components, utilities throughout the site
- **Customization:** Variables customized in `src/_/sass/framework/bootstrap/_variables.scss`

### Icons

#### Font Awesome 6 Free
- **What:** Icon library
- **Where:** `src/_/sass/framework/libraries/font-awesome/`, `src/assets/fonts/font-awesome/`
- **Link:** https://fontawesome.com/
- **Usage:** Icons used in navigation, buttons, and UI elements

### Utilities

#### npm-run-all
- **What:** Run multiple npm scripts in parallel or sequentially
- **Where:** `package.json` scripts
- **Link:** https://github.com/mysticatea/npm-run-all
- **Usage:** Runs Sass build and Eleventy watch in parallel (`npm run start`)

#### js-yaml
- **What:** YAML parser for JavaScript
- **Where:** `eleventy.config.js`
- **Link:** https://github.com/nodeca/js-yaml
- **Usage:** Parses YAML data files (`.yml` extension)

#### eleventy-xml-plugin
- **What:** XML processing for Eleventy
- **Where:** `eleventy.config.js`, `src/sitemap.liquid`, `src/image-sitemap.liquid`
- **Link:** https://github.com/11ty/eleventy-xml-plugin
- **Usage:** Enables XML template processing for sitemaps

### Development Tools

#### ESLint
- **What:** JavaScript linter
- **Where:** `package.json`, `eslint.config.mjs`
- **Link:** https://eslint.org/
- **Usage:** Code quality and consistency

#### Prettier
- **What:** Code formatter
- **Where:** `package.json`
- **Link:** https://prettier.io/
- **Usage:** Automatic code formatting (configured with lint-staged)

#### lint-staged
- **What:** Run linters on staged files
- **Where:** `package.json`
- **Link:** https://github.com/okonet/lint-staged
- **Usage:** Runs Prettier on staged files before commit

---

## Collections

The site uses Eleventy collections defined in `eleventy.config.js`:

- **`projects`** - Main project landing pages (`src/projects/<slug>.md`)
- **`images`** - Photo essay / image markdown pages in `src/essays/`
- **`about`** - About page content
- **`posts`** - Blog posts (if used)

### Multi-project essays (one essay, several project URLs)

Some essays use **map-style `tags`** (see `src/_/lib/projectTagVariants.mjs`) so the same photograph can appear under more than one project with different titles, permalinks, and body copy (regions delimited by `<!-- project-slug start -->` / `<!-- project-slug end -->`).

Keep the file in the **flat** `src/essays/` folder (`src/essays/my-essay.md`). In front matter add:

```yaml
multiproject: true
tags:
  - "project-slug": "Title for that project view"
  - "other-project": "Other title"
```

(`multiProject: true` is also accepted.) No `pagination` block and no extra data files per essay—you can **rename the `.md` file** whenever you like.

A content **preprocessor** in `eleventy.config.js` injects pagination when `multiproject` is set (only for `src/essays/<name>.md`, not subfolders). It **re-reads that markdown file from disk** each build so `--serve` / watch picks up edits (Eleventy otherwise caches merged global `_data` for the whole run). **`eleventy.config.js`** `eleventyComputed` supplies `permalink`, `title`, `tags`, and `variantContentHtml` per variant.

---

## License

See `src/license.md` for image licensing information.

---

## Credits

**Developed by:** CelticParser

This project uses open-source libraries and frameworks listed in the Open Source Assets section above.

---

## TODO

This section is automatically generated by scanning the codebase for TODO comments.

### `src/_/layouts/image-landscape.liquid`

- **Line 33:** Link subTitle to Tripod Section -->

### `src/_/layouts/image-portrait.liquid`

- **Line 45:** Link subTitle to Tripod Section -->

### `src/essays/beneath-a-cold-moon-haze.md`

- **Line 20:** TODO - Action needed

### `src/essays/cerrode-la-virgin-bajo-la-luna.md`

- **Line 38:** Add some history notes -->

### `src/projects/arid-desert.md`

- **Line 4:** SUbtitle -->


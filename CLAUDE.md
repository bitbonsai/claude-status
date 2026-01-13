# Claude Statusline Project Notes

## GitHub Pages Design

### Design Reference
The page design is based on [miro-mcp-proxy](https://mirowolff.github.io/miro-mcp-proxy/):
- Single-page layout with ambient animated dot pattern background
- Glassmorphic terminal command box with pill shape
- Fixed bottom navigation with blur effect
- Connected step indicators with vertical line
- Collapsible FAQ sections

### Color Scheme: Catppuccin Mocha
The page uses the Catppuccin Mocha palette:

```css
--bg: #1e1e2e              /* Base background */
--bg-elevated: #313244     /* Cards, elevated surfaces */
--text: #cdd6f4            /* Primary text */
--text-muted: #a6adc8      /* Secondary text */
--accent: #89b4fa          /* Blue accent (interactive elements) */
--accent-bright: #b4befe   /* Brighter blue for hover states */
--green: #a6e3a1           /* Success/completion indicator */
--border: #45475a          /* Border color */
```

**Special color overrides:**
- `.subtitle` → `#bac2de`
- `h1` → `#4c5f58` (dark green)
- `h1 .h1-muted` → `#a6e3a1` (light green)
- Dot pattern → `#585b70` at 0.3 opacity
- Alternative box border → `#6c7086`
- Alternative box background → `rgba(49, 50, 68, 0.3)`

### Key Components

#### Terminal Command Box
- Pill-shaped with rounded corners (`border-radius: 62.4375rem`)
- Glassmorphic background: `rgba(49, 50, 68, 0.6)` with backdrop blur
- Circular copy button on the right with hover scale effect
- Syntax-highlighted command text using monospace font
- Click anywhere on box to copy

#### Preview Image
- Positioned between terminal box and "What this does" section
- Uses GitHub user-attachments URL (stable, won't expire)
- Rounded corners with border and shadow

#### Installation Steps
- 4 steps with numbered circles connected by vertical line
- Last step uses checkmark icon instead of number
- Green glow on completion step
- Order: Check prerequisites → Download & install → Backup & configure → Done

#### Hardcore Alternative Section
- Dark gray border and semi-transparent background
- JSON code block with hidden scrollbar
- Copy button positioned top-right inside terminal

#### FAQ Section
- Collapsible `<details>` elements
- Hover state shows accent border on both summary and content
- On hover, removes border between summary and content for unified look
- Mentions `statusline-setup` agent wrapped in `<code>` tags

### Interactive Elements

**Copy buttons:**
- Multiple sync'd copy buttons (navbar, terminal circle, terminal box click)
- All update state together when any is clicked
- 2-second feedback with checkmark icon
- Uses `updateAllCopyButtons()` function

**FAQ hover behavior:**
```css
details[open]:hover summary,
details[open]:hover .faq-content {
    border-color: var(--accent);
}
details[open]:hover summary {
    border-bottom: none;
}
details[open]:hover .faq-content {
    border-top: none;
}
```

### Logo
Simplified design (2 rectangles only):
```svg
<rect x="8" y="24" width="44" height="13" rx="1.66667" fill="#4B5E58"/>
<path d="M8 25.6667C8 24.7462 8.74619 24 9.66667 24H18V37H9.66667C8.74619 37 8 36.2538 8 35.3333V25.6667Z" fill="#93E59A"/>
```

### Important Notes

1. **No top gradient**: The radial gradient glow at the top has been removed (`display: none`)
2. **Dot pattern**: Uses darker dots (#585b70) at reduced opacity (0.3) for subtlety
3. **Scrollbar hiding**: JSON terminal hides scrollbar on all browsers
4. **statusline-setup agent**: Always wrap in `<code>` tags when mentioned
5. **Installation order matters**: Steps describe actual installer flow

### File Structure
- Single `index.html` file with embedded CSS and JavaScript
- No external CSS files
- Uses Google Fonts (Inter family)
- SVG favicon in data URI format

### Future Modifications
- To change colors: Update CSS variables in `:root`
- To add FAQ items: Copy `<details>` structure, maintain styling
- Logo changes: Update all 3 instances (favicon, hero, footer nav)
- Preview image: Use GitHub user-attachments URL for stability

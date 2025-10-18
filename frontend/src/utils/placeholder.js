// Inline placeholder image as base64 data URL
// This creates a simple dark gray placeholder that matches your theme
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#1e293b"/>
  <text x="200" y="150" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="16">No Image</text>
</svg>
`);

export default PLACEHOLDER_IMAGE;
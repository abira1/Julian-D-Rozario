# Hero Section Drag-and-Drop Editor Instructions

## Current Status
✅ **DRAG-AND-DROP MODE ACTIVE**

The hero section is now in **temporary drag-and-drop editing mode**.

## Features

### Live Preview Panel (Left Side)
- Fixed panel on the left side of the screen
- Shows real-time position updates for:
  - Profile image (top, left coordinates)
  - All 5 floating tags (top, left, rotate values)
- Updates instantly as you drag elements
- "Copy All Positions" button to save current layout

### Draggable Elements
1. **Profile Image**: Click and drag the profile picture to reposition
2. **Floating Tags** (5 tags):
   - Business Relations
   - 10+ Years
   - Company Formation
   - Dubai Expert
   - UAE Specialist

### Visual Feedback
- Hover effects on draggable elements
- Border highlights when hovering
- "Drag to Move" indicators
- Smooth transitions between positions

## How to Use

### Step 1: Adjust Positions
1. Open the website in your browser
2. You'll see the live preview panel on the left
3. Click and drag the profile image to adjust its position
4. Click and drag any of the 5 floating tags to adjust their positions
5. Watch the preview panel update in real-time with exact pixel values

### Step 2: Finalize Your Layout
1. Once you're happy with the positioning:
2. Click the **"Copy All Positions"** button in the preview panel
3. Provide the copied positions to the development team

### Step 3: Make Positions Permanent
After you provide the final positions, the development team will:

1. Update the original `HeroSection.js` file with your new positions
2. Remove the drag-and-drop functionality
3. Restore the original hero section with your finalized layout

## Technical Details

### Files Involved
- **Temporary (Active)**: `/app/frontend/src/components/HeroSectionDragEditor.js`
- **Original (Disabled)**: `/app/frontend/src/components/HeroSection.js`
- **Router**: `/app/frontend/src/App.js` (line 6-7)

### To Switch Back to Original (After Finalization)
In `/app/frontend/src/App.js`, change:
```javascript
// FROM:
import HeroSection from "./components/HeroSectionDragEditor";

// TO:
import HeroSection from "./components/HeroSection";
```

Then update the positions in the original HeroSection.js file with the finalized values.

## Position Format

The positions are measured relative to the center of the image container:
- **Top**: Vertical offset from center (negative = up, positive = down)
- **Left**: Horizontal offset from center (negative = left, positive = right)
- **Rotate**: Rotation angle in degrees

Example output:
```json
{
  "image": {
    "top": 0,
    "left": 0
  },
  "tags": [
    { "top": 9, "left": -147, "rotate": -12, "name": "Business Relations" },
    { "top": 57, "left": 340, "rotate": 8, "name": "10+ Years" },
    // ... etc
  ]
}
```

## Notes
- The drag-and-drop functionality is **temporary** and will be removed after finalization
- All original animations and visual effects are preserved
- The live preview panel is only visible in drag-and-drop mode
- Desktop only - tags are hidden on mobile devices

## Support
If you encounter any issues or need adjustments, please contact the development team.

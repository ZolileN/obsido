# Obsido Interiors - Production Website

A premium, professional website for Obsido Interiors featuring:
- **Real-time Cost Estimator** for custom furniture and flooring
- **Interactive 3D Visualizer** for furniture design customization
- **Responsive Design** that works on all devices
- **Modern UI** with elegant animations and smooth interactions

## Project Structure

```
obsido-production/
├── index.html              # Main homepage
├── css/
│   └── styles.css         # All styling (responsive, animations, tools)
├── js/
│   ├── main.js            # Navigation, scroll effects, tab switching
│   ├── estimator.js       # Cost estimator logic and calculations
│   └── visualizer.js      # 3D furniture visualization (Three.js)
├── pages/
│   ├── estimator.html     # Cost estimator page
│   └── visualizer.html    # 3D visualizer page
├── assets/
│   ├── images/            # Product images (add here)
│   └── icons/             # Icon assets (add here)
└── README.md              # This file
```

## Features

### 1. **Homepage** (`index.html`)
- Hero section with animated geometric shapes
- About section with company statistics
- Services showcase (4 main services)
- Process timeline (4-step workflow)
- Contact section with CTA buttons
- Responsive navigation with smooth scrolling

### 2. **Cost Estimator** (`pages/estimator.html`)
- **Furniture Tab:**
  - 6 furniture options with base pricing
  - Quantity selector (1-10 units)
  - Real-time price calculation
  
- **Flooring Tab:**
  - 3 flooring options with per-sq-ft pricing
  - Area slider (100-5000 sq ft)
  - Manual area input field
  
- **Add-ons:**
  - Delivery & Setup (+$500)
  - Professional Installation (+$800)
  - Premium Finishing (+$400)
  - Extended Warranty (+$300)
  
- **Summary:**
  - Real-time price breakdown
  - Tax calculation (10%)
  - Total cost display
  - Quote request submission

### 3. **3D Visualizer** (`pages/visualizer.html`)
- **Interactive 3D Model:**
  - Drag to rotate
  - Scroll to zoom
  - Right-click to pan
  - Auto-rotating view
  
- **Customization Options:**
  - Furniture type (Kitchen, Wardrobe, Shelving)
  - Materials (Oak, Walnut, White, Taupe)
  - Finishes (Matte, Gloss, Natural)
  - Adjustable dimensions (width, depth, height)
  
- **Export Functionality:**
  - Download design as JSON configuration
  - Reset to defaults

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations and gradients
- **Vanilla JavaScript** - No dependencies required
- **Three.js** - 3D visualization and rendering

## Color Palette

```
--obsidian:   #0d0c0b    (Dark background)
--deep:       #181613    (Deep dark)
--surface:    #221f1b    (Surface color)
--panel:      #2a2722    (Panel background)
--gold:       #c9a96e    (Primary accent)
--gold-light: #dfc28a    (Light accent)
--gold-pale:  #f0ddb5    (Pale accent)
--cream:      #f4efe6    (Light text)
--off-white:  #e8e2d8    (Secondary light)
--muted:      #8a8278    (Muted text)
```

## Typography

- **Display Font:** Cormorant Garamond (serif)
- **Body Font:** Jost (sans-serif)

## Getting Started

### Local Development

1. **Extract the files** to your desired location
2. **Open `index.html`** in a web browser
3. **Navigate** using the menu or direct links

### Deployment

1. **Upload all files** to your web server
2. **Maintain the folder structure** (css/, js/, pages/, assets/)
3. **Update links** if deploying to a subdirectory
4. **Test all pages** and interactive features

### Customization

#### Update Company Information
- Edit contact details in `index.html` (email, phone, address)
- Update company name/logo in navigation

#### Modify Pricing
- **Furniture prices:** Edit `furnitureOptions` in `js/estimator.js`
- **Flooring prices:** Edit `flooringOptions` in `js/estimator.js`
- **Add-on prices:** Edit `addOns` in `js/estimator.js`

#### Change Colors
- Edit CSS variables in `css/styles.css` (`:root` section)
- All colors are centralized for easy theming

#### Add Images
- Place images in `assets/images/`
- Reference in HTML using relative paths
- Example: `<img src="assets/images/kitchen.jpg" alt="Kitchen">`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Optimized CSS** with minimal file size
- **Vanilla JavaScript** for fast loading
- **Three.js** for efficient 3D rendering
- **Responsive design** adapts to all screen sizes

## Mobile Responsiveness

- Hamburger menu on screens < 768px
- Stacked layout for tablets and phones
- Touch-friendly controls
- Optimized images and fonts

## Features to Add (Optional)

1. **Backend Integration**
   - Connect estimator to email service
   - Store quote requests in database
   - Admin dashboard for quotes

2. **Enhanced 3D**
   - Pre-made design templates
   - Color picker for custom materials
   - Export as 3D model files

3. **Gallery**
   - Before/after project gallery
   - Filter by service type
   - Lightbox viewer

4. **Blog/Resources**
   - Design tips and inspiration
   - Installation guides
   - Maintenance tips

5. **Analytics**
   - Track user interactions
   - Monitor quote requests
   - Analyze popular options

## Support & Maintenance

- Test all links regularly
- Update pricing as needed
- Monitor form submissions
- Keep contact information current
- Test on multiple devices/browsers

## License

© 2026 Obsido Interiors. All rights reserved.

---

**Last Updated:** March 26, 2026
**Version:** 1.0

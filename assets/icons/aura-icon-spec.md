# Aura VS Code Fork - Icon Specification

## 🎨 Aura Icon Design Guidelines

### **Brand Identity**
- **Primary Color**: Deep Blue (#1e3a8a) - representing AI intelligence
- **Secondary Color**: Electric Blue (#3b82f6) - for accents and highlights  
- **Gradient**: Subtle gradient from deep to electric blue
- **Style**: Modern, minimalist, professional with subtle AI-tech elements

### **Icon Concepts**
1. **Primary Logo**: Stylized "A" with neural network nodes
2. **Alternative**: Abstract brain/circuit hybrid
3. **Symbol**: Geometric "A" with flowing data connections

### **Required Icon Sizes**

#### **Windows (.ico)**
```
16x16    - Taskbar, small icons
20x20    - Small toolbar icons  
24x24    - Small toolbar icons
32x32    - Standard icons
40x40    - Standard icons
48x48    - Large icons
64x64    - Large icons
96x96    - Extra large icons
128x128  - Extra large icons
256x256  - High DPI icons
512x512  - Ultra high DPI
```

#### **macOS (.icns)**
```
16x16    - Finder small
32x32    - Finder medium
64x64    - Finder large
128x128  - Finder extra large
256x256  - Retina display
512x512  - High resolution Retina
1024x1024 - Ultra high resolution
```

#### **Linux (.png)**
```
16x16    - Panel/menu icons
22x22    - Small application icons
24x24    - Small application icons
32x32    - Standard application icons
48x48    - Large application icons  
64x64    - Extra large icons
96x96    - Very large icons
128x128  - Huge icons
256x256  - Ultra large icons
512x512  - Maximum size icons
```

### **SVG Source Template**
```svg
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="auraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a"/>
      <stop offset="100%" style="stop-color:#3b82f6"/>
    </linearGradient>
  </defs>
  
  <!-- Main A Symbol -->
  <path d="M256 50 L200 450 L140 450 L256 50 L372 450 L312 450 Z" fill="url(#auraGradient)"/>
  
  <!-- Neural Network Nodes -->
  <circle cx="180" cy="200" r="8" fill="#3b82f6" opacity="0.8"/>
  <circle cx="280" cy="180" r="8" fill="#3b82f6" opacity="0.8"/>
  <circle cx="320" cy="250" r="8" fill="#3b82f6" opacity="0.8"/>
  
  <!-- Connection Lines -->
  <line x1="180" y1="200" x2="280" y2="180" stroke="#60a5fa" stroke-width="2" opacity="0.6"/>
  <line x1="280" y1="180" x2="320" y2="250" stroke="#60a5fa" stroke-width="2" opacity="0.6"/>
</svg>
```

### **Brand Applications**

#### **Application Icon Usage**
- **Desktop**: Full color with gradient
- **Dark Mode**: Maintain blue gradient with enhanced contrast
- **Light Mode**: Slightly muted gradient for better visibility
- **Monochrome**: Single blue (#1e3a8a) for contexts requiring single color

#### **Marketing Materials**
- **Website**: Full resolution SVG with animations
- **Documentation**: Standard PNG in multiple sizes
- **Presentations**: Vector format for scaling

### **File Organization**
```
assets/icons/
├── source/
│   ├── aura-logo.svg (master vector)
│   ├── aura-logo-light.svg
│   └── aura-logo-dark.svg
├── windows/
│   └── aura.ico (multi-resolution)
├── macos/
│   └── aura.icns (multi-resolution)
├── linux/
│   ├── aura-16.png
│   ├── aura-32.png
│   ├── aura-48.png
│   ├── aura-64.png
│   ├── aura-128.png
│   ├── aura-256.png
│   └── aura-512.png
└── web/
    ├── favicon.ico
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    └── apple-touch-icon.png
```

### **Implementation Notes**
- All icons must maintain visual consistency across sizes
- Ensure legibility at smallest sizes (16x16)
- Test visibility in both light and dark OS themes
- Optimize file sizes while maintaining quality
- Include accessibility considerations for colorblind users

### **Quality Checklist**
- [ ] Crisp edges at all resolutions
- [ ] Consistent brand colors
- [ ] Readable at minimum size (16px)
- [ ] Proper contrast ratios
- [ ] Platform-specific optimizations
- [ ] Accessible color combinations
- [ ] Professional appearance

### **Tools for Creation**
- **Vector Design**: Adobe Illustrator, Figma, or Inkscape
- **Icon Conversion**: IconMaker, ImageMagick
- **Platform Tools**: Xcode (macOS), Visual Studio (Windows)

---

**This specification ensures the Aura brand maintains visual consistency and professional quality across all platforms and contexts.** 
# G3DAI Universal Design System 2.0
*Premium AI Platform Ecosystem - Universal & Platform-Specific Guidelines*

---

## **Table of Contents**
1. [Universal Design Philosophy](#universal-design-philosophy)
2. [Core Design System](#core-design-system)
3. [Platform-Specific Brand Systems](#platform-specific-brand-systems)
4. [Technical Implementation](#technical-implementation)
5. [Accessibility & Standards](#accessibility--standards)

---

## **Universal Design Philosophy**

### **The G3DAI Design DNA**
Our design system embodies **"Intelligent Precision"** - where cutting-edge AI technology meets scientific rigor, enterprise reliability, and human-centered design.

**Core Design Principles:**
- **Precision Intelligence**: Every element reflects accuracy, reliability, and smart functionality
- **Scientific Authority**: Visual language that conveys expertise, research, and innovation
- **Enterprise Trust**: Professional aesthetics that inspire confidence in mission-critical applications
- **Human-Centered AI**: Technology that feels approachable, not intimidating
- **Future-Forward**: Aesthetic that positions us at the forefront of AI innovation

**Visual Metaphors Across All Platforms:**
- **Neural Networks**: Interconnected nodes, synaptic connections, learning pathways
- **Scientific Precision**: Laboratory equipment, measurement tools, molecular structures
- **Quantum Computing**: Particle effects, wave functions, probability clouds
- **Medical Imaging**: Clean interfaces, diagnostic accuracy, clinical workflow
- **Enterprise Systems**: Robust architecture, scalable design, institutional quality

---

## **Core Design System**

### **Universal Color Foundation**

#### **Primary Brand Colors**
```css
/* G3DAI Core Brand Blue */
--g3d-primary-50: #f0f9ff   /* Ultra light backgrounds */
--g3d-primary-100: #e0f2fe  /* Subtle interface tints */
--g3d-primary-200: #bae6fd  /* Hover states, borders */
--g3d-primary-300: #7dd3fc  /* Active elements */
--g3d-primary-400: #38bdf8  /* Interactive components */
--g3d-primary-500: #0ea5e9  /* Primary brand color */
--g3d-primary-600: #0284c7  /* Strong brand presence */
--g3d-primary-700: #0369a1  /* Authority, navigation */
--g3d-primary-800: #075985  /* Enterprise dark */
--g3d-primary-900: #0c4a6e  /* Maximum authority */
```

#### **Universal Semantic Colors**
```css
/* Success System */
--g3d-success-light: #d1fae5
--g3d-success: #10b981
--g3d-success-dark: #047857

/* Warning System */
--g3d-warning-light: #fef3c7
--g3d-warning: #f59e0b
--g3d-warning-dark: #d97706

/* Error System */
--g3d-error-light: #fee2e2
--g3d-error: #ef4444
--g3d-error-dark: #dc2626

/* Neutral System */
--g3d-gray-50: #f9fafb
--g3d-gray-100: #f3f4f6
--g3d-gray-200: #e5e7eb
--g3d-gray-300: #d1d5db
--g3d-gray-400: #9ca3af
--g3d-gray-500: #6b7280
--g3d-gray-600: #4b5563
--g3d-gray-700: #374151
--g3d-gray-800: #1f2937
--g3d-gray-900: #111827
```

### **Universal Typography System**

#### **Font Stack**
```css
/* Primary Interface Font */
--font-primary: 'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Secondary/Display Font */
--font-display: 'Geist', --font-primary;

/* Monospace/Technical Font */
--font-mono: 'Geist Mono', 'SF Mono', Consolas, monospace;
```

#### **Typography Scale**
```css
/* Display Typography */
--text-9xl: 8rem      /* 128px - Hero displays */
--text-8xl: 6rem      /* 96px - Major heroes */
--text-7xl: 4.5rem    /* 72px - Platform heroes */
--text-6xl: 3.75rem   /* 60px - Section heroes */

/* Header Typography */
--text-5xl: 3rem      /* 48px - Main page titles */
--text-4xl: 2.25rem   /* 36px - Section headers */
--text-3xl: 1.875rem  /* 30px - Card titles */
--text-2xl: 1.5rem    /* 24px - Subheadings */
--text-xl: 1.25rem    /* 20px - Large text */

/* Body Typography */
--text-lg: 1.125rem   /* 18px - Large body */
--text-base: 1rem     /* 16px - Standard body */
--text-sm: 0.875rem   /* 14px - Small text */
--text-xs: 0.75rem    /* 12px - Captions */
```

### **Universal Glassmorphism System**

#### **Core Glass Effects**
```css
/* Standard Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 
    0 12px 48px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* Premium Glass */
.glass-premium {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-premium:hover {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15) 0%, 
    rgba(255, 255, 255, 0.08) 100%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}

/* Subtle Glass */
.glass-subtle {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-subtle:hover {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Ultra Glass - For Hero Sections */
.glass-ultra {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.12) 0%, 
    rgba(255, 255, 255, 0.03) 50%,
    rgba(255, 255, 255, 0.08) 100%);
  backdrop-filter: blur(32px) saturate(250%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 24px 80px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 24px;
}

/* Glass Navigation */
.glass-nav {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(28px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

/* Glass Modal */
.glass-modal {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 32px 100px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

/* Glass Sidebar */
.glass-sidebar {
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.08) 0%, 
    rgba(255, 255, 255, 0.04) 100%);
  backdrop-filter: blur(24px) saturate(180%);
  border-right: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 8px 0 32px rgba(0, 0, 0, 0.1);
}

/* Glass Button */
.glass-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* Glass Input */
.glass-input {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.3);
  box-shadow: 
    inset 0 2px 8px rgba(0, 0, 0, 0.05),
    0 0 0 3px rgba(14, 165, 233, 0.1);
}

/* Glass Tooltip */
.glass-tooltip {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

/* Glass Dropdown */
.glass-dropdown {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border-radius: 12px;
}

/* Glass Table */
.glass-table {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.glass-table-header {
  background: rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-table-row:hover {
  background: rgba(255, 255, 255, 0.06);
}

/* Glass Progress Bar */
.glass-progress {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  overflow: hidden;
}

.glass-progress-fill {
  background: linear-gradient(90deg, 
    rgba(14, 165, 233, 0.8) 0%, 
    rgba(14, 165, 233, 1) 100%);
  backdrop-filter: blur(8px);
  box-shadow: 0 0 16px rgba(14, 165, 233, 0.4);
}
```

#### **Dark Mode Glass Effects**
```css
/* Dark Mode Glass Variants */
@media (prefers-color-scheme: dark) {
  .glass-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .glass-premium {
    background: linear-gradient(135deg, 
      rgba(0, 0, 0, 0.3) 0%, 
      rgba(0, 0, 0, 0.15) 100%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .glass-subtle {
    background: rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
}
```

#### **Accessibility Glass Effects**
```css
/* High Contrast Mode */
@media (prefers-contrast: high) {
  .glass-card,
  .glass-premium,
  .glass-subtle {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(8px);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .glass-card,
  .glass-premium,
  .glass-subtle,
  .glass-btn,
  .glass-input {
    transition: none;
  }
}
```

### **Universal Animation System**

#### **Timing Functions**
```css
/* Standard Easings */
--ease-out-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in-smooth: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Durations */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 700ms;
```

#### **Key Animation Patterns**
```css
/* Hover Lift Effect */
.hover-lift {
  transition: transform var(--duration-normal) var(--ease-out-smooth);
}
.hover-lift:hover {
  transform: translateY(-4px);
}

/* Scale Effect */
.hover-scale {
  transition: transform var(--duration-fast) var(--ease-out-smooth);
}
.hover-scale:hover {
  transform: scale(1.02);
}

/* Glow Effect */
.hover-glow {
  transition: box-shadow var(--duration-normal) var(--ease-out-smooth);
}
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(14, 165, 233, 0.3);
}
```

---

## **Platform-Specific Brand Systems**

### **1. AnnotateAI - Computer Vision Data Labeling**

#### **Brand Identity**
- **Primary Color**: Indigo (#6366f1) - Creativity, precision, visual intelligence
- **Secondary Color**: Purple (#8b5cf6) - AI processing, machine learning
- **Accent Color**: Cyan (#06b6d4) - Annotation tools, precision markers

#### **AnnotateAI Color Palette**
```css
/* AnnotateAI Primary Colors */
--annotate-primary-50: #eef2ff
--annotate-primary-100: #e0e7ff
--annotate-primary-200: #c7d2fe
--annotate-primary-300: #a5b4fc
--annotate-primary-400: #818cf8
--annotate-primary-500: #6366f1   /* Primary brand */
--annotate-primary-600: #4f46e5
--annotate-primary-700: #4338ca
--annotate-primary-800: #3730a3
--annotate-primary-900: #312e81

/* AnnotateAI Accent System */
--annotate-accent-purple: #8b5cf6  /* AI processing */
--annotate-accent-cyan: #06b6d4    /* Precision tools */
--annotate-accent-green: #10b981   /* Completed annotations */
--annotate-accent-orange: #f59e0b  /* Active annotations */
```

#### **AnnotateAI Typography**
```css
/* Display font for creative emphasis */
--annotate-font-display: 'Geist', var(--font-primary);
--annotate-font-weight-hero: 700;
--annotate-font-weight-heading: 600;
--annotate-font-weight-body: 400;
```

#### **AnnotateAI Glass Effects**
```css
/* Primary AnnotateAI Glass */
.annotate-glass {
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.08) 0%, 
    rgba(139, 92, 246, 0.05) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(99, 102, 241, 0.15);
  box-shadow: 
    0 8px 32px rgba(99, 102, 241, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.annotate-glass:hover {
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.12) 0%, 
    rgba(139, 92, 246, 0.08) 100%);
  border: 1px solid rgba(99, 102, 241, 0.25);
  box-shadow: 
    0 12px 48px rgba(99, 102, 241, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* Annotation Tool Glass */
.annotate-tool-glass {
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  backdrop-filter: blur(16px) saturate(180%);
  border-radius: 12px;
  box-shadow: 
    0 4px 16px rgba(6, 182, 212, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.annotate-tool-glass:hover {
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.3);
  box-shadow: 
    0 8px 24px rgba(6, 182, 212, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Annotation Workspace Glass */
.annotate-workspace-glass {
  background: rgba(99, 102, 241, 0.02);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(99, 102, 241, 0.08);
  border-radius: 8px;
}

/* AI Processing Glass */
.annotate-ai-glass {
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.1) 0%, 
    rgba(99, 102, 241, 0.06) 100%);
  backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(139, 92, 246, 0.2);
  box-shadow: 
    0 12px 40px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

/* Annotation Status Glass */
.annotate-status-complete {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  backdrop-filter: blur(16px);
}

.annotate-status-active {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  backdrop-filter: blur(16px);
}
```

---

### **2. MedSight Pro - Medical Imaging AI**

#### **Brand Identity**
- **Primary Color**: Medical Blue (#0ea5e9) - Trust, healthcare, precision
- **Secondary Color**: Medical Green (#10b981) - Health, safety, positive outcomes
- **Accent Color**: Medical Gold (#f59e0b) - Premium, accuracy, clinical excellence

#### **MedSight Pro Color Palette**
```css
/* MedSight Medical Colors */
--medsight-primary-50: #f0f9ff
--medsight-primary-100: #e0f2fe
--medsight-primary-200: #bae6fd
--medsight-primary-300: #7dd3fc
--medsight-primary-400: #38bdf8
--medsight-primary-500: #0ea5e9   /* Primary medical blue */
--medsight-primary-600: #0284c7
--medsight-primary-700: #0369a1
--medsight-primary-800: #075985
--medsight-primary-900: #0c4a6e

/* Medical Status Colors */
--medsight-normal: #10b981      /* Normal findings */
--medsight-abnormal: #ef4444    /* Abnormal findings */
--medsight-pending: #f59e0b     /* Pending review */
--medsight-critical: #dc2626    /* Critical findings */
--medsight-reviewed: #3b82f6    /* Reviewed status */

/* AI Confidence Indicators */
--medsight-ai-high: #059669     /* 90%+ confidence */
--medsight-ai-medium: #d97706   /* 70-90% confidence */
--medsight-ai-low: #dc2626      /* <70% confidence */
```

#### **MedSight Pro Typography**
```css
/* Medical-grade readability */
--medsight-font-primary: var(--font-primary);
--medsight-line-height: 1.6;    /* Enhanced readability */
--medsight-letter-spacing: 0.01em;

/* Clinical text sizes */
--medsight-text-patient: 1.125rem;   /* Patient information */
--medsight-text-findings: 1rem;      /* Medical findings */
--medsight-text-metadata: 0.875rem;  /* DICOM metadata */
--medsight-text-ai: 0.8125rem;       /* AI metrics */
```

#### **MedSight Pro Glass Effects**
```css
/* Primary MedSight Glass */
.medsight-glass {
  background: linear-gradient(135deg, 
    rgba(14, 165, 233, 0.06) 0%, 
    rgba(16, 185, 129, 0.04) 100%);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(14, 165, 233, 0.12);
  box-shadow: 
    0 8px 32px rgba(14, 165, 233, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.medsight-glass:hover {
  background: linear-gradient(135deg, 
    rgba(14, 165, 233, 0.1) 0%, 
    rgba(16, 185, 129, 0.06) 100%);
  border: 1px solid rgba(14, 165, 233, 0.2);
  box-shadow: 
    0 12px 48px rgba(14, 165, 233, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* Medical Viewer Glass */
.medsight-viewer-glass {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 12px;
  box-shadow: 
    0 16px 64px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(14, 165, 233, 0.1);
}

/* Medical Control Panel Glass */
.medsight-control-glass {
  background: rgba(14, 165, 233, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(14, 165, 233, 0.15);
  border-radius: 12px;
  box-shadow: 
    0 8px 32px rgba(14, 165, 233, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* AI Diagnostic Glass */
.medsight-ai-glass {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.08) 0%, 
    rgba(14, 165, 233, 0.04) 100%);
  backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: 
    0 12px 40px rgba(16, 185, 129, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

/* Medical Status Glass Effects */
.medsight-status-normal {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  backdrop-filter: blur(16px);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.1);
}

.medsight-status-abnormal {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  backdrop-filter: blur(16px);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.1);
}

.medsight-status-critical {
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  backdrop-filter: blur(16px);
  border-radius: 8px;
  box-shadow: 
    0 4px 16px rgba(220, 38, 38, 0.2),
    0 0 20px rgba(220, 38, 38, 0.1);
}

.medsight-status-pending {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  backdrop-filter: blur(16px);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.1);
}

/* AI Confidence Glass */
.medsight-confidence-high {
  background: rgba(5, 150, 105, 0.1);
  border: 1px solid rgba(5, 150, 105, 0.2);
  backdrop-filter: blur(16px);
}

.medsight-confidence-medium {
  background: rgba(217, 119, 6, 0.1);
  border: 1px solid rgba(217, 119, 6, 0.2);
  backdrop-filter: blur(16px);
}

.medsight-confidence-low {
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
  backdrop-filter: blur(16px);
}

/* Medical Image Overlay Glass */
.medsight-overlay-glass {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(14, 165, 233, 0.3);
  border-radius: 8px;
}

/* DICOM Info Glass */
.medsight-dicom-glass {
  background: rgba(14, 165, 233, 0.04);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(14, 165, 233, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.05);
}
```

---

### **3. aura - AI Development Platform**

#### **Brand Identity**
- **Primary Color**: Developer Green (#22c55e) - Growth, development, success
- **Secondary Color**: Code Purple (#a855f7) - Creativity, problem-solving
- **Accent Color**: Terminal Orange (#f97316) - Energy, action, automation

#### **aura Color Palette**
```css
/* aura Developer Colors */
--aura-primary-50: #f0fdf4
--aura-primary-100: #dcfce7
--aura-primary-200: #bbf7d0
--aura-primary-300: #86efac
--aura-primary-400: #4ade80
--aura-primary-500: #22c55e   /* Primary developer green */
--aura-primary-600: #16a34a
--aura-primary-700: #15803d
--aura-primary-800: #166534
--aura-primary-900: #14532d

/* Code Status Colors */
--aura-success: #22c55e      /* Successful builds */
--aura-error: #ef4444        /* Build errors */
--aura-warning: #f59e0b      /* Warnings */
--aura-info: #3b82f6         /* Information */
--aura-purple: #a855f7       /* AI suggestions */
--aura-orange: #f97316       /* Active processes */
```

---

### **4. Creative Studio - Generative AI**

#### **Brand Identity**
- **Primary Color**: Creative Purple (#8b5cf6) - Creativity, imagination, innovation
- **Secondary Color**: Art Pink (#ec4899) - Artistic expression, creativity
- **Accent Color**: Inspiration Yellow (#eab308) - Ideas, inspiration, brightness

#### **Creative Studio Color Palette**
```css
/* Creative Studio Colors */
--creative-primary-50: #faf5ff
--creative-primary-100: #f3e8ff
--creative-primary-200: #e9d5ff
--creative-primary-300: #d8b4fe
--creative-primary-400: #c084fc
--creative-primary-500: #8b5cf6   /* Primary creative purple */
--creative-primary-600: #7c3aed
--creative-primary-700: #6d28d9
--creative-primary-800: #5b21b6
--creative-primary-900: #4c1d95

/* Creative Accent System */
--creative-pink: #ec4899          /* Artistic expression */
--creative-yellow: #eab308        /* Inspiration */
--creative-cyan: #06b6d4          /* Digital art */
--creative-emerald: #10b981       /* Generated content */
```

#### **aura Glass Effects**
```css
/* Primary aura Glass */
.aura-glass {
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.08) 0%, 
    rgba(168, 85, 247, 0.05) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(34, 197, 94, 0.15);
  box-shadow: 
    0 8px 32px rgba(34, 197, 94, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Code Editor Glass */
.aura-editor-glass {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px) saturate(120%);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 12px;
  box-shadow: 
    0 16px 64px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(34, 197, 94, 0.1);
}

/* AI Suggestion Glass */
.aura-ai-glass {
  background: rgba(168, 85, 247, 0.1);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.1);
}

/* Build Status Glass */
.aura-status-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  backdrop-filter: blur(16px);
}

.aura-status-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  backdrop-filter: blur(16px);
}

.aura-status-warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  backdrop-filter: blur(16px);
}
```

#### **Creative Studio Glass Effects**
```css
/* Primary Creative Glass */
.creative-glass {
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.08) 0%, 
    rgba(236, 72, 153, 0.05) 100%);
  backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(139, 92, 246, 0.15);
  box-shadow: 
    0 12px 40px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Creative Canvas Glass */
.creative-canvas-glass {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 16px;
}

/* Generation Progress Glass */
.creative-progress-glass {
  background: linear-gradient(135deg, 
    rgba(234, 179, 8, 0.1) 0%, 
    rgba(139, 92, 246, 0.08) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(234, 179, 8, 0.2);
  border-radius: 12px;
}

/* Creative Tool Glass */
.creative-tool-glass {
  background: rgba(236, 72, 153, 0.1);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 10px;
}
```

---

### **5. DataForge - Data Processing**

#### **Brand Identity**
- **Primary Color**: Data Blue (#3b82f6) - Intelligence, analysis, insight
- **Secondary Color**: Steel Gray (#6b7280) - Industrial strength, reliability
- **Accent Color**: Insight Orange (#f97316) - Discovery, breakthrough, analysis

#### **DataForge Glass Effects**
```css
/* Primary DataForge Glass */
.dataforge-glass {
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.08) 0%, 
    rgba(107, 114, 128, 0.04) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(59, 130, 246, 0.15);
  box-shadow: 
    0 8px 32px rgba(59, 130, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

/* Data Pipeline Glass */
.dataforge-pipeline-glass {
  background: rgba(107, 114, 128, 0.08);
  backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(107, 114, 128, 0.15);
  border-radius: 12px;
}

/* Analytics Glass */
.dataforge-analytics-glass {
  background: linear-gradient(135deg, 
    rgba(249, 115, 22, 0.08) 0%, 
    rgba(59, 130, 246, 0.05) 100%);
  backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: 16px;
}
```

---

### **6. SecureAI - Security Platform**

#### **Brand Identity**
- **Primary Color**: Security Red (#dc2626) - Protection, vigilance, security
- **Secondary Color**: Shield Blue (#1e40af) - Trust, defense, reliability
- **Accent Color**: Alert Orange (#f59e0b) - Warning, attention, monitoring

#### **SecureAI Glass Effects**
```css
/* Primary SecureAI Glass */
.secureai-glass {
  background: linear-gradient(135deg, 
    rgba(220, 38, 38, 0.08) 0%, 
    rgba(30, 64, 175, 0.05) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(220, 38, 38, 0.15);
  box-shadow: 
    0 8px 32px rgba(220, 38, 38, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

/* Security Alert Glass */
.secureai-alert-glass {
  background: rgba(245, 158, 11, 0.1);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 8px;
  box-shadow: 
    0 4px 16px rgba(245, 158, 11, 0.2),
    0 0 20px rgba(245, 158, 11, 0.1);
}

/* Threat Detection Glass */
.secureai-threat-glass {
  background: rgba(220, 38, 38, 0.1);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.15);
}

/* Security Shield Glass */
.secureai-shield-glass {
  background: rgba(30, 64, 175, 0.1);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(30, 64, 175, 0.2);
  border-radius: 12px;
}
```

---

## **Glassmorphism Implementation Guidelines**

### **Design Principles for G3DAI Glass Effects**

#### **1. Hierarchy & Layering**
```css
/* Layer Z-Index System */
.glass-layer-background { z-index: 1; }     /* Background elements */
.glass-layer-content { z-index: 10; }       /* Main content cards */
.glass-layer-interactive { z-index: 20; }   /* Buttons, inputs */
.glass-layer-navigation { z-index: 30; }    /* Navigation bars */
.glass-layer-modal { z-index: 40; }         /* Modals, dropdowns */
.glass-layer-tooltip { z-index: 50; }       /* Tooltips, alerts */
```

#### **2. Contextual Usage Guidelines**

**Primary Glass (.glass-card)** - Use for:
- Main content cards
- Dashboard panels
- Feature sections
- Primary interactive elements

**Premium Glass (.glass-premium)** - Use for:
- Hero sections
- Important CTAs
- Premium features
- High-value content

**Subtle Glass (.glass-subtle)** - Use for:
- Secondary information
- Background elements
- Inactive states
- Supporting content

**Ultra Glass (.glass-ultra)** - Use for:
- Landing page heroes
- Major announcements
- Platform showcases
- Critical focal points

#### **3. Platform-Specific Implementation**

**AnnotateAI Implementation:**
```css
/* Main annotation interface */
.annotation-workspace {
  @apply annotate-workspace-glass;
}

/* Annotation tools panel */
.annotation-tools {
  @apply annotate-tool-glass;
}

/* AI processing indicators */
.ai-processing {
  @apply annotate-ai-glass;
}

/* Status indicators */
.annotation-complete {
  @apply annotate-status-complete;
}
```

**MedSight Pro Implementation:**
```css
/* Medical image viewer */
.medical-viewer {
  @apply medsight-viewer-glass;
}

/* Diagnostic panels */
.diagnostic-panel {
  @apply medsight-glass;
}

/* AI confidence indicators */
.ai-confidence-high {
  @apply medsight-confidence-high;
}

/* Critical alerts */
.critical-finding {
  @apply medsight-status-critical;
}
```

#### **4. Best Practices**

**DO:**
- Use glass effects consistently within each platform
- Maintain proper contrast ratios (WCAG AA minimum)
- Layer glass elements with appropriate z-index
- Test on different backgrounds and lighting conditions
- Use platform-specific colors for glass tinting

**DON'T:**
- Overuse glass effects (maximum 3-4 layers visible)
- Use glass on elements that need high contrast
- Mix different platform glass styles on same page
- Forget hover states and interactions
- Ignore accessibility considerations

#### **5. Performance Optimization**

```css
/* Optimize backdrop-filter performance */
.glass-optimized {
  will-change: backdrop-filter;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Use CSS containment */
.glass-container {
  contain: layout style paint;
}

/* Conditional loading for complex effects */
@media (prefers-reduced-motion: reduce) {
  .glass-effect {
    backdrop-filter: none;
    background: rgba(255, 255, 255, 0.1);
  }
}
```

#### **6. Browser Compatibility**

```css
/* Progressive enhancement */
.glass-fallback {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Feature detection */
@supports (backdrop-filter: blur(10px)) {
  .glass-fallback {
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.05);
  }
}

/* Webkit prefix for older browsers */
@supports (-webkit-backdrop-filter: blur(10px)) {
  .glass-fallback {
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
  }
}
```

#### **7. Responsive Glass Design**

```css
/* Mobile-first glass effects */
@media (max-width: 768px) {
  .glass-card {
    backdrop-filter: blur(12px);
    border-radius: 12px;
  }
  
  .glass-premium {
    backdrop-filter: blur(16px);
    border-radius: 16px;
  }
}

/* Desktop enhancements */
@media (min-width: 1024px) {
  .glass-card {
    backdrop-filter: blur(20px) saturate(180%);
    border-radius: 16px;
  }
  
  .glass-premium {
    backdrop-filter: blur(24px) saturate(200%);
    border-radius: 20px;
  }
}
```

#### **8. Animation Guidelines**

```css
/* Smooth glass transitions */
.glass-animated {
  transition: 
    backdrop-filter 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover animations */
.glass-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-hover:hover {
  transform: translateY(-2px);
  backdrop-filter: blur(24px) saturate(200%);
}
```

#### **9. Testing Checklist**

**Visual Testing:**
- [ ] Glass effects visible on light backgrounds
- [ ] Glass effects visible on dark backgrounds
- [ ] Glass effects visible on image backgrounds
- [ ] Proper contrast ratios maintained
- [ ] No performance issues with multiple layers

**Accessibility Testing:**
- [ ] High contrast mode compatibility
- [ ] Reduced motion preferences respected
- [ ] Focus indicators clearly visible
- [ ] Screen reader compatibility maintained

**Performance Testing:**
- [ ] 60fps maintained during animations
- [ ] No memory leaks with backdrop-filter
- [ ] Graceful degradation on unsupported browsers
- [ ] Mobile performance optimized

---

## **Component Architecture**

### **Universal Button System**

#### **Button Variants**
```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, var(--g3d-primary-500) 0%, var(--g3d-primary-600) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all var(--duration-normal) var(--ease-out-smooth);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(14, 165, 233, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: var(--g3d-primary-500);
  border: 1px solid rgba(14, 165, 233, 0.2);
  backdrop-filter: blur(16px);
}

/* Platform-Specific Buttons */
.btn-annotate {
  background: linear-gradient(135deg, var(--annotate-primary-500) 0%, var(--annotate-primary-600) 100%);
}

.btn-medsight {
  background: linear-gradient(135deg, var(--medsight-primary-500) 0%, var(--medsight-primary-600) 100%);
}
```

### **Universal Card System**

```css
/* Standard Card */
.card {
  background: var(--glass-card);
  border-radius: 16px;
  padding: 24px;
  transition: all var(--duration-normal) var(--ease-out-smooth);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Metric Card */
.card-metric {
  text-align: center;
  padding: 32px 24px;
}

.card-metric .metric-value {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--g3d-primary-500);
  margin-bottom: 8px;
}

.card-metric .metric-label {
  font-size: var(--text-sm);
  color: var(--g3d-gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### **Navigation System**

```css
/* Universal Navigation */
.nav-glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-item {
  padding: 12px 20px;
  border-radius: 8px;
  transition: all var(--duration-fast) var(--ease-out-smooth);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-item.active {
  background: var(--g3d-primary-500);
  color: white;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}
```

---

## **Hero Section Patterns**

### **Universal Hero Structure**

```css
/* Hero Container */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Background Layers */
.hero-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--g3d-primary-900) 0%, var(--g3d-primary-700) 100%);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
}

/* Content */
.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 800px;
  padding: 0 24px;
}

.hero-title {
  font-size: var(--text-7xl);
  font-weight: 700;
  color: white;
  margin-bottom: 24px;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: var(--text-xl);
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  line-height: 1.6;
}
```

### **Platform-Specific Heroes**

```css
/* AnnotateAI Hero */
.hero-annotate {
  background: linear-gradient(135deg, 
    var(--annotate-primary-900) 0%, 
    var(--annotate-primary-700) 50%,
    var(--annotate-accent-purple) 100%);
}

/* MedSight Pro Hero */
.hero-medsight {
  background: linear-gradient(135deg, 
    var(--medsight-primary-900) 0%, 
    var(--medsight-primary-700) 100%);
}

/* Add floating particles for medical precision */
.hero-medsight::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 25% 25%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
}
```

---

## **Responsive Design System**

### **Breakpoint Strategy**
```css
/* Mobile-First Breakpoints */
--breakpoint-xs: 475px;   /* Large phones */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Medium tablets */
--breakpoint-lg: 1024px;  /* Small laptops */
--breakpoint-xl: 1280px;  /* Large laptops */
--breakpoint-2xl: 1536px; /* Desktop */
--breakpoint-3xl: 1920px; /* Large desktop */
```

### **Responsive Typography**
```css
/* Fluid Typography */
.text-responsive-hero {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
}

.text-responsive-title {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
}

.text-responsive-body {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
}
```

---

## **Technical Implementation**

### **CSS Custom Properties Structure**
```css
:root {
  /* Universal Colors */
  --g3d-primary-50: #f0f9ff;
  /* ... rest of universal colors ... */
  
  /* Universal Typography */
  --font-primary: 'Inter Variable', sans-serif;
  /* ... rest of typography ... */
  
  /* Universal Spacing */
  --space-px: 1px;
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  --space-32: 8rem;
  --space-40: 10rem;
  --space-48: 12rem;
  --space-56: 14rem;
  --space-64: 16rem;
}

/* Platform-Specific Overrides */
[data-platform="annotate"] {
  --platform-primary: var(--annotate-primary-500);
  --platform-secondary: var(--annotate-accent-purple);
  --platform-accent: var(--annotate-accent-cyan);
}

[data-platform="medsight"] {
  --platform-primary: var(--medsight-primary-500);
  --platform-secondary: var(--medsight-normal);
  --platform-accent: var(--medsight-pending);
}
```

### **Component Class Structure**
```css
/* BEM-style naming with platform prefixes */
.g3d-button { /* Universal styles */ }
.g3d-button--primary { /* Primary variant */ }
.g3d-button--annotate { /* AnnotateAI specific */ }
.g3d-button--medsight { /* MedSight Pro specific */ }

.g3d-card { /* Universal card */ }
.g3d-card__header { /* Card header */ }
.g3d-card__content { /* Card content */ }
.g3d-card--glass { /* Glass variant */ }
.g3d-card--platform { /* Platform-specific */ }
```

---

## **Accessibility & Standards**

### **Color Contrast Requirements**
- **WCAG AAA**: Contrast ratio ≥ 7:1 for normal text
- **WCAG AA**: Contrast ratio ≥ 4.5:1 for normal text
- **Large Text**: Contrast ratio ≥ 3:1 for 18pt+ text

### **Focus Management**
```css
/* Universal Focus Ring */
.focus-ring {
  outline: 2px solid var(--g3d-primary-500);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Platform-Specific Focus */
[data-platform="annotate"] .focus-ring {
  outline-color: var(--annotate-primary-500);
}

[data-platform="medsight"] .focus-ring {
  outline-color: var(--medsight-primary-500);
}
```

### **Reduced Motion Support**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### **High Contrast Mode**
```css
@media (prefers-contrast: high) {
  .glass-card {
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.3);
  }
  
  .btn-primary {
    border: 2px solid white;
  }
}
```

---

## **Performance Considerations**

### **CSS Optimization**
- Use CSS custom properties for theming
- Minimize specificity conflicts
- Leverage CSS containment for components
- Use `will-change` for animations

### **Loading Strategy**
- Critical CSS inline for above-the-fold content
- Progressive enhancement for advanced effects
- Lazy load non-critical animations
- Preload key fonts

### **Browser Support Strategy**
- **Tier 1**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Tier 2**: Graceful degradation for older browsers
- **Fallbacks**: Standard colors/effects for unsupported features

---

This comprehensive design system provides both **universal consistency** across all G3DAI platforms while allowing for **platform-specific brand expression** that reflects each product's unique purpose and user needs. The system scales from individual components to entire product ecosystems while maintaining the premium, scientific, and authoritative aesthetic that defines the G3DAI brand. 
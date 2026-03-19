# Mentra Agent - Modern Design System v2

## 📋 Overview

Desain baru untuk halaman Agent dengan fokus pada **clean, modern, dan typography yang excellent**. Menggunakan design system yang comprehensif dengan:

- **Semantic Color Palette** - Warna yang konsisten dan bermakna
- **Typography Scale** - Hierarki teks yang jelas dan profesional
- **Spacing System** - Grid 8px base untuk konsistensi
- **Components** - UI components yang reusable dan accessible

---

## 🎨 Color Palette

### Primary Colors (Indigo - Brand)
```css
Primary 50:   #f0f4ff   /* Lightest - Backgrounds */
Primary 100:  #e0e9ff   /* Light backgrounds */
Primary 500:  #5865f2   /* Main brand color */
Primary 600:  #4752c4   /* Hover state */
Primary 700:  #3d4696   /* Active state */
Primary 900:  #1a1f3a   /* Darkest */
```

### Accent Colors (Teal - Highlights)
```css
Accent 500:   #14b8a6   /* Main accent */
Accent 600:   #0d9488   /* Hover */
```

### Semantic Colors
```css
Success:      #16a34a   /* Green - untuk confirmasi */
Warning:      #f59e0b   /* Amber - untuk peringatan */
Error:        #ef4444   /* Red - untuk error */
```

### Neutral Colors (Grays)
```css
Neutral 0:    #ffffff   /* White */
Neutral 50:   #fafafa   /* Lightest gray */
Neutral 100:  #f5f5f5   /* Very light */
Neutral 200:  #e5e5e5   /* Light */
Neutral 300:  #d4d4d4   /* Medium-light */
Neutral 500:  #737373   /* Medium */
Neutral 800:  #262626   /* Dark */
Neutral 900:  #171717   /* Darkest */
```

---

## 📝 Typography

### Font Families
```
Display/Body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Mono:         'Fira Code', 'Monaco', monospace
```

### Type Scale

#### Display (Major Headings)
```css
Display LG:  60px / 700 fw / -0.02em ls
Display MD:  48px / 700 fw / -0.01em ls
Display SM:  36px / 700 fw / -0.005em ls
```

#### Heading (Section Titles)
```css
Heading LG:  30px / 600 fw / -0.005em ls
Heading MD:  24px / 600 fw
Heading SM:  20px / 600 fw
Heading XS:  18px / 600 fw
```

#### Body (Main Content)
```css
Body LG:     18px / 400 fw / 1.6 lh
Body MD:     16px / 400 fw / 1.6 lh
Body SM:     14px / 400 fw / 1.5 lh
Body XS:     12px / 400 fw / 1.5 lh
```

#### Caption (Labels & Small Text)
```css
Caption MD:  14px / 500 fw / 1.4 lh
Caption SM:  12px / 500 fw / 1.4 lh
```

### Font Weights
```
Light:       300
Normal:      400
Medium:      500
Semibold:    600
Bold:        700
```

---

## 📏 Spacing System (8px base)

```css
xs:   0.25rem  (4px)
sm:   0.5rem   (8px)
md:   1rem     (16px)
lg:   1.5rem   (24px)
xl:   2rem     (32px)
2xl:  2.5rem   (40px)
3xl:  3rem     (48px)
4xl:  4rem     (64px)
```

**Penggunaan:**
- Padding antar elemen: `lg`, `xl`
- Gap antara komponen: `md`, `lg`
- Internal padding dalam bubble: `md`, `lg`
- Border gap: `sm`, `md`

---

## 🔲 Border Radius

```css
sm:     0.375rem  (6px)    /* Subtle buttons */
md:     0.5rem    (8px)    /* Standard radius */
lg:     0.75rem   (12px)   /* Main buttons */
xl:     1rem      (16px)   /* Chat bubbles, large elements */
2xl:    1.5rem    (24px)   /* Avatar, special elements */
full:   9999px             /* Circles */
```

---

## 🌫️ Shadows

```css
xs:    0 1px 2px 0 rgba(0,0,0,0.05)
sm:    0 1px 3px 0 rgba(0,0,0,0.08)
md:    0 4px 6px -1px rgba(0,0,0,0.1)
lg:    0 10px 15px -3px rgba(0,0,0,0.12)
xl:    0 20px 25px -5px rgba(0,0,0,0.15)
```

**Penggunaan:**
- Chat bubbles: `md`, `lg`
- Buttons (default): `md`
- Buttons (hover): `lg`
- Cards/panels: `sm`, `md`

---

## ⏱️ Transitions

```css
fast:    150ms cubic-bezier(0.4, 0, 0.2, 1)
base:    200ms cubic-bezier(0.4, 0, 0.2, 1)
slow:    350ms cubic-bezier(0.4, 0, 0.2, 1)
```

**Penggunaan:**
- Default transitions: `base`
- Subtle interactions: `fast`
- Complex animations: `slow`

---

## 🏗️ Layout

### Main Container
- Full viewport (100vh)
- Flexbox row layout
- Sidebar + Main area

### Sidebar (Session Management)
- Width: 280px fixed
- Background: Gradient (white → primary-50)
- Collapsible on mobile
- Smooth transitions

### Main Chat Area
- Flex: 1 (takes remaining space)
- Flex column layout
- Header → Messages → Quick Prompts → Input

### Messages Area
- Flex: 1 (takes remaining space)
- Overflow-y auto dengan custom scrollbar
- Gradient background (white → neutral-50)
- Message bubbles dengan animation

### Input Area
- Fixed height
- Background gradient
- Smooth focus effects
- iOS-friendly font size (16px on mobile)

---

## 💬 Components

### Message Bubbles

**User Messages:**
- Background: Gradient (Primary 500 → 600)
- Color: White
- Border radius: 16px 16px 6px 16px
- Shadow: md
- Max width: 70% (desktop), 85% (mobile)

**Agent Messages:**
- Background: Neutral 100
- Color: Neutral 900
- Border: 1px solid Neutral 200
- Border radius: 6px 16px 16px 16px

**Success Messages:**
- Background: Gradient (Success 50 → white)
- Border: 1px solid Success 500
- Color: Success 700

**Error Messages:**
- Background: #fef2f2
- Border: 1px solid Error 500
- Color: #7f1d1d

### Buttons

**Primary Button (New Chat)**
- Background: Gradient (Primary 500 → 600)
- Color: White
- Padding: md lg
- Border radius: lg
- Shadow: md
- Hover: transform up 2px, shadow lg

**Quick Buttons**
- Background: Neutral 100
- Color: Neutral 700
- Border: 1px solid Neutral 200
- Hover: Primary 50 background, Primary 300 border

**Icon Buttons**
- Size: 28px × 28px
- Background: Neutral 100
- Hover: Neutral 200 background
- Danger variant: Error 500 on hover

**Send Button**
- Size: 44px × 44px
- Background: Gradient (Primary 500 → 600)
- Hover: transform up 2px, shadow lg
- Active: transform none

### Input Field
- Padding: md lg
- Background: White
- Border: 1px solid Neutral 200
- Border radius: xl
- Focus: Primary 400 border, Primary 100 box-shadow
- Placeholder: Neutral 400

### Session Items
- Padding: md
- Background: White with hover state
- Border: 1px solid Neutral 200
- Border radius: lg
- Active: Gradient background + special highlight
- Accent bar: 3px left border (gradient)

---

## 🎭 Animations

### Fade In (slideIn)
- 200ms ease-out
- Opacity: 0 → 1
- Transform: translateY(10px) → 0

### Loading Dots (bounce)
- 1.4s infinite
- Scale: 1 → 1.3 → 1
- Opacity: 0.5 → 1 → 0.5

### Pulse (Status Dot)
- 2s infinite
- Opacity: 1 → 0.5 → 1

### Hover Effects
- Buttons: translateY(-2px)
- Cards: shadow increase
- Text: color change

---

## ♿ Accessibility

### Focus States
```css
:focus-visible {
  outline: 2px solid Primary 500;
  outline-offset: 2px;
}
```

### ARIA Attributes
- Buttons have proper semantic HTML
- Labels associated with inputs
- Color not only indicator of state

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  animation-duration: 0.01ms;
  transition-duration: 0.01ms;
}
```

### High Contrast
- Buttons and bubbles have visible borders in high contrast mode
- Text contrast ratio: ≥4.5:1 for normal text

---

## 📱 Responsive Design

### Desktop (> 768px)
- Sidebar visible (280px)
- Messages max-width: 70%
- Full spacing (xl, lg)

### Tablet (768px - 480px)
- Sidebar hidden by default
- Toggle button visible
- Messages max-width: 85%
- Slightly reduced padding

### Mobile (< 480px)
- Sidebar as overlay
- Messages max-width: 95%
- Compact spacing (md, sm)
- Quick buttons: 2 columns
- Font size: 16px (prevent iOS zoom)

---

## 🎯 Key Features

### Visual Hierarchy
1. Avatar + Title/Subtitle (Header)
2. Messages (primary content)
3. Quick prompts (secondary)
4. Input area (footer)

### Color Usage
- **Primary (Indigo)**: Brand, focus, active states
- **Accent (Teal)**: Secondary highlights
- **Success (Green)**: Task creation confirmation
- **Error (Red)**: Error messages
- **Neutral (Gray)**: Background, text, disabled

### Typography Hierarchy
1. Page title: 24px semibold
2. Message content: 15px normal (responsive)
3. Labels/captions: 14px medium, 12px medium
4. Subtle text: 12px normal, neutral 500

### Spacing Consistency
- All padding uses spacing scale (xs, sm, md, lg, xl)
- Gaps between elements: lg (24px) standard
- Internal element padding: md-lg (16px-24px)

---

## 🔧 Implementation

### CSS Variables
Semua nilai didefinisikan sebagai CSS custom properties:
```css
--color-primary-500: #5865f2;
--space-md: 1rem;
--radius-lg: 0.75rem;
/* ... etc */
```

### Component Classes
```
.agent-page                    /* Main container */
.agent-page-sidebar           /* Session list */
.agent-page-main              /* Chat area */
.agent-page-messages          /* Messages container */
.agent-page-message           /* Individual message */
.agent-page-bubble            /* Message bubble */
.agent-page-input-form        /* Input area */
.agent-page-quick-prompts     /* Quick buttons */
```

### Theme Context (AgentThemeContext.jsx)
Provides theme values throughout the app:
```javascript
const theme = useAgentTheme();
console.log(theme.colors.primary[500]);
console.log(theme.spacing.lg);
console.log(theme.typography.scales.body.md);
```

---

## 📚 Usage Examples

### Adding New Component
```jsx
// Use theme variables
const MyComponent = () => {
  const theme = useAgentTheme();
  
  return (
    <div style={{
      padding: theme.spacing.lg,
      background: theme.colors.neutral[0],
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      transition: `all ${theme.transitions.base}`
    }}>
      Component content
    </div>
  );
};
```

### CSS Classes
```jsx
<button className="agent-page-quick-btn">
  Action
</button>
```

---

## 📋 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Features Used
- CSS Grid/Flexbox
- CSS Custom Properties
- CSS Gradients
- CSS Animations/Transitions
- backdrop-filter (optional, graceful fallback)

---

## 🎨 Color Schemes

### Light Mode (Current)
Primary color scheme menggunakan indigo sebagai primary dengan netral grays.

### Dark Mode (Future)
Dapat diimplementasikan dengan:
- Inversi nilai-nilai neutral
- Lighter primaries
- Adjusted shadows

---

## 📐 Design Tokens Summary

| Token | Value | Usage |
|-------|-------|-------|
| Primary Color | #5865f2 | Buttons, active states, focus |
| Accent Color | #14b8a6 | Highlights, secondary actions |
| Success Color | #16a34a | Confirmations, task created |
| Error Color | #ef4444 | Errors, danger actions |
| Base Spacing | 8px | All spacing multiples |
| Border Radius | 12px | Standard UI elements |
| Default Shadow | md | UI depth |
| Transition Duration | 200ms | Smooth interactions |

---

## 🚀 Getting Started

1. **Import Theme Context:**
   ```jsx
   import { useAgentTheme } from '../contexts/AgentThemeContext';
   ```

2. **Use CSS Variables:**
   ```css
   background: var(--color-primary-500);
   padding: var(--space-lg);
   ```

3. **Create New Components:**
   - Follow spacing system
   - Use semantic colors
   - Apply transitions
   - Maintain typography scale

4. **Test Responsive:**
   - Desktop (> 768px)
   - Tablet (768px - 480px)
   - Mobile (< 480px)

---

Generated: Mar 19, 2026
Design System Version: 2.0

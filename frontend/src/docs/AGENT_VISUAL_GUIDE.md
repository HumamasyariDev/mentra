# Agent Page - Visual Design Guide

## 📱 Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────────┬───────────────────────────────────────┐  │
│  │                  │                                       │  │
│  │   SIDEBAR        │          MAIN CHAT AREA              │  │
│  │   (280px)        │          (Flex: 1)                   │  │
│  │                  │                                       │  │
│  │  • New Chat ✕    │   🤖 Mentra AI    [●] Ready           │  │
│  │  • Session 1     │   ────────────────────────────────    │  │
│  │  • Session 2     │                                       │  │
│  │  • Session 3 ←   │   User:    "Buat task..."            │  │
│  │                  │                                       │  │
│  │  Loading...      │   Agent:   "Sip! Task dibuat ✅"      │  │
│  │                  │                                       │  │
│  │                  │   ────────────────────────────────    │  │
│  │                  │   Quick Prompts | Action Buttons      │  │
│  │                  │                                       │  │
│  │                  │   ┌─────────────────────────────────┐ │  │
│  │                  │   │ Type your message... │ [Send]  │ │  │
│  │                  │   └─────────────────────────────────┘ │  │
│  │                  │                                       │  │
│  └──────────────────┴───────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Swatches

### Primary Palette (Indigo)
```
Primary 50   ██ #f0f4ff   (Very Light - Hover backgrounds)
Primary 100  ██ #e0e9ff   (Light - Subtle backgrounds)
Primary 200  ██ #c7d5ff   (Light-Medium - Borders)
Primary 300  ██ #a3b8ff   (Medium-Light - Focus rings)
Primary 400  ██ #7c8aff   (Medium - Muted text)
Primary 500  ██ #5865f2   (Main - Primary actions)
Primary 600  ██ #4752c4   (Dark - Hover state)
Primary 700  ██ #3d4696   (Darker - Active state)
Primary 800  ██ #2d3468   (Very Dark - Disabled)
Primary 900  ██ #1a1f3a   (Darkest - Strong text)
```

### Accent Palette (Teal)
```
Accent 500   ██ #14b8a6   (Main - Highlights)
Accent 600   ██ #0d9488   (Dark - Hover)
```

### Semantic Palette
```
Success 50   ██ #f0fdf4   (Success background)
Success 500  ██ #16a34a   (Success color)
Error 500    ██ #ef4444   (Error color)
Warning 500  ██ #f59e0b   (Warning color)
```

### Neutral Palette (Grays)
```
Neutral 0    ██ #ffffff   (Pure white)
Neutral 50   ██ #fafafa   (Lightest gray)
Neutral 100  ██ #f5f5f5   (Very light gray)
Neutral 200  ██ #e5e5e5   (Light gray)
Neutral 300  ██ #d4d4d4   (Medium-light gray)
Neutral 400  ██ #a3a3a3   (Medium gray)
Neutral 500  ██ #737373   (Medium gray)
Neutral 600  ██ #525252   (Dark gray)
Neutral 700  ██ #404040   (Darker gray)
Neutral 800  ██ #262626   (Very dark gray)
Neutral 900  ██ #171717   (Darkest gray)
```

---

## 📝 Typography Examples

### Display (Headings - Page Level)
```
Display LG (60px, 700)
The quick brown fox jumps over the lazy dog

Display MD (48px, 700)
The quick brown fox jumps over the lazy dog

Display SM (36px, 700)
The quick brown fox jumps over the lazy dog
```

### Heading (Section Titles)
```
Heading MD (24px, 600)
Chat Sessions - The quick brown fox

Heading SM (20px, 600)
Quick Actions - The quick brown fox

Heading XS (18px, 600)
Status - The quick brown fox
```

### Body (Main Content)
```
Body MD (16px, 400, 1.6lh)
This is the standard body text used in messages and content. 
The line height is set to 1.6 for optimal readability.

Body SM (14px, 400, 1.5lh)
This is smaller body text used in secondary content and labels.
Still maintains good readability with adjusted spacing.
```

### Caption (Labels & Small Text)
```
Caption MD (14px, 500)
CHAT SESSIONS

Caption SM (12px, 500)
Updated 2 minutes ago
```

---

## 🎛️ Component Showcase

### Button Variants

#### Primary Button (New Chat)
```
┌────────────────────────┐
│  ✓  New Chat           │  Gradient: Primary 500→600
│    Color: White        │  Hover: -2px shadow lg
│    Padding: md lg      │  Shadow: md
│    Font: 14px 600      │
└────────────────────────┘
```

#### Quick Action Button
```
┌─────────────────┐
│  ➕ Buat Task   │  Background: Neutral 100
│                 │  Border: 1px Neutral 200
│  Hover: Primary │  Hover: Primary 50 bg
│     50 bg       │  Transform: -2px
└─────────────────┘
```

#### Icon Button
```
┌─────┐
│  ✎  │  Size: 28×28
│     │  Background: Neutral 100
│ 🗑️ │  Hover: Neutral 200
└─────┘
```

### Message Bubbles

#### User Message
```
┌─────────────────────────────────────┐
│  Buat task belajar React besok      │ ← Gradient Indigo
│  dengan prioritas sedang             │ ← Border radius: 16px 16px 6px 16px
│                                      │ ← Shadow: md
│  [White text]                        │ ← Max width: 70%
└─────────────────────────────────────┘
```

#### Agent Message
```
┌─────────────────────────────────────┐
│  ✅ Task berhasil disimpan!         │ ← Background: Neutral 100
│                                      │ ← Border: 1px Neutral 200
│  📌 **Belajar React**                │ ← Border radius: 6px 16px 16px 16px
│  Priority: Medium | XP: +20          │ ← Dark text
│  Deadline: 2026-03-20                │ ← Max width: 85%
│                                      │ ← Animation: slideIn 200ms
│  [📋 Lihat di halaman Tasks →]       │
└─────────────────────────────────────┘
```

#### Success Message
```
┌─────────────────────────────────────┐
│  ✅ **Task berhasil dibuat!**        │ ← Gradient Success 50→white
│                                      │ ← Border: 1px Success 500
│  Lanjutkan dengan fokus maksimal!    │ ← Text: Success 700
└─────────────────────────────────────┘
```

#### Error Message
```
┌─────────────────────────────────────┐
│  ⚠️ Error: Sesi kamu sudah habis    │ ← Background: #fef2f2
│                                      │ ← Border: 1px Error 500
│  Silakan login ulang                 │ ← Text: #7f1d1d
└─────────────────────────────────────┘
```

### Loading Animation
```
● ● ●  ← Dots bounce with 0.2s/0.4s delay
Thinking…
```

---

## 🎯 Spacing Examples

### Padding in Components

#### Large Padding (lg = 24px)
```
┌─────────────────────────────┐
│ ▌  Header padding: lg       │ ← 24px top, bottom, left, right
│                             │
└─────────────────────────────┘
```

#### Medium Padding (md = 16px)
```
┌──────────────────────────┐
│ ▌ Message padding: md    │ ← 16px inside bubble
│                          │
└──────────────────────────┘
```

#### Small Padding (sm = 8px)
```
┌────────────────────┐
│ ▌ Button padding   │ ← 8px in compact areas
│                    │
└────────────────────┘
```

### Gaps Between Elements
```
Message 1
    ↓ gap: lg (24px)
Message 2
    ↓ gap: lg (24px)
Message 3
```

---

## 🌫️ Shadow Examples

### Shadow on Chat Bubbles (md)
```
┌──────────────────────────┐
│  User message with       │ ── shadow-md (0 4px 6px)
│  subtle depth            │
└──────────────────────────┘
```

### Shadow on Buttons (md → lg on hover)
```
Regular:                   Hover:
[Button]                   [Button] ← shadow-lg (0 10px 15px)
shadow: md                 transform: -2px
```

### Shadow on Cards (sm)
```
┌──────────────────────────┐
│  Subtle shadow for       │ ── shadow-sm (0 1px 3px)
│  background elements     │
└──────────────────────────┘
```

---

## ⏱️ Animation Examples

### Message Slide In (slideIn)
```
Frame 0 (0ms):      Frame 50 (100ms):    Frame 100 (200ms):
   ↑ opacity: 0     ↑ opacity: 0.5       ↑ opacity: 1
 ↓ Y: -10px        ↓ Y: -5px            ↓ Y: 0

Message gradually slides up and fades in
```

### Loading Dots Bounce (bounce)
```
Frame 0:    ● ● ●  ← All dots at scale 1
Frame 50%:  ◎ ● ●  ← First dot scales to 1.3
Frame 100%: ● ● ●  ← Back to original

With 0.2s/0.4s stagger for cascade effect
```

### Pulse Animation (Status Dot)
```
Frame 0%:    ● → Opacity 1
Frame 50%:   ● → Opacity 0.5
Frame 100%:  ● → Opacity 1

Continuous 2s loop for "online" indicator
```

---

## 📐 Border Radius Usage

```
sm (6px):       ├─────┤  Icon buttons, small elements
                └─────┘

md (8px):       ├──────┤  Input fields, small cards
                └──────┘

lg (12px):      ├────────┤  Primary buttons, quick actions
                └────────┘

xl (16px):      ├──────────┤  Chat bubbles, major containers
                └──────────┘

2xl (24px):     ├────────────┤  Avatar, special elements
                └────────────┘

full (99999px): ○ Circles and fully rounded elements
```

---

## 📱 Responsive Breakpoints

### Desktop (≥ 768px)
```
┌───────────┬──────────────────────────┐
│ Sidebar   │   Main                   │
│ (280px)   │   (flex: 1)              │
│           │                          │
│ Visible   │  Bubble max-width: 70%   │
│ Always    │                          │
└───────────┴──────────────────────────┘
```

### Tablet (481px - 768px)
```
┌───────────┬──────────────────────────┐
│           │   Main                   │
│ Toggle ↔  │   (flex: 1)              │
│ Sidebar   │   Overlay on demand      │
│           │   Bubble max-width: 80%  │
└───────────┴──────────────────────────┘
```

### Mobile (< 480px)
```
┌──────────────────────────────────────┐
│ Toggle    Main                       │
│ ↔         (full width)               │
│           Bubble max-width: 95%      │
│                                      │
│ Sidebar as overlay modal             │
└──────────────────────────────────────┘
```

---

## 🎨 Color Combinations

### Button + Text
```
Primary 500 bg + White text     → User action buttons
Primary 50 bg + Primary 700 text → Hover state
Neutral 100 bg + Neutral 700    → Secondary buttons
Error 500 bg + White text       → Danger buttons
```

### Message Bubbles
```
Primary 500-600 bg + White              → User messages
Neutral 100 bg + Neutral 900            → Agent messages
Success 50 bg + Success 700 + border    → Success messages
Error bg + Error text + border          → Error messages
```

### Text Hierarchy
```
Neutral 900 (Primary text)     → Headings, main content
Neutral 800 (Secondary text)   → Body text
Neutral 600 (Muted text)       → Timestamps, hints
Neutral 500 (Subtle text)      → Disabled states
```

---

## ✨ Interactive States

### Button States
```
Default:   [Button]              Primary 50 bg, Neutral 600 text
Hover:     [Button] ↑            Primary 50 bg, shadow-sm
Active:    [Button]              Primary 500 bg, Primary 50 text
Disabled:  [Button]              Neutral 200 bg, opacity 0.5
```

### Input States
```
Default:   ┌─────────┐            Border: Neutral 200
Focused:   ┌─────────┐            Border: Primary 400, ring: Primary 100
Error:     ┌─────────┐            Border: Error 500
Disabled:  ┌─────────┐            Opacity 0.6
```

### Session Item States
```
Default:   ┌─────────┐            Neutral 100 bg, transparent accent
Hover:     ┌─────────┐            Neutral 50 bg, shadow-sm
Active:    ┌─────────┐            Primary 50 bg with accent bar
```

---

## 🎯 Key Design Principles

### 1. **Clean Minimalism**
- Plenty of whitespace
- No unnecessary elements
- Focused content hierarchy

### 2. **Modern Aesthetics**
- Gradients for depth
- Soft shadows for layering
- Smooth animations for polish

### 3. **Excellent Typography**
- Clear hierarchy with scales
- Generous line heights (1.5-1.6)
- Semantic font sizes

### 4. **Consistency**
- All values from design tokens
- Predictable spacing
- Cohesive color palette

### 5. **Accessibility**
- WCAG AA compliance
- High contrast ratios
- Clear focus states
- Reduced motion support

---

## 📋 Implementation Checklist

- [x] CSS custom properties for all values
- [x] Semantic HTML structure
- [x] Flexbox/Grid layout system
- [x] Smooth transitions & animations
- [x] Responsive design (mobile first)
- [x] Focus states & keyboard navigation
- [x] Color contrast testing
- [x] Theme context provider
- [x] Documentation & style guide
- [ ] Dark mode variant (future)

---

**Design System v2.0 | Last Updated: Mar 19, 2026**

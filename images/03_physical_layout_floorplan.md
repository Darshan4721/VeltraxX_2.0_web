# IMAGE SPECIFICATION 3.0 — GDSII PHYSICAL DESIGN & CLOCK TREE ROUTING
**Asset ID:** `PHYSICAL_LAYOUT_03`  
**Section:** Chapter 2 — Section 04: The Problem Statement Architecture (RTL to GDSII)  
**Parent Blueprint:** [`docs/specs/MASTER_HACKATHON_PAGE_PLAN.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/MASTER_HACKATHON_PAGE_PLAN.md)  
**Visual Theme:** Physical Design / GDSII / Floorplanning / Clock Tree Synthesis (CTS)  
**Output Destination:** `public/images/`

---

## 1. Technical Dimensions & Ratios

| Target Display | File Name | Exact Resolution | Aspect Ratio | Framing & Focal Composition |
| :--- | :--- | :--- | :--- | :--- |
| **💻 PC / Desktop** | `layout-desktop.webp` | **1200 × 800 px** | **3:2** (Landscape) | Multi-layer 2.5D isometric strata showing exploded physical layout tiers: M1 standard cell rows at base, M3-M5 routing corridors in middle, and M7-M8 power distribution network (PDN) straps hovering above. |
| **📱 Mobile** | `layout-mobile.webp` | **800 × 800 px** | **1:1** (Square) | Top-down micro-architectural crop of a high-density SRAM block interface and symmetrical H-tree clock network. |

### Canvas & Background Rule:
- Clean white background `#FFFFFF`, high contrast, crisp vector-like architectural lines, natural copper and cobalt metal colors.

---

## 2. Master Image Generation Prompt

Copy and paste the exact prompt below into your image generator (Midjourney v6.1, Flux.1 Pro, Ideogram 2.0):

```text
Detailed 2.5D architectural isometric visualization of an advanced ASIC physical design layout and EDA floorplan for a VLSI hackathon. The composition shows an exploded multi-tier semiconductor metal stack: dense standard-cell transistor rows at the bottom layer, complex interconnect routing tracks in copper and tungsten on intermediate layers, and a heavy orthogonal power grid (VDD and VSS straps) with balanced H-tree clock distribution network on the top metal layers. Microscopic via pillars connect the multi-layered routing planes with physical precision. Technical CAD color coding: muted copper, deep silicon-blue, subtle solar-yellow power lines, and dark carbon silicon substrate. Photographed as an architectural model under soft studio diffuse lighting. Pure solid white studio background (#FFFFFF), sharp crisp edges, high contrast, minimalist engineering infographic aesthetic, 8k resolution, zero blur. --no dark background, generic green motherboard, glowing neon cyber city, laptop, text, numbers, cartoon, blurry renders
```

---

## 3. Platform Parameters (Quick Flags)

### Midjourney v6.1:
- **For Desktop (3:2):**
  ```text
  [PROMPT ABOVE] --ar 3:2 --style raw --v 6.1 --s 200
  ```
- **For Mobile (1:1):**
  ```text
  [PROMPT ABOVE] --ar 1:1 --style raw --v 6.1 --s 200
  ```

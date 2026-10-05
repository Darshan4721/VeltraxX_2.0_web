# IMAGE SPECIFICATION 2.0 — MONOCRYSTALLINE SILICON WAFER & LITHOGRAPHY
**Asset ID:** `SILICON_WAFER_02`  
**Section:** Chapter 1 — Section 02: Institutional Lineage & C2S Cleanroom Foundation  
**Parent Blueprint:** [`docs/specs/MASTER_HACKATHON_PAGE_PLAN.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/MASTER_HACKATHON_PAGE_PLAN.md)  
**Visual Theme:** Semiconductor Fabrication / Cleanroom Ingot / Photolithography  
**Output Destination:** `public/images/`

---

## 1. Technical Dimensions & Ratios

| Target Display | File Name | Exact Resolution | Aspect Ratio | Framing & Focal Composition |
| :--- | :--- | :--- | :--- | :--- |
| **💻 PC / Desktop** | `wafer-desktop.webp` | **1200 × 800 px** | **3:2** (Landscape) | 300mm mirror-polished silicon wafer resting on an engineering cleanroom pedestal, angled at 30° to capture rainbow optical diffraction patterns across etched die grids. |
| **📱 Mobile** | `wafer-mobile.webp` | **800 × 800 px** | **1:1** (Square) | Centered macro crop focusing on wafer notch, edge exclusion zone, and precision step-and-repeat lithography dies. |

### Canvas & Background Rule:
- Pure clean studio environment, pure white background `#FFFFFF`, high-key lighting with crisp architectural contact shadows.

---

## 2. Master Image Generation Prompt

Copy and paste the exact prompt below into your image generator (Midjourney v6.1, Flux.1 Pro, Ideogram 2.0):

```text
High-end industrial cleanroom photograph of an authentic 300mm monocrystalline silicon wafer for advanced semiconductor manufacturing. The wafer surface displays a microscopic step-and-repeat grid of identical etched microprocessor dies, exhibiting vibrant thin-film optical interference rainbow colors (cyan, magenta, and solar yellow) under clean directional studio lighting. Visible wafer notch orientation marker, edge exclusion perimeter, and microscopic test-element group (TEG) structures along scribe lines. Resting on a minimal matte anodized aluminum inspection chuck. Shot with Phase One XF IQ4 150MP camera, Schneider Kreuznach 80mm lens, f/8, sharp focus, crystal-clear detail. Pure solid white studio background (#FFFFFF), ultra-clean, museum-quality industrial design aesthetic, 8k resolution, zero dust particles, zero noise. --no dark room, generic circuit board, green pcb, futuristic neon glow, cartoon, fantasy, programmer, text, watermarks, fingers, hands
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

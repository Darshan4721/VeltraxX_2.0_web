# IMAGE SPECIFICATION 6.0 — THE SILICON CHAMPIONSHIP TROPHY
**Asset ID:** `SILICON_TROPHY_06`  
**Section:** Chapter 4 — Section 10: Prizes & Industry Career Launchpad  
**Parent Blueprint:** [`docs/specs/MASTER_HACKATHON_PAGE_PLAN.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/MASTER_HACKATHON_PAGE_PLAN.md)  
**Visual Theme:** Hardware Championship Trophy / Monocrystalline Silicon / Optical Glass / Gold Wire-Bonds  
**Output Destination:** `public/images/`

---

## 1. Technical Dimensions & Ratios

| Target Display | File Name | Exact Resolution | Aspect Ratio | Framing & Focal Composition |
| :--- | :--- | :--- | :--- | :--- |
| **💻 PC / Desktop** | `trophy-desktop.webp` | **800 × 1000 px** | **4:5** (Vertical Portrait) | Monolithic vertical trophy centered on a heavy brushed aerospace aluminum pedestal. Clean negative space on all sides. |
| **📱 Mobile** | `trophy-mobile.webp` | **800 × 800 px** | **1:1** (Square) | Centered close-up highlighting the etched silicon wafer core and gold wire-bond ribbons inside the optical glass block. |

### Canvas & Background Rule:
- Pure white studio background `#FFFFFF`, high contrast, crisp architectural reflections, soft floor shadow.

---

## 2. Master Image Generation Prompt

Copy and paste the exact prompt below into your image generator (Midjourney v6.1, Flux.1 Pro, Ideogram 2.0):

```text
Studio product photograph of an exclusive, minimalist industrial design championship trophy for a national VLSI engineering hackathon. The trophy features a pristine, mirror-polished circular slice of an authentic 300mm monocrystalline silicon wafer with iridescent etched microprocessor circuitry, floating encapsulated inside a block of ultra-clear liquid optical glass with beveled chamfered edges. Delicate 24k gold wire-bond ribbons and geometric brass interconnect traces fan out from the silicon die edges. The glass monolith is mounted into a heavy, precision-milled brushed aerospace aluminum pedestal with subtle engraved geometric technical notches. High-key studio lighting with soft reflections and crisp contact shadows on a pure solid white studio floor and background (#FFFFFF). Elegant, high-end Apple-grade craftsmanship, timeless engineering honor, 8k resolution, razor-sharp focus, zero dust. --no dark background, cheap plastic cup, golden soccer trophy, cartoon, futuristic neon blobs, blur, noise, text, watermarks
```

---

## 3. Platform Parameters (Quick Flags)

### Midjourney v6.1:
- **For Desktop (4:5):**
  ```text
  [PROMPT ABOVE] --ar 4:5 --style raw --v 6.1 --s 200
  ```
- **For Mobile (1:1):**
  ```text
  [PROMPT ABOVE] --ar 1:1 --style raw --v 6.1 --s 200
  ```

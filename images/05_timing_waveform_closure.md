# IMAGE SPECIFICATION 5.0 — STATIC TIMING ANALYSIS (STA) & TIMING WAVEFORM CLOSURE
**Asset ID:** `TIMING_CLOSURE_05`  
**Section:** Chapter 4 — Section 09: Evaluation & Industry Jury Validation  
**Parent Blueprint:** [`docs/specs/MASTER_HACKATHON_PAGE_PLAN.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/MASTER_HACKATHON_PAGE_PLAN.md)  
**Visual Theme:** Static Timing Analysis / Setup-Hold Margins / Digital Eye-Diagram / Verification  
**Output Destination:** `public/images/`

---

## 1. Technical Dimensions & Ratios

| Target Display | File Name | Exact Resolution | Aspect Ratio | Framing & Focal Composition |
| :--- | :--- | :--- | :--- | :--- |
| **💻 PC / Desktop** | `timing-desktop.webp` | **1200 × 800 px** | **3:2** (Landscape) | Architectural 3D visualization of high-speed differential signal transitions forming an elegant digital eye-diagram, seamlessly intersecting with clock-to-Q timing arcs and logic-gate delay paths. |
| **📱 Mobile** | `timing-mobile.webp` | **800 × 800 px** | **1:1** (Square) | Centered close-up of a sharp differential eye opening with setup and hold margin boundary markers. |

### Canvas & Background Rule:
- Pure white background `#FFFFFF`, high-contrast technical lines, subtle cobalt and infrared voltage traces.

---

## 2. Master Image Generation Prompt

Copy and paste the exact prompt below into your image generator (Midjourney v6.1, Flux.1 Pro, Ideogram 2.0):

```text
Sophisticated minimalist technical visualization of digital timing closure and high-speed eye-diagram waveforms for a VLSI silicon hackathon. Multi-phase clock waveforms and high-speed differential digital signal transitions are rendered as delicate, architectural 3D ribbon traces intersecting in clean space, demonstrating wide eye-opening, zero setup and hold time violations, and razor-sharp signal integrity. Fine technical coordinate crosshairs, nanosecond timing grids, and propagation delay arcs are rendered in ultra-crisp hairline graphics. Color palette: pristine gallery white background (#FFFFFF), crisp graphite traces, subtle silicon-cobalt (#0055FF) and infrared-crimson (#FF2A4B) differential paths, with solar-yellow (#FFE500) clock markers. Hasselblad studio lighting, high key, elegant Swiss technical diagram aesthetics, 8k resolution, razor-sharp vector clarity. --no dark room, messy oscilloscope screen, generic matrix code, glowing neon gaming, cartoon, blurry renders, text, illegible letters
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

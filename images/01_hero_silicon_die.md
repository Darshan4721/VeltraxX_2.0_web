# IMAGE SPECIFICATION 1.0 — HERO STAGE: MACRO SILICON DIE & INTERCONNECTS
**Asset ID:** `HERO_SILICON_DIE_01`  
**Section:** Chapter 1 — Section 01: Hero Stage (Layer 2 2.5D Spatial Stage)  
**Parent Blueprint:** [`docs/specs/HERO_SECTION_BLUEPRINT.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/HERO_SECTION_BLUEPRINT.md)  
**Visual Theme:** Core VLSI / Physical Silicon / RTL-to-GDSII Architecture  
**Output Destination:** `public/images/`

---

## 1. Technical Dimensions & Ratios

| Target Display | File Name | Exact Resolution | Aspect Ratio | Framing & Focal Composition |
| :--- | :--- | :--- | :--- | :--- |
| **💻 PC / Desktop** | `hero-desktop.webp` (or `.png`) | **1920 × 1080 px** | **16:9** (Landscape) | Subject positioned **center-right** (rule of thirds), angled dynamically at 15° isometric perspective. Left 55% left completely clear with pure white `#FFFFFF` studio gradient for web typography and UI telemetry. |
| **📱 Mobile** | `hero-mobile.webp` (or `.png`) | **800 × 1000 px** (or 1080 × 1350 px) | **4:5** (Vertical Portrait) | Subject positioned **dead-center**, tight macro crop focusing on central processor execution core and radiating clock tree copper traces. |

### Canvas & Background Rule:
- **Transparent PNG / WebP** (Preferred) OR **Solid Pure Studio White (`#FFFFFF`)**.
- Absolutely NO dark gray gradients or muddy background noise. Must seamlessly blend into the `#FBFBFB` gallery canvas.

---

## 2. Master Image Generation Prompt

Copy and paste the exact prompt below into your image generator (Midjourney v6.1, Flux.1 Pro, Ideogram 2.0, DALL-E 3):

```text
Macroscopic architectural visualization of a premium exposed semiconductor ASIC silicon die for a national-level VLSI hackathon. The central processing core features hyper-detailed multi-layer copper interconnect routing (M1 to M8 metal stack), standard-cell logic transistor rows, power distribution grid rings, and microscopic gold wire-bond ribbons terminating at peripheral I/O pads. Subtle wafer thin-film iridescent diffraction sheen across etched silicon pathways, accented by subtle solar-yellow (#FFE500) and silicon-cobalt (#0055FF) reflections on metallic vias. Photographed with a Hasselblad H6D-100c medium format camera, 120mm macro lens, f/11 aperture for razor-sharp depth of field across silicon traces. Clean high-key architectural studio lighting from top-left, casting soft, precise contact shadows. Pure solid white studio background (#FFFFFF), high contrast, ultra-minimalist Swiss design aesthetic, 8k resolution, engineering-grade physical accuracy, zero dust. --no dark background, black room, generic laptop, keyboard, hoodie, programmer, cartoon, cheap circuit board clipart, illegible text, blur, glow blobs
```

---

## 3. Platform Parameters (Quick Flags)

### Midjourney v6.1:
- **For Desktop (16:9):**
  ```text
  [PROMPT ABOVE] --ar 16:9 --style raw --v 6.1 --s 250
  ```
- **For Mobile (4:5):**
  ```text
  [PROMPT ABOVE] --ar 4:5 --style raw --v 6.1 --s 250
  ```

### Flux.1 Pro / Ideogram 2.0:
- **Category:** Macro Technical Photography / Industrial Product Design
- **Aspect Ratio:** `16:9` (Desktop) / `4:5` (Mobile)
- **Background:** White studio background `#FFFFFF`

---

## 4. Frontend Integration Blueprint

When placed in `public/images/`, our React code renders the asset dynamically inside the **Atropos 2.5D spatial container**:

```jsx
<Atropos className="hero-atropos" highlight={false} shadow={false}>
  {/* Layer 1: Tilted 14deg Solar Yellow Polygon */}
  <div className="layer-polygon" data-atropos-offset="-3" />

  {/* Layer 2: Native Silicon Die Macro Image */}
  <picture data-atropos-offset="5">
    <source media="(max-width: 767px)" srcSet="/images/hero-mobile.webp" width="800" height="1000" />
    <img 
      src="/images/hero-desktop.webp" 
      alt="VELTRAXX 2.0 Silicon ASIC Micro-Architecture" 
      width="1920" 
      height="1080" 
      className="hero-silicon-img"
    />
  </picture>

  {/* Layer 3: Floating GlinUI Optical Glass Telemetry Pill */}
  <div className="layer-glass-pill" data-atropos-offset="8">
    <span className="dot-live" /> 24H LIVE SILICON ARENA
  </div>
</Atropos>
```

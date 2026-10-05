# IMAGE SPECIFICATION 4.0 — FPGA SILICON PACKAGING & HIGH-SPEED HARDWARE PROBING
**Asset ID:** `FPGA_PROBING_04`  
**Section:** Chapter 2 — Section 05: Infrastructure & BYOD Hardware Protocol  
**Parent Blueprint:** [`docs/specs/MASTER_HACKATHON_PAGE_PLAN.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/MASTER_HACKATHON_PAGE_PLAN.md)  
**Visual Theme:** Hardware Emulation / FPGA Silicon Package / High-Frequency Probing  
**Output Destination:** `public/images/`

---

## 1. Technical Dimensions & Ratios

| Target Display | File Name | Exact Resolution | Aspect Ratio | Framing & Focal Composition |
| :--- | :--- | :--- | :--- | :--- |
| **💻 PC / Desktop** | `fpga-desktop.webp` | **1200 × 675 px** | **16:9** (Landscape) | Bare-die flip-chip BGA package mounted on an evaluation test carrier board, surrounded by precision differential oscilloscope micro-probes, SMA coaxial microwave cables, and high-density logic analyzer headers. |
| **📱 Mobile** | `fpga-mobile.webp` | **800 × 800 px** | **1:1** (Square) | Macro close-up on the ceramic substrate package, gold substrate balls, and spring-loaded pogo-pin test fixtures. |

### Canvas & Background Rule:
- Pure white background `#FFFFFF`, technical cleanroom workbench aesthetic, crisp macro focus.

---

## 2. Master Image Generation Prompt

Copy and paste the exact prompt below into your image generator (Midjourney v6.1, Flux.1 Pro, Ideogram 2.0):

```text
Macrophotograph of a high-performance bare-die FPGA silicon package on an advanced hardware development engineering board for a VLSI competition. The exposed flip-chip silicon die reflects subtle technical studio light, surrounded by surface-mount decoupling capacitors, gold contact pads, and precision high-bandwidth differential oscilloscope active probes resting precisely on high-speed differential test points. Clean braided silver SMA coaxial cables, impedance-matched differential traces, and microscopic gold wire leads visible in razor-sharp focus. Clean technical lighting, shallow depth of field highlighting the central silicon die and probe tips, neutral grey and silver hardware tones with subtle brass and gold accents. Pure solid white studio background (#FFFFFF), ultra-high definition, industrial engineering photography, 8k resolution, zero clutter. --no dark room, messy wires, generic laptop, green toy motherboard, glowing neon, futuristic cyberpunk, cartoon, text
```

---

## 3. Platform Parameters (Quick Flags)

### Midjourney v6.1:
- **For Desktop (16:9):**
  ```text
  [PROMPT ABOVE] --ar 16:9 --style raw --v 6.1 --s 200
  ```
- **For Mobile (1:1):**
  ```text
  [PROMPT ABOVE] --ar 1:1 --style raw --v 6.1 --s 200
  ```

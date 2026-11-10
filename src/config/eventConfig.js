/**
 * VELTRAXX 2.0 · SINGLE AUTHORITATIVE SOURCE OF TRUTH
 * Compliant with docs/specs/VELTRAXX_2.0_UI_AND_CONTENT_SPEC.md.
 * 
 * RULE: Never hardcode event details (dates, fees, capacity, prizes, contacts)
 * inside UI components. Always import and consume from this file.
 * Strict Anti-Slop: Zero em-dashes (\u2014) in visible copy.
 */

export const eventConfig = {
  event: {
    name: "VELTRAXX 2.0",
    legacyName: "VELTRAXX'26",
    type: "National 2-Stage Tech & Silicon Hackathon",
    level: "National Level",
    mode: "Round 1 Online Pitch · Round 2 24H Offline Finale",
    eyebrow: "NATIONAL-LEVEL 2-STAGE TECH & SILICON HACKATHON · SIET COIMBATORE",
    thesis: "Pitch your blueprint online for FREE in Round 1. Survive the shortlist, enter the 24-hour offline arena at SIET, and build through live engineering twists.",
    dates: {
      display: "Round 1: Nov-Dec 2026 · Finale: 15-16 Dec 2026",
      round1RegistrationClose: "2026-12-01T23:59:59+05:30",
      round1PptWindowStart: "2026-12-02T00:00:00+05:30",
      round1PptWindowEnd: "2026-12-03T23:59:59+05:30",
      shortlistAnnouncement: "2026-12-07T10:00:00+05:30",
      round2StartDate: "2026-12-15T08:30:00+05:30",
      round2EndDate: "2026-12-16T12:30:00+05:30"
    },
    durationHours: 24,
    institution: {
      name: "Sri Shakthi Institute of Engineering and Technology",
      shortName: "SIET",
      department: "Department of EE - VDT (VLSI Design & Technology)",
      campus: "L&T Bypass Road, Chinniyampalayam Post, Coimbatore, Tamil Nadu 641062",
      lab: "SIET VLSI Research Lab & Main Auditorium",
      coordinates: {
        lat: "11.0168°N",
        lng: "76.9558°E",
        display: "11.0168° N, 76.9558° E · COIMBATORE"
      }
    }
  },

  registration: {
    round1FeeINR: 0,
    isRound1Free: true,
    teamSizeOptions: [2, 3, 4],
    defaultTeamSize: 4,
    round2SeatsCap: null, // Set dynamically by coordinator committee based on lab capacity
    round2TargetTeams: "Shortlisted Teams",
    round2DefaultFeePerMemberINR: 500,
    allowedInstitutions: "Intra-college and inter-college allowed",
    eligibleCohorts: [
      "UG 1st & 2nd Year (Tier A Evaluation)",
      "UG 3rd & 4th Year (Tier B Evaluation)",
      "Master's students (M.E. / M.Tech / M.Sc)",
      "Research Scholars (Ph.D. / MS)"
    ],
    downloads: {
      problemBookPdf: "/downloads/VELTRAXX_2.0_Problem_Statements.pdf",
      pptTemplatePptx: "/downloads/VELTRAXX_2.0_Round1_Template.pptx",
      pptReferenceExamplePptx: "/downloads/VELTRAXX_2.0_Round1_Reference_Example.pptx",
      rulebookPdf: "/downloads/VELTRAXX_2.0_Rulebook.pdf"
    },
    whatsappGroupUrl: null, // Fill when official WhatsApp community link is generated
    payeeName: "VELTRAXX 2.0 SIET"
  },

  tracks: [
    {
      id: "track_01",
      code: "VLSI-A",
      name: "Core ASIC & Custom Silicon Architecture",
      domain: "VLSI Design & Semiconductor",
      accentColor: "#FFE500",
      textColor: "#111116",
      borderColor: "border-[#FFE500]",
      description: "RTL design, low-power architectures, memory controllers, and DFT/BIST verification systems.",
      targetBranches: "VLSI, ECE, EEE, Instrumentation",
      badge: "CORE SILICON",
      problems: [
        {
          code: "VTX-T1-01",
          title: "Low-Power Configurable ALU with Autonomous Logic BIST (LBIST)",
          challenge: "Design a synthesizable multi-operation Arithmetic Logic Unit paired with an on-chip Built-In Self-Test (LBIST) controller using an LFSR test-pattern generator and MISR signature analyzer to detect stuck-at faults without external ATE equipment.",
          tierA: "8-bit/16-bit Verilog RTL simulation with basic LFSR pattern generation and self-checking testbench waveforms.",
          tierB: "32-bit pipelined RTL with dual-MISR fault-aliasing reduction, clock-gating for idle power reduction, and synthesis PPA (Power, Performance, Area) reports."
        },
        {
          code: "VTX-T1-02",
          title: "Metastability-Hardened Dual-Clock Asynchronous FIFO Bridge",
          challenge: "Architect a configurable asynchronous FIFO buffer capable of transferring high-speed burst data safely across two independent, unrelated clock domains (CDC) without data loss or metastability failure.",
          tierA: "Behavioral/RTL simulation demonstrating Gray-code pointer conversion, 2-stage flip-flop synchronizers, and accurate full/empty flag generation.",
          tierB: "Parameterized bus/depth RTL, programmable almost-full/almost-empty watermarks, formal CDC verification/STA timing constraints, and synthesis sign-off."
        },
        {
          code: "VTX-T1-03",
          title: "Fault-Tolerant 5-Port Network-on-Chip (NoC) Mesh Router",
          challenge: "Design a 5-port (North, South, East, West, Local) packet-switched NoC router utilizing deterministic XY routing and round-robin arbitration, equipped with single-error detection and recovery against silent data corruption.",
          tierA: "RTL design and simulation of a 5-port crossbar switch with XY routing logic and basic parity-bit error flagging.",
          tierB: "Virtual-channel buffering, Hamming SEC-DED (Single Error Correction, Double Error Detection) datapath protection, latency/throughput benchmarking, and physical floorplan estimation."
        },
        {
          code: "VTX-T1-04",
          title: "Dynamic Clock-Gated Multi-Master APB/AXI-Lite Peripheral Interconnect",
          challenge: "Build an AMBA-compliant bus bridge connecting a high-speed processor master to multiple low-speed peripheral slaves (Timer, GPIO, UART, SPI), automatically gating the clock of idle slaves to minimize dynamic power dissipation.",
          tierA: "RTL implementation of a 1-Master, 3-Slave APB bridge with clean read/write handshaking and functional waveforms.",
          tierB: "AXI4-Lite to APB protocol conversion with glitch-free integrated clock-gating (ICG) cells, timeout watchdog recovery, and synthesized gate-level power analysis."
        },
        {
          code: "VTX-T1-05",
          title: "Side-Channel Resistant Cryptographic Datapath (Masked AES / Lightweight Cipher)",
          challenge: "Edge silicon is vulnerable to Differential Power Analysis (DPA) where attackers extract secret keys from power spikes. Design a hardware encryption engine (PRESENT, Simon, or AES S-Box) that masks intermediate states to flatten power signatures.",
          tierA: "Synthesizable RTL of a lightweight block cipher with a self-checking encryption/decryption testbench.",
          tierB: "First-order Boolean/Domain-Oriented Masking (DOM) implementation with pipelined register barriers and switching-activity comparison reports."
        }
      ]
    },
    {
      id: "track_02",
      code: "VLSI-B",
      name: "FPGA Acceleration & Reconfigurable Hardware",
      domain: "Hardware Acceleration & Systems",
      accentColor: "#00E5FF",
      textColor: "#111116",
      borderColor: "border-[#00E5FF]",
      description: "Hardware accelerators, high-speed streaming interfaces, DSP pipelines, and FPGA prototyping.",
      targetBranches: "ECE, VLSI, EEE, CSE (Hardware/Systems)",
      badge: "RECONFIGURABLE",
      problems: [
        {
          code: "VTX-T2-01",
          title: "Real-Time 2D Sobel & Canny Edge-Detection Streaming Pipeline",
          challenge: "Software image processing introduces frame lag in autonomous drones. Design a line-buffered streaming hardware accelerator in RTL/FPGA that computes spatial gradients on incoming pixel streams in real time with zero frame-buffer external memory stalls.",
          tierA: "Verilog/VHDL simulation processing a test image matrix (Hex/COE file) through a 3x3 sliding window filter and outputting edge-detected image data.",
          tierB: "Full streaming pipeline with dual-port BRAM line buffers, non-maximum suppression, resource utilization (LUT/DSP/BRAM) optimization, and live VGA/HDMI or UART frame output."
        },
        {
          code: "VTX-T2-02",
          title: "Custom RISC-V (RV32I) Core with Hardware AI/DSP Instruction Extension",
          challenge: "Design a 32-bit RISC-V processor core and extend its Instruction Set Architecture (ISA) with custom hardware instructions (such as single-cycle Multiply-Accumulate MAC or ReLU activation) to accelerate edge neural network layers.",
          tierA: "Single-cycle or 3-stage pipelined RV32I base core executing standard arithmetic/branch assembly instructions with a custom MAC opcode in simulation.",
          tierB: "5-stage pipelined RV32I core with data-forwarding, hazard detection, AMBA peripheral bus, and cycle-count benchmark comparison proving speedup over software-only execution."
        },
        {
          code: "VTX-T2-03",
          title: "Hardware-Accelerated Network Packet Firewall & Deep Pattern Matcher",
          challenge: "High-speed routers cannot inspect packets in software without dropping throughput. Architect a wire-speed RTL packet parser that inspects incoming Ethernet/IPv4/UDP headers and blocks malicious payload signatures in a single clock cycle per byte.",
          tierA: "FSM-based header parser extracting Source IP, Destination Port, and Protocol fields from simulated packet streams and triggering a drop flag on blacklisted rules.",
          tierB: "Parallel Bloom-filter or TCAM-style rule lookup engine supporting dynamic rule updates and gigabit-rate timing closure on FPGA architecture."
        },
        {
          code: "VTX-T2-04",
          title: "Low-Power MFCC Audio Feature Extractor for Always-On Voice Wake-Word",
          challenge: "Design a dedicated hardware digital signal processing (DSP) pipeline that converts raw digital microphone audio (I2S/PCM) into spectral features (FFT / Mel-Frequency bands) to trigger a wake-word flag at ultra-low power.",
          tierA: "Fixed-point FIR pre-emphasis filter and windowed energy/zero-crossing detector in RTL simulation capable of distinguishing speech from silence.",
          tierB: "Radix-2 FFT butterfly engine with Mel-filterbank LUT accumulation, fixed-point quantization error analysis, and FPGA DSP-slice optimization."
        },
        {
          code: "VTX-T2-05",
          title: "Multi-Channel High-Resolution PWM & Dead-Time Motor Drive Controller",
          challenge: "Electric vehicle (EV) inverters and robotic actuators require nanosecond-accurate PWM signals with programmable dead-time insertion and sub-microsecond over-current fault shutoff in hardware.",
          tierA: "4-channel programmable PWM generator in RTL with configurable duty cycle, frequency prescaler, and emergency hardware brake pin.",
          tierB: "Complementary 3-phase sinusoidal/SVPWM generator with programmable dead-time counters, rotary encoder quadrature decoder feedback loop, and hardware PID calculation engine."
        }
      ]
    },
    {
      id: "track_03",
      code: "AI/CSE",
      name: "Edge AI, TinyML & Computer Vision",
      domain: "Applied Intelligence & Embedded ML",
      accentColor: "#FF2E93",
      textColor: "#FFFFFF",
      borderColor: "border-[#FF2E93]",
      description: "TinyML, hardware-aware neural networks, smart diagnostics, and real-time edge computer vision.",
      targetBranches: "CSE, AI & DS, IT, ECE, Robotics",
      badge: "TINYML & CV",
      problems: [
        {
          code: "VTX-T3-01",
          title: "Sub-50ms Quantized Edge Vision System for PCB & Wafer Defect Triage",
          challenge: "Cloud-based visual inspection is too slow and expensive for high-speed electronics assembly lines. Build an offline Edge AI vision pipeline capable of detecting missing components, solder bridges, or surface scratches in under 50ms per frame.",
          tierA: "Trained lightweight vision model (YOLOv8-Nano / MobileNet) with a working local UI dashboard displaying bounding-box defect classification and confidence scores.",
          tierB: "INT8 quantized model (TFLite / ONNX Runtime) running under strict memory/CPU caps, handling motion blur or lighting shifts, with automated pass/reject hardware GPIO trigger output."
        },
        {
          code: "VTX-T3-02",
          title: "Non-Invasive Driver Drowsiness, Gaze & Micro-Sleep Edge Telemetry",
          challenge: "Design a real-time in-cabin safety system that tracks eye-aspect ratio (EAR), head pose, and yawning frequency without cloud connectivity, triggering graduated physical alerts before a highway collision occurs.",
          tierA: "Real-time webcam/edge-camera inference pipeline accurately tracking facial landmarks and triggering visual/audio alerts when eye-closure exceeds a threshold time.",
          tierB: "Multi-modal sensor fusion combining camera gaze tracking with steering/accelerometer jitter analysis, low-light IR resilience, and false-positive suppression."
        },
        {
          code: "VTX-T3-03",
          title: "Acoustic Anomaly & Predictive Bearing Fault Detector for Factory Motors",
          challenge: "Industrial motors emit subtle ultrasonic and acoustic frequency shifts days before catastrophic mechanical failure. Build a TinyML/Edge-DSP diagnostic engine that classifies normal vs. anomalous machine states from raw audio/vibration streams.",
          tierA: "Spectrogram/FFT feature extraction pipeline paired with a lightweight classifier that identifies faulty vs. healthy motor audio samples in real time.",
          tierB: "On-device continuous anomaly detection capable of filtering out background factory noise, running on a microcontroller/edge board with live health-index telemetry."
        },
        {
          code: "VTX-T3-04",
          title: "Offline Edge-LLM & RAG Assistant for Lab Equipment & Datasheet Triage",
          challenge: "Engineers debugging hardware in secure labs often lack internet access or waste hours digging through 500-page component datasheets. Build a 100% offline, local Small Language Model (SLM) + Retrieval-Augmented Generation (RAG) system that extracts exact pinouts, timing limits, and register maps with zero hallucination.",
          tierA: "Working local RAG pipeline that ingests PDF datasheets and answers technical queries with exact page/table citations.",
          tierB: "Quantized local model running purely on laptop CPU/NPU (zero external API calls), featuring automated truth-table/schematic parameter extraction and strict anti-hallucination guardrails."
        },
        {
          code: "VTX-T3-05",
          title: "Precision Agricultural Drone Imagery Triage for Early Crop Stress",
          challenge: "Drones capture thousands of high-resolution field images, but farmers need instant localized action maps before landing. Build an ultra-lightweight vision classifier that segments leaf blight, pest damage, and water stress at the edge.",
          tierA: "Image classification and segmentation pipeline identifying crop disease categories with severity percentage estimation and geo-tagged report generation.",
          tierB: "Pruned/quantized edge model optimized for low-power flight compute, calculating targeted pesticide/water dosage maps in real time at 15+ FPS."
        }
      ]
    },
    {
      id: "track_04",
      code: "CSE/ECE/EEE",
      name: "Smart Systems, Cyber-Physical IoT & Automation",
      domain: "Connected Systems & Automation",
      accentColor: "#B6FF00",
      textColor: "#111116",
      borderColor: "border-[#B6FF00]",
      description: "Highway safety, industrial telemetry, smart BMS automation, and integrated sensor-cloud systems.",
      targetBranches: "ECE, EEE, CSE, IT, Mechatronics, Biomedical",
      badge: "CYBER-PHYSICAL",
      problems: [
        {
          code: "VTX-T4-01",
          title: "Non-Linear Sensor Noise Rejection & Closed-Loop Actuator Stabilization",
          challenge: "Ultrasonic, ToF, and IR sensors suffer from severe impulse spikes and environmental multipath noise, causing robotic servos and industrial valves to jitter violently. Build a real-time digital filtering and closed-loop control system with live telemetry plotting.",
          tierA: "Microcontroller prototype (Arduino/ESP32) reading noisy distance/environmental sensors, applying moving-average/median filtering, and driving a smooth actuator response.",
          tierB: "Adaptive Kalman or non-linear median-PID control loop rejecting deliberate impulse noise injection, paired with a real-time 60fps serial telemetry dashboard plotting raw vs. stabilized signals."
        },
        {
          code: "VTX-T4-02",
          title: "EV Battery Management System (BMS) with Thermal Runaway & Cell Balancing",
          challenge: "Lithium-ion battery packs fail when individual cells overcharge or overheat. Architect a smart BMS monitoring node that tracks per-cell voltage, current, and temperature gradients, isolating faulted cells in milliseconds.",
          tierA: "Multi-sensor monitoring prototype (or multi-channel hardware simulation) tracking voltage/temperature thresholds with automated relay/MOSFET cutoff and LCD/Web status alerts.",
          tierB: "State-of-Charge (SoC) & State-of-Health (SoH) estimation algorithm, active/passive cell-balancing logic, predictive thermal-runaway rate-of-rise (dT/dt) detection, and CAN/MQTT telemetry."
        },
        {
          code: "VTX-T4-03",
          title: "Decentralized V2X Highway Black-Spot & Fog Collision Avoidance Mesh",
          challenge: "On foggy highways and blind mountain hairpin bends without 4G/5G coverage, vehicles need instant peer-to-peer hazard warnings. Build a low-latency local wireless mesh (ESP-NOW / LoRa / RF / BLE) that broadcasts sudden braking, black-ice, or obstacle alerts between nodes.",
          tierA: "Two or more hardware nodes communicating hazard/distance states peer-to-peer without internet router dependency, triggering instant visual/buzzer warnings.",
          tierB: "Multi-hop packet relay with time-to-live (TTL) deduplication, RSSI/ToF proximity estimation, NFC/cryptographic node authentication, and live command-center map visualization."
        },
        {
          code: "VTX-T4-04",
          title: "Smart Grid Micro-Load Shedding & Power-Theft Tamper Detection Node",
          challenge: "Distribution transformers overload during peak hours and suffer revenue loss from illegal line tapping. Build an intelligent smart-energy node that detects differential current tampering and dynamically sheds non-critical loads before the main breaker trips.",
          tierA: "Smart energy meter prototype measuring load current/power, detecting overload conditions, and automatically switching priority vs. non-priority relay channels.",
          tierB: "Dual-point current differential tamper detection, power-factor/harmonic anomaly tracking, automated load-rebalancing state machine, and tamper-proof cloud/local audit logging."
        },
        {
          code: "VTX-T4-05",
          title: "Wearable Multi-Vital Patient Triage Node with Fall & Arrhythmia Alerting",
          challenge: "General hospital wards lack continuous ICU-grade monitoring for every bed. Build a low-power wearable telemetry patch/node that monitors heart-rate variability, SpO2, skin temperature, and sudden falls, alerting nurses immediately upon clinical deterioration.",
          tierA: "Sensor prototype (MAX30102 / MPU6050 / temperature) acquiring live vitals, filtering motion artifacts, and displaying real-time alerts on a nurse-station web dashboard.",
          tierB: "On-device Early Warning Score (EWS) state machine, store-and-forward offline buffer when Wi-Fi drops, ultra-low-power sleep scheduling, and multi-patient priority triage sorting."
        }
      ]
    },
    {
      id: "track_05",
      code: "SIH FORMAT",
      name: "Open Silicon & Hardware Innovation",
      domain: "SIH-Style Open Track",
      accentColor: "#7B2FFF",
      textColor: "#FFFFFF",
      borderColor: "border-[#7B2FFF]",
      description: "Pitch your own bold hardware or silicon-backed solution to a real-world industrial or societal problem.",
      targetBranches: "Open to All Engineering Domains (UG, PG & Research Scholars)",
      badge: "OPEN CHALLENGE",
      problems: [
        {
          code: "VTX-T5-01",
          title: "Open Innovation in Assistive Tech & Neuro-Rehabilitation Hardware",
          challenge: "Pitch and build any original hardware, embedded, or VLSI-backed assistive device empowering differently-abled individuals (speech-to-sign, smart prosthetics, eye-tracked wheelchair control, or tactile navigation).",
          tierA: "Working prototype or simulation demonstrating functional assistive feedback loop.",
          tierB: "Engineered hardware device with clinical/ergonomic metrics, low-latency actuation, and edge power optimization."
        },
        {
          code: "VTX-T5-02",
          title: "Open Innovation in Sustainable Tech, Water & Climate Hardware",
          challenge: "Pitch and build an original sensor-driven, IoT, or custom silicon accelerator system addressing water leakage/contamination, micro-climate forecasting, solar MPPT optimization, or e-waste sorting.",
          tierA: "Functional sensor ingestion node with calibrated telemetry and local action threshold alerting.",
          tierB: "Multi-sensor closed-loop control system, predictive environmental analytics, and field deployment reliability testing."
        },
        {
          code: "VTX-T5-03",
          title: "Open Innovation in Defense, Aerospace & Secure Communications",
          challenge: "Pitch and build an original hardware/software system for anti-drone detection, GPS-denied navigation, encrypted tactical comms, or radiation/fault-tolerant electronics.",
          tierA: "Simulated or breadboard communication prototype demonstrating secure peer-to-peer data transport.",
          tierB: "Ruggedized embedded node with cryptographic authentication, frequency-hopping/mesh resilience, and hardware fault-recovery."
        },
        {
          code: "VTX-T5-04",
          title: "Open Innovation in EDA Automation, Scripting & Verification Tooling",
          challenge: "Pitch and build a developer tool, Perl/TCL/Python automation script, automated testbench generator, waveform debugger, or linting engine that speeds up the IC/hardware design lifecycle.",
          tierA: "Automated script or tool capable of parsing Verilog/VHDL code and detecting syntax/latching errors.",
          tierB: "Comprehensive EDA workflow accelerator with automated test vector synthesis, CDC violation checks, or GUI waveform visualization."
        },
        {
          code: "VTX-T5-05",
          title: "Wildcard Disruptive Silicon & Cyber-Physical Systems",
          challenge: "Have a bold hardware, FPGA, ASIC, robotics, or edge-compute architecture that does not fit into the categories above? Pitch your blueprint, prove its engineering feasibility on Slide 5, and bring it to the 24-hour arena.",
          tierA: "End-to-end architectural proposal with block diagram, component specification, and initial simulation/mockup.",
          tierB: "Full hardware/RTL prototype with measured benchmarks, real-world stress test results, and production feasibility roadmap."
        }
      ]
    }
  ],

  roadmapTimeline: [
    {
      phase: "01",
      dates: "Now to 01 Dec 2026 (11:59 PM)",
      title: "Round 1 Free Team Registration",
      desc: "Form your team of 2 to 4 engineers. Choose your track from the 25 problem statements and lock in your registration for ₹0.",
      status: "ACTIVE"
    },
    {
      phase: "02",
      dates: "02 Dec (00:00) to 03 Dec (23:59)",
      title: "48-Hour Solution Blueprint Submission",
      desc: "Submit your mandatory 6-slide SIH-style presentation as a PDF directly via our portal. Validated by academic tier.",
      status: "UPCOMING"
    },
    {
      phase: "03",
      dates: "Post-Dec 3 Evaluation Window",
      title: "Jury Screening & Technical Evaluation",
      desc: "Evaluation panel reviews every blueprint on technical feasibility, block diagrams, and academic category standards.",
      status: "UPCOMING"
    },
    {
      phase: "04",
      dates: "Post-Evaluation Calling Window",
      title: "Finalist Direct Phone Calls & Seat Confirmation",
      desc: "Shortlisted team leaders are called directly by coordinators to confirm attendance and receive private Round 2 access.",
      status: "UPCOMING"
    },
    {
      phase: "05",
      dates: "15 Dec to 16 Dec 2026",
      title: "24-Hour Offline Finale @ SIET Coimbatore",
      desc: "Build your blueprint live on campus with surprise twists injected on Day 1. Final awards, trophies, and internships.",
      status: "UPCOMING"
    }
  ],

  finaleSchedule: [
    { time: "15 Dec · 08:30 AM", title: "Finalist Check-In & Arena Desk Allocation", badge: "CHECK-IN", slot: 1 },
    { time: "15 Dec · 09:30 AM", title: "Grand Inauguration & The Live Twist Reveal", badge: "CEREMONY", isPrimary: true },
    { time: "15 Dec · 10:30 AM", title: "24-Hour Build Clock Officially Starts", badge: "BUILD COMMENCES" },
    { time: "15 Dec · 01:30 PM", title: "Working Lunch Break", badge: "MEAL" },
    { time: "15 Dec · 04:30 PM", title: "Jury Audit 01: Architecture & Twist Integration Check", badge: "AUDIT 01", slot: 2 },
    { time: "15 Dec · 08:30 PM", title: "Dinner Break", badge: "MEAL" },
    { time: "16 Dec · 01:00 AM", title: "Jury Audit 02: 50% Milestone Verification + Midnight Snacks", badge: "MIDNIGHT AUDIT", slot: 3 },
    { time: "16 Dec · 08:00 AM", title: "Breakfast & Final Code/Hardware Freeze Prep", badge: "MEAL", slot: 4 },
    { time: "16 Dec · 10:30 AM", title: "24-Hour Clock Ends: Final Jury Demo & Pitching Round", badge: "FINAL DEFENSE", isPrimary: true },
    { time: "16 Dec · 12:30 PM", title: "Valedictory Ceremony, Awards & Certificates", badge: "AWARDS" }
  ],

  prizes: {
    highlight1: {
      badge: "EXCITING CASH PRIZE POOL",
      title: "Exciting Cash Prize Pool & Track Winners",
      desc: "Top-performing teams across tracks win official Veltraxx 2.0 Championship Trophies, Merit Honors, and Exciting Cash Prize Rewards."
    },
    highlight2: {
      badge: "INDUSTRY INTERNSHIP SPOTLIGHT",
      title: "Industry Mentorship & Internship Spotlight",
      desc: "Pitch directly to visiting semiconductor engineers and academic experts. Standout talent is fast-tracked for technical internships."
    },
    highlight3: {
      badge: "WINNER TROPHIES & MERIT HONOURS",
      title: "Winner Trophies & Merit Honours",
      desc: "Every Round 1 team submitting a valid PPT receives a Digital Certificate of Ideation; all Round 2 finalists receive Hardcopy Merit Certificates."
    }
  },

  contacts: {
    faculty: [
      { name: "Dr. P. Dhilipkumar", role: "ASP & HOD / Faculty Convener", phone: "+91-9629561731" }
    ],
    students: [
      { name: "R.A. Darshan", role: "Student Coordinator", phone: "+91-9751340838" },
      { name: "L.Subiksha", role: "Student Co-Coordinator", phone: "+91-9344705387" }
    ]
  }
};

export default eventConfig;

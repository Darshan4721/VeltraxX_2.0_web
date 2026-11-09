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
      department: "Dept of EE (VLSI Design & Tech) & Department of ECE",
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
      rulebookPdf: "/downloads/VELTRAXX_2.0_Rulebook.pdf"
    },
    whatsappGroupUrl: null, // Fill when official WhatsApp community link is generated
    payeeName: "VELTRAXX 2.0 SIET"
  },

  tracks: [
    {
      id: "track_01",
      code: "VLSI-A",
      name: "ASIC & Custom Silicon",
      domain: "VLSI Design & Semiconductor",
      accentColor: "#FFE500",
      textColor: "#111116",
      borderColor: "border-[#FFE500]",
      description: "RTL design, low-power architectures, memory controllers, and DFT/BIST verification systems.",
      badge: "CORE SILICON",
      problems: [
        { code: "VTX-T1-01", title: "Ultra-Low-Power RISC-V Cryptographic Accelerator Core" },
        { code: "VTX-T1-02", title: "Multi-Port Synchronous SRAM Memory Controller with Built-In Self-Test" },
        { code: "VTX-T1-03", title: "Configurable AXI4-to-APB Bridge with Clock Domain Crossing Synchronization" },
        { code: "VTX-T1-04", title: "Hardware Neural Processing Unit for 8-bit Quantized Matrix Multiply" },
        { code: "VTX-T1-05", title: "Scan Insertion & ATPG Fault-Tolerant ALU Subsystem for 28nm ASIC" }
      ]
    },
    {
      id: "track_02",
      code: "VLSI-B",
      name: "FPGA & Reconfigurable Systems",
      domain: "Hardware Acceleration & Systems",
      accentColor: "#00E5FF",
      textColor: "#111116",
      borderColor: "border-[#00E5FF]",
      description: "Hardware accelerators, high-speed streaming interfaces, DSP pipelines, and FPGA prototyping.",
      badge: "RECONFIGURABLE",
      problems: [
        { code: "VTX-T2-01", title: "High-Throughput Real-Time 1024-Point FFT Pipeline on Artix-7/Zynq" },
        { code: "VTX-T2-02", title: "Real-Time Video Edge Detection & Frame Buffer over HDMI/DVI" },
        { code: "VTX-T2-03", title: "Hardware-Accelerated AES-GCM High-Bandwidth Ethernet Stream Decryptor" },
        { code: "VTX-T2-04", title: "CAN-FD to Gigabit Ethernet Telemetry Gateway in Hardware RTL" },
        { code: "VTX-T2-05", title: "PID Motion Controller with Microsecond Motor Feedback Resolution" }
      ]
    },
    {
      id: "track_03",
      code: "AI/CSE",
      name: "Edge AI & Vision Systems",
      domain: "Applied Intelligence & Embedded ML",
      accentColor: "#FF2E93",
      textColor: "#FFFFFF",
      borderColor: "border-[#FF2E93]",
      description: "TinyML, hardware-aware neural networks, smart diagnostics, and real-time edge computer vision.",
      badge: "INTELLIGENCE",
      problems: [
        { code: "VTX-T3-01", title: "Real-Time Driver Drowsiness & Gaze Anomaly Detection on Microcontroller" },
        { code: "VTX-T3-02", title: "Smart Acoustic Vibration Fault Classifier for Industrial Rotating Motors" },
        { code: "VTX-T3-03", title: "TinyML ECG Arrhythmia Monitor with Low Latency Alert Trigger" },
        { code: "VTX-T3-04", title: "Low-Power Vision-Based Automated Surface Scratch Inspector" },
        { code: "VTX-T3-05", title: "Thermal Hotspot Anomaly Predictor for Battery Energy Storage Units" }
      ]
    },
    {
      id: "track_04",
      code: "CSE/ECE/EEE",
      name: "Smart IoT & Cyber-Physical Tech",
      domain: "Connected Systems & Automation",
      accentColor: "#B6FF00",
      textColor: "#111116",
      borderColor: "border-[#B6FF00]",
      description: "Highway safety, industrial telemetry, smart BMS automation, and integrated sensor-cloud systems.",
      badge: "CONNECTED TECH",
      problems: [
        { code: "VTX-T4-01", title: "Vehicle-to-Infrastructure Collision Avoidance Warning System" },
        { code: "VTX-T4-02", title: "Industrial Smart Energy Profiler with Automated Load Shedding Relay" },
        { code: "VTX-T4-03", title: "Smart Li-ion Battery Management System with State-of-Charge Forecasting" },
        { code: "VTX-T4-04", title: "Automated Precision Cold-Chain Vaccine Temperature Integrity Vault" },
        { code: "VTX-T4-05", title: "Sub-GHz Multi-Node Autonomous Farm Irrigation Automation Mesh" }
      ]
    },
    {
      id: "track_05",
      code: "SIH FORMAT",
      name: "Open Innovation",
      domain: "Hardware-Backed Solutions",
      accentColor: "#7B2FFF",
      textColor: "#FFFFFF",
      borderColor: "border-[#7B2FFF]",
      description: "Pitch your own bold hardware or silicon-backed solution to a real-world industrial or societal problem.",
      badge: "OPEN SIH FORMAT",
      problems: [
        { code: "VTX-T5-01", title: "Autonomous Assistive Hardware Navigation Aid for the Visually Impaired" },
        { code: "VTX-T5-02", title: "Portable Rapid Soil Nutrient & Heavy Metal Sensor with Wireless Dashboard" },
        { code: "VTX-T5-03", title: "Smart Railway Track Crack & Obstacle Detection Robot with Live Geotagging" },
        { code: "VTX-T5-04", title: "Disaster Zone Resilient Off-Grid Mesh Emergency Communicator" },
        { code: "VTX-T5-05", title: "Self-Sustaining Energy Harvesting Sensor Node for Remote Infrastructure" }
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
      title: "Winner Trophies, Merit Honours & OD Support",
      desc: "Every Round 1 team submitting a valid PPT receives a Digital Certificate of Ideation; all Round 2 finalists receive Hardcopy OD documentation."
    }
  },

  contacts: {
    faculty: [
      { name: "Dr. P. Dhilipkumar", role: "ASP & HOD / Faculty Convener", phone: "+91-9629561731" },
      { name: "Mrs. P. Prisilla Sophia", role: "Assistant Professor / Faculty Coordinator", phone: "+91-9952441283" },
      { name: "Mrs. T. Renita Pearlin", role: "Assistant Professor / Faculty Coordinator", phone: "+91-9629393089" },
      { name: "Mrs. C. Prema", role: "Assistant Professor / Faculty Coordinator", phone: "+91-9994093811" },
      { name: "Mrs. R. Vasanthi", role: "Assistant Professor / Faculty Coordinator", phone: "+91-9942346426" }
    ],
    students: [
      { name: "R.A. Darshan", role: "Student Coordinator", phone: "+91-9751340838", email: "darshan@veltraxx.in" },
      { name: "M. Kavya", role: "Student Co-Coordinator", phone: "+91-9443065492", email: "kavya@veltraxx.in" }
    ]
  }
};

export default eventConfig;

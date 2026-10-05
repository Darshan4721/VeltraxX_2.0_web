/**
 * VELTRAXX 2.0 — SINGLE AUTHORITATIVE SOURCE OF TRUTH
 * Copied and synchronized directly from docs/specs/eventConfig.json.
 * 
 * RULE: Never hardcode event details (dates, fees, capacity, prizes, contacts)
 * inside UI components. Always import and consume from this file.
 */

export const eventConfig = {
  event: {
    name: "VELTRAXX 2.0",
    legacyName: "VELTRAXX’26",
    type: "24-Hour VLSI Engineering Hackathon",
    level: "National Level",
    mode: "100% Offline (In-Person Event)",
    eyebrow: "NATIONAL-LEVEL 24-HOUR VLSI & HARDWARE HACKATHON · C2S INITIATIVE",
    thesis: "Architect the future of silicon. 24 hours of non-stop VLSI design, synthesis, and hardware validation under industry constraints.",
    dates: {
      display: "28–29 August 2026",
      startDate: "2026-08-28T10:00:00+05:30",
      endDate: "2026-08-29T10:00:00+05:30",
      registrationOpen: "2026-08-10T00:00:00+05:30",
      registrationClose: "2026-08-25T23:59:59+05:30",
      problemRelease: "2026-08-26T10:00:00+05:30"
    },
    durationHours: 24,
    institution: {
      name: "Sri Shakthi Institute of Engineering and Technology",
      shortName: "SIET",
      department: "VLSI Faculty Team & Department of ECE",
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
    feeINR: 1000,
    feePerMemberINR: 250,
    maxTeams: 35,
    teamSize: 4,
    roles: {
      leaderCount: 1,
      participantCount: 3
    },
    allowedInstitutions: "Intra-college and inter-college allowed",
    eligibleCohorts: [
      "Bachelor's students (B.E. / B.Tech / B.Sc)",
      "Master's students (M.E. / M.Tech / M.Sc)",
      "Research Scholars (Ph.D. / MS)",
      "Working semiconductor professionals"
    ],
    paymentMethod: "UPI QR Scan & Screenshot Receipt Upload",
    receiptBucket: "receipts",
    maxReceiptSizeMB: 2
  },
  challenge: {
    format: "Unified Industry Challenge (0 Tracks)",
    description: "Industry-oriented problem statement revealed 2 days prior to event to paid teams.",
    byod: {
      laptops: true,
      edaLicenses: true,
      hardwareBoards: true
    },
    provided: {
      workspace: true,
      wifi: true,
      power: true,
      catering: true
    }
  },
  prizes: {
    winnerCount: 1,
    runnerUpCount: 0,
    grandPrize: {
      title: "Sole Winning Team Champion",
      benefits: [
        "Direct Industrial Internship Opportunity for all 4 team members in a leading VLSI company",
        "Free participation in the forthcoming Synopsys hands-on workshop (valued at ₹1,000/member, ₹4,000/team)",
        "VELTRAXX 2.0 Silicon Championship Trophy"
      ]
    },
    runnerUpPolicy: "None. Only the best takes the prize.",
    cashPool: null,
    certificates: "National-level certificates from MEMS for all verified participants"
  },
  contacts: {
    faculty: [
      { name: "Dr. P. DhilipKumar", role: "ASP & HOD", phone: "+91-9629561731" },
      { name: "Mrs. T. Renita Pearlin", role: "AP", phone: "+91-9629393089" },
      { name: "Mrs. C. Prema", role: "AP", phone: "+91-9994093811" },
      { name: "Mrs. P. Prisilla Sophia", role: "AP", phone: "+91-9952441283" },
      { name: "Mrs. R. Vasanthi", role: "AP", phone: "+91-9942346426" }
    ],
    students: [
      { name: "R.A. Darshan", role: "Student Coordinator", phone: "+91-9751340838" },
      { name: "M. Kavya", role: "Student Coordinator", phone: "+91-9443065492" }
    ]
  },
  schedule: [
    { id: "d1-1", day: 1, time: "09:30 AM", title: "Student Reporting & Registration Check-In", badge: "REPORTING", isAttendance: true, slot: 1 },
    { id: "d1-2", day: 1, time: "10:15 AM", title: "Hackathon Officially Starts (24-Hour Timer Ignites)", badge: "COMMENCES", isPrimary: true },
    { id: "d1-3", day: 1, time: "11:45 AM – 12:30 PM", title: "Inauguration Ceremony", badge: "CEREMONY" },
    { id: "d1-4", day: 1, time: "01:40 PM", title: "Lunch Break", badge: "MEAL" },
    { id: "d1-5", day: 1, time: "06:00 PM", title: "Evening Refreshments", badge: "REFRESHMENTS", isAttendance: true, slot: 2 },
    { id: "d1-6", day: 1, time: "07:40 PM", title: "Dinner", badge: "MEAL" },
    { id: "d2-1", day: 2, "time": "01:00 AM", title: "Midnight Fuel & Refreshments", badge: "MIDNIGHT", isAttendance: true, slot: 3 },
    { id: "d2-2", day: 2, "time": "08:00 AM", title: "Breakfast", badge: "MEAL", isAttendance: true, slot: 4 },
    { id: "d2-3", day: 2, "time": "09:30 AM", title: "Chief Guest Arrival & Keynote", badge: "DIGNITARIES" },
    { id: "d2-4", day: 2, "time": "10:00 AM – 11:00 AM", title: "Project Validation & Final Judging", badge: "EVALUATION", isPrimary: true }
  ]
};

export default eventConfig;

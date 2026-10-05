# VELTRAXX 2.0 — Authoritative Event Configuration
**Document Identifier:** `docs/VELTRAXX_2.0_EVENT_CONFIG.md`  
**Status:** ACTIVE BASELINE (OFFICIALLY ADOPTED FROM 1.0 AS FINAL PER OWNER INSTRUCTION)  
**Parent System:** [`docs/specs/VELTRAXX_2.0_DESIGN_SYSTEM.md`](file:///D:/tmp/veltraxx_2.o/docs/specs/VELTRAXX_2.0_DESIGN_SYSTEM.md)  
**Historical Ledger:** [`docs/legacy/VELTRAXX_LEGACY_EVENT_KNOWLEDGE.md`](file:///D:/tmp/veltraxx_2.o/docs/legacy/VELTRAXX_LEGACY_EVENT_KNOWLEDGE.md)  

---

## 1. Operating Principle: Single Source of Truth (`CONFIGURATION → COMPONENTS → UI`)

Per the Owner's directive:
> *"keep the info exact as the version 1.0, everything same, when we need to change I will say so... treat this as final event info and make the web page around it."*

To protect against future rework and ensure that any eventual adjustment (e.g. HOD changing team capacity, registration deadline, or adding a second prize) requires changing **only one file**, the entire application consumes this centralized configuration. No components or templates will have scattered hardcoded event strings.

---

## 2. Event Configuration Matrix (1.0 Baseline Adopted for 2.0)

| Field Key | 2.0 Configured Value | Provenance / 1.0 Source Reference | Status |
|---|---|---|---|
| `eventName` | **VELTRAXX’26** (Display: **VELTRAXX 2.0**) | `event_info.txt:3`, `Home.jsx:180` | **CONFIRMED BASELINE** |
| `eventType` | **24-Hour VLSI Engineering Hackathon** | `event_info.txt:4`, `Home.jsx:182` | **CONFIRMED BASELINE** |
| `eventLevel` | **National Level** | `event_info.txt:5`, `Home.jsx:179` | **CONFIRMED BASELINE** |
| `eventMode` | **100% Offline (In-Person Event)** | `Rules.jsx:61` | **CONFIRMED BASELINE** |
| `eventDates` | **28–29 August 2026** | `event_info.txt:6`, `Rules.jsx:64` | **CONFIRMED BASELINE** |
| `durationHours` | **24 Hours Non-Stop** | `event_info.txt:7`, `Home.jsx:188` | **CONFIRMED BASELINE** |
| `registrationFee` | **₹1,000 Flat Per Team** (₹250/member) | `event_info.txt:8`, `Rules.jsx:75` | **CONFIRMED BASELINE** |
| `teamSize` | **Exactly 4 Members** (1 Leader + 3 Participants) | `event_info.txt:9`, `Rules.jsx:74`, `supabase_schema.sql:53` | **CONFIRMED BASELINE** |
| `maxTeamCapacity` | **Strictly 35 Teams** (140 participants) | `Register.jsx:253`, `supabase_schema.sql` | **CONFIRMED BASELINE** |
| `institution` | **Sri Shakthi Institute of Engineering and Technology (SIET)** | `Home.jsx:184`, `Rules.jsx:62` | **CONFIRMED BASELINE** |
| `venue` | **SIET VLSI Research Lab & Main Auditorium, Coimbatore** | `event_info.txt:15`, `about vlsi team.txt:30` | **CONFIRMED BASELINE** |
| `problemStatementRelease` | **Revealed 2 Days Prior to Event (Aug 26) to Paid Teams** | `event_info.txt:12, 36-37`, `Rules.jsx:95` | **CONFIRMED BASELINE** |
| `tracksCount` | **0 Tracks (One Unified Industry Challenge)** | `event_info.txt:12`, `Rules.jsx:94-98` | **CONFIRMED BASELINE** |
| `byodEda` | **Participants bring their own EDA software & licenses** | `event_info.txt:13, 25`, `Rules.jsx:87` | **CONFIRMED BASELINE** |
| `byodHardware` | **Participants bring their own laptops & FPGA boards** | `event_info.txt:14, 25`, `Rules.jsx:87` | **CONFIRMED BASELINE** |
| `organizerProvisions` | **Dedicated Workspace, High-Speed Wi-Fi, Uninterrupted Power, Full Meals & Refreshments** | `event_info.txt:15-18`, `Rules.jsx:86` | **CONFIRMED BASELINE** |
| `winnerPrizes` | **Direct Industrial Internship for all 4 team members + Free Synopsys Workshop Grant (valued at ₹4,000/team)** | `event_info.txt:23-24`, `Rules.jsx:115-116` | **CONFIRMED BASELINE** |
| `runnerUpPrizes` | **None ("Only the best takes the prize")** | `event_info.txt:21`, `Rules.jsx:120` | **CONFIRMED BASELINE** |
| `cashPrizePool` | **Zero Cash (Pure Career Internship & Workshop Benefits)** | `event_info.txt:20-21`, `Rules.jsx:110-120` | **CONFIRMED BASELINE** |
| `certificates` | **National Participation Certificates issued from MEMS** | `event_info.txt:22`, `Rules.jsx:123` | **CONFIRMED BASELINE** |
| `jury` | **Practicing Industry Professionals from Semiconductor Firms** | `event_info.txt:19`, `Rules.jsx:97` | **CONFIRMED BASELINE** |

---

## 3. Personnel & Contact Registry

### Faculty Leadership (`event_info.txt:64-72`, `App.jsx:Footer`)
1. **Dr. P. DhilipKumar, ASP & HOD** — `+91-9629561731`
2. **Mrs. T. Renita Pearlin, AP** — `+91-9629393089`
3. **Mrs. C. Prema, AP** — `+91-9994093811`
4. **Mrs. P. Prisilla Sophia, AP** — `+91-9952441283`
5. **Mrs. R. Vasanthi, AP** — `+91-9942346426`

### Student Coordinators (`event_info.txt:77-78`, `Register.jsx:296-302`)
1. **R.A. Darshan** — `+91-9751340838`
2. **M. Kavya** — `+91-9443065492`

---

## 4. Master 24-Hour Itinerary (`Home.jsx:23-111`)

```text
DAY 1 (FRIDAY, AUGUST 28, 2026)
├── 09:30 AM · Slot 1 Attendance: Participant Reporting, ID Check, Table Setup
├── 10:15 AM · Launch Ignition: 24-Hour Arena Countdown Timer Starts
├── 11:45 AM – 12:30 PM · Inauguration Ceremony: Keynote & Competition Briefing
├── 01:40 PM · Lunch Break: Campus Dining & Networking
├── 06:00 PM · Slot 2 Attendance: Evening Refreshments, Tea/Coffee, Mentor Sync
└── 07:40 PM · Dinner Break: Strategy Sync Before Overnight Sprint

DAY 2 (SATURDAY, AUGUST 29, 2026)
├── 01:00 AM · Slot 3 Attendance: Midnight Fuel & Late-Night Coding Sprint
├── 08:00 AM · Slot 4 Attendance: Morning Breakfast Reload & Final Synthesis
├── 09:30 AM · Dignitary Arrival: Chief Guest & Jury Panel Introduction
└── 10:00 AM – 11:00 AM · Project Validation & Final Evaluation (Jury Q&A)
```

---

## 5. Machine-Readable Configuration Schema

This structured data model is mirrored in `eventConfig.json` (and `src/config/eventConfig.js`), allowing the entire frontend and backend to stay perfectly in sync:

```json
{
  "event": {
    "name": "VELTRAXX 2.0",
    "legacyName": "VELTRAXX’26",
    "type": "24-Hour VLSI Engineering Hackathon",
    "level": "National Level",
    "mode": "100% Offline (In-Person Event)",
    "dates": {
      "display": "28–29 August 2026",
      "startDate": "2026-08-28T10:00:00+05:30",
      "endDate": "2026-08-29T10:00:00+05:30",
      "registrationOpen": "2026-08-10T00:00:00+05:30",
      "registrationClose": "2026-08-25T23:59:59+05:30",
      "problemRelease": "2026-08-26T10:00:00+05:30"
    },
    "durationHours": 24,
    "institution": {
      "name": "Sri Shakthi Institute of Engineering and Technology",
      "shortName": "SIET",
      "campus": "L&T Bypass Road, Chinniyampalayam Post, Coimbatore, Tamil Nadu 641062",
      "lab": "SIET VLSI Research Lab & Main Auditorium"
    }
  },
  "registration": {
    "feeINR": 1000,
    "feePerMemberINR": 250,
    "maxTeams": 35,
    "teamSize": 4,
    "roles": {
      "leaderCount": 1,
      "participantCount": 3
    },
    "allowedInstitutions": "Intra-college and inter-college allowed",
    "eligibleCohorts": [
      "Bachelor's students (B.E. / B.Tech / B.Sc)",
      "Master's students (M.E. / M.Tech / M.Sc)",
      "Research Scholars (Ph.D. / MS)",
      "Working semiconductor professionals"
    ],
    "paymentMethod": "UPI QR Scan & Screenshot Receipt Upload",
    "receiptBucket": "receipts",
    "maxReceiptSizeMB": 2
  },
  "challenge": {
    "format": "Unified Industry Challenge (0 Tracks)",
    "description": "Industry-oriented problem statement revealed 2 days prior to event to paid teams.",
    "byod": {
      "laptops": true,
      "edaLicenses": true,
      "hardwareBoards": true
    },
    "provided": {
      "workspace": true,
      "wifi": true,
      "power": true,
      "catering": true
    }
  },
  "prizes": {
    "winnerCount": 1,
    "runnerUpCount": 0,
    "grandPrize": {
      "title": "Sole Winning Team Champion",
      "benefits": [
        "Direct Industrial Internship Opportunity for all 4 team members in a leading VLSI company",
        "Free participation in the forthcoming Synopsys hands-on workshop (valued at ₹1,000/member, ₹4,000/team)",
        "VELTRAXX 2.0 Silicon Championship Trophy"
      ]
    },
    "runnerUpPolicy": "None. Only the best takes the prize.",
    "cashPool": null,
    "certificates": "National-level certificates from MEMS for all verified participants"
  }
}
```

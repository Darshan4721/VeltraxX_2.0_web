/**
 * VELTRAXX 2.0 - ACADEMIC DEGREE & DEPARTMENT TAXONOMY
 * Grounded in official programmes offered across PSG Institutions
 * (PSG College of Technology, PSG College of Arts & Science, PSG Polytechnic College)
 * plus host specialization (EE - VDT / VLSI Design & Technology).
 *
 * Strict Anti-Slop: Zero em-dashes in visible copy.
 */

export const LEVEL_OPTIONS = ["UG", "PG", "Research scholar", "Working professional"];

export const DEGREES_BY_LEVEL = {
  "UG": [
    "B.E.",
    "B.Tech",
    "B.Sc",
    "BCA",
    "B.Com",
    "BBA",
    "B.A.",
    "B.Voc",
    "M.Sc (5-Year Integrated)",
    "Diploma",
    "Other"
  ],
  "PG": [
    "M.E.",
    "M.Tech",
    "M.Sc",
    "M.Sc (5-Year Integrated)",
    "MCA",
    "MBA",
    "M.Com",
    "M.A.",
    "MSW",
    "M.Voc",
    "Other"
  ],
  "Research scholar": [
    "Ph.D.",
    "M.S. (By Research)",
    "M.Phil.",
    "Other"
  ]
};

export const DEPARTMENTS_BY_DEGREE = {
  "B.E.": [
    "Automobile Engineering",
    "Biomedical Engineering",
    "Civil Engineering",
    "Computer Science and Engineering (CSE)",
    "Computer Science and Engineering (AI & ML)",
    "Electrical and Electronics Engineering (EEE)",
    "Electronics and Communication Engineering (ECE)",
    "Electronics Engineering (VLSI Design & Technology)",
    "Instrumentation and Control Engineering (ICE)",
    "Mechanical Engineering",
    "Mechanical Engineering (Sandwich)",
    "Mechatronics",
    "Metallurgical Engineering",
    "Production Engineering",
    "Robotics and Automation",
    "Other"
  ],
  "B.Tech": [
    "Artificial Intelligence and Data Science (AI & DS)",
    "Biotechnology",
    "Computer Science and Business Systems (CSBS)",
    "Computer Science and Engineering (CSE)",
    "Electrical and Electronics Engineering (EEE)",
    "Electronics and Communication Engineering (ECE)",
    "Electronics Engineering (VLSI Design & Technology)",
    "Fashion Technology",
    "Information Technology (IT)",
    "Mechanical Engineering",
    "Robotics and Automation",
    "Textile Technology",
    "Other"
  ],
  "B.Sc": [
    "Applied Science",
    "Biochemistry",
    "Biotechnology",
    "Botany",
    "Catering Science and Hotel Management",
    "Chemistry",
    "Computer Science",
    "Computer Science with Data Analytics",
    "Computer Systems and Design",
    "Computer Technology",
    "Costume Design and Fashion",
    "Electronics",
    "Information Technology",
    "Mathematics",
    "Mathematics with Computer Applications",
    "Microbiology",
    "Nutrition, Food Service Management and Dietetics",
    "Physics",
    "Psychology",
    "Statistics",
    "Visual Communication",
    "Zoology",
    "Other"
  ],
  "BCA": [
    "Computer Applications",
    "Other"
  ],
  "B.Com": [
    "Commerce (General)",
    "Accounting and Finance",
    "Banking and Insurance",
    "Business Analytics",
    "Business Process Services (BPS)",
    "Computer Applications",
    "Corporate Secretaryship",
    "Cost and Management Accounting",
    "e-Commerce",
    "Financial System",
    "Foreign Trade",
    "Professional Accounting",
    "Retail Marketing",
    "Other"
  ],
  "BBA": [
    "Business Administration (General)",
    "Information Systems (IS)",
    "Logistics",
    "Retail Management",
    "Other"
  ],
  "B.A.": [
    "Carnatic Music",
    "Economics",
    "English",
    "Sociology",
    "Tamil",
    "Other"
  ],
  "B.Voc": [
    "Banking, Stock and Insurance",
    "Food Processing Technology",
    "Hospitality Management",
    "Networking and Mobile Application",
    "Other"
  ],
  "Diploma": [
    "Apparel Technology",
    "Artificial Intelligence and Machine Learning (AI & ML)",
    "Automobile Engineering",
    "Computer Engineering",
    "Computer Networking",
    "Design and Drafting",
    "Electrical and Electronics Engineering (EEE)",
    "Electronics and Communication Engineering (ECE)",
    "Information Technology (IT)",
    "Mechanical Engineering",
    "Mechanical Engineering (CAD)",
    "Mechanical Engineering (Foundry)",
    "Mechatronics",
    "Textile Technology",
    "Other"
  ],
  "M.E.": [
    "Automotive Engineering",
    "Biometrics and Cybersecurity",
    "Computer Science and Engineering",
    "Control Systems",
    "Embedded & Real-Time Systems",
    "Engineering Design",
    "Industrial Engineering",
    "Industrial Metallurgy",
    "Manufacturing Engineering",
    "Power Electronics and Drives",
    "Structural Engineering",
    "VLSI Design",
    "Other"
  ],
  "M.Tech": [
    "Biotechnology",
    "Computer Science and Engineering",
    "Data Science & AI",
    "Nano Science and Technology",
    "Textile Technology",
    "VLSI Design & Embedded Systems",
    "Other"
  ],
  "M.Sc": [
    "Applied Mathematics",
    "Applied Psychology",
    "Biochemistry",
    "Bioinformatics",
    "Biotechnology",
    "Botany",
    "Chemistry",
    "Computer Science",
    "Data Science",
    "Electronic Media",
    "Environmental Science",
    "Foods and Nutrition",
    "Mathematics",
    "Microbiology",
    "Physics",
    "Statistics",
    "Zoology",
    "Other"
  ],
  "M.Sc (5-Year Integrated)": [
    "Computational Finance",
    "Cyber Security",
    "Data Science",
    "Fashion Design & Merchandising",
    "Software Systems",
    "Theoretical Computer Science",
    "Other"
  ],
  "MCA": [
    "Computer Applications",
    "Other"
  ],
  "MBA": [
    "Management (General / Full-Time)",
    "Waste Management & Social Entrepreneurship",
    "Other"
  ],
  "M.Com": [
    "Commerce (General)",
    "Computer Applications",
    "Corporate Secretaryship",
    "International Business",
    "Other"
  ],
  "M.A.": [
    "Economics",
    "English",
    "Journalism and Mass Communication",
    "Tamil",
    "Other"
  ],
  "MSW": [
    "Social Work",
    "Other"
  ],
  "M.Voc": [
    "Food Processing",
    "Other"
  ],
  "Ph.D.": [
    "Automobile Engineering",
    "Biochemistry",
    "Biomedical Engineering",
    "Biotechnology",
    "Chemistry",
    "Civil Engineering",
    "Commerce",
    "Computer Science",
    "Computer Science and Engineering",
    "Economics",
    "Electrical and Electronics Engineering (EEE)",
    "Electronics and Communication Engineering (ECE)",
    "English",
    "Information Technology (IT)",
    "Management Studies",
    "Mathematics",
    "Mechanical Engineering",
    "Metallurgical Engineering",
    "Microbiology",
    "Physics",
    "Production Engineering",
    "Robotics and Automation",
    "Textile Technology",
    "VLSI Design & Embedded Systems",
    "Other"
  ],
  "M.S. (By Research)": [
    "Computer Science and Engineering",
    "Electrical and Electronics Engineering (EEE)",
    "Electronics and Communication Engineering (ECE)",
    "Information Technology (IT)",
    "Mechanical Engineering",
    "VLSI Design",
    "Other"
  ],
  "M.Phil.": [
    "Commerce",
    "Computer Science",
    "Economics",
    "English",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biotechnology",
    "Other"
  ],
  "Other": [
    "Other"
  ]
};

export function getDegreesForLevel(level) {
  return DEGREES_BY_LEVEL[level] || DEGREES_BY_LEVEL["UG"];
}

export function getDepartmentsForDegree(degree) {
  if (!degree) return [];
  return DEPARTMENTS_BY_DEGREE[degree] || ["Other"];
}

const LEGACY_DEPT_MAP = {
  "ECE": "Electronics and Communication Engineering (ECE)",
  "EEE": "Electrical and Electronics Engineering (EEE)",
  "VLSI": "Electronics Engineering (VLSI Design & Technology)",
  "CSE": "Computer Science and Engineering (CSE)",
  "IT": "Information Technology (IT)",
  "AI&DS": "Artificial Intelligence and Data Science (AI & DS)",
  "Mechanical": "Mechanical Engineering",
  "Mechatronics": "Mechatronics"
};

/**
 * Resolves old localStorage draft short codes (e.g. "ECE", "CSE") or custom values cleanly.
 */
export function resolveDepartmentDraftCompatibility(degree, rawDepartment) {
  if (!rawDepartment) return { department: "", customDepartment: "" };
  const allowed = getDepartmentsForDegree(degree);
  if (allowed.includes(rawDepartment)) {
    return { department: rawDepartment, customDepartment: "" };
  }
  const mapped = LEGACY_DEPT_MAP[rawDepartment];
  if (mapped && allowed.includes(mapped)) {
    return { department: mapped, customDepartment: "" };
  }
  return { department: rawDepartment === "Other" ? "Other" : (allowed.includes("Other") ? "Other" : ""), customDepartment: rawDepartment === "Other" ? "" : rawDepartment };
}

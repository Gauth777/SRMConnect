export const USER_STORAGE_KEY = "campusconnect_user";
export const POSTS_STORAGE_KEY = "campusconnect_posts";

export const FACULTY_DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "HOD",
  "Dean",
  "Lecturer",
  "Visiting Faculty",
] as const;

export const FACULTY_FA_OR_AA = [
  "Faculty Advisor (FA)",
  "Academic Advisor (AA)",
  "Both",
  "Neither",
] as const;

export const FACULTY_CAMPUSES = [
  "Kattankulathur (KTR)",
  "Ramapuram",
  "Vadapalani",
  "Tiruchirappalli (Trichy)",
  "NCR Delhi",
  "Sonepat",
  "Amaravati",
] as const;

export const FACULTY_DEPARTMENTS = [
  "CSE",
  "ECE",
  "MECH",
  "CIVIL",
  "EEE",
  "IT",
  "Biotech",
  "Chemical",
  "Mathematics",
  "Physics",
  "Management",
  "Others",
] as const;

export const DOMAIN_SUGGESTIONS = [
  "Artificial Intelligence & ML",
  "Deep Learning",
  "Computer Vision",
  "Natural Language Processing",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "IoT",
  "Blockchain",
  "Robotics & Automation",
  "Quantum Computing",
  "AR / VR",
  "Full Stack Development",
  "Web Development",
  "Mobile Development",
  "DevOps",
  "Software Engineering",
  "Computer Networks",
  "Database Systems",
  "VLSI & Embedded Systems",
  "Signal Processing",
  "Bioinformatics",
  "Renewable Energy",
  "Nanotechnology",
  "Mathematics",
  "Physics",
] as const;

export const CURRENT_SUBJECT_SUGGESTIONS = [
  "Data Structures & Algorithms",
  "Operating Systems",
  "Computer Networks",
  "Database Management",
  "Software Engineering",
  "Compiler Design",
  "Machine Learning",
  "Deep Learning",
  "Computer Vision",
  "NLP",
  "Cloud Computing",
  "Cybersecurity",
  "Web Technologies",
  "Object Oriented Programming",
  "Problem Solving",
  "Digital Electronics",
  "Signals & Systems",
  "VLSI Design",
  "Engineering Mathematics",
  "Applied Physics",
  "Engineering Chemistry",
  "Robotics",
  "Embedded Systems",
  "IoT",
  "Blockchain",
] as const;

export const TECH_SKILL_SUGGESTIONS = [
  "Python",
  "MATLAB",
  "R",
  "TensorFlow",
  "PyTorch",
  "ROS",
  "React",
  "Node.js",
  "AWS",
  "Docker",
  "Git",
  "Java",
  "C++",
  "Figma",
  "Tableau",
  "Power BI",
  "Excel",
  "LaTeX",
] as const;

export const POST_TYPE_OPTIONS = [
  { value: "project", label: "🚀 Project" },
  { value: "hackathon", label: "🏆 Hackathon" },
  { value: "research", label: "🔬 Research" },
  { value: "inhouse", label: "💼 Inhouse" },
  { value: "guest-lecture", label: "🎤 Guest Lect." },
  { value: "workshop", label: "🛠️ Workshop" },
] as const;

export const PROJECT_DOMAIN_OPTIONS = [
  "AI & ML",
  "Computer Vision",
  "NLP",
  "Data Science",
  "Web Development",
  "Full Stack",
  "Mobile Development",
  "Cybersecurity",
  "Cloud Computing",
  "DevOps",
  "Blockchain",
  "IoT",
  "Robotics",
  "Quantum Computing",
  "Research & Academia",
  "VLSI",
  "Signal Processing",
  "Other",
] as const;

export const PROJECT_MODE_OPTIONS = ["Online", "Offline", "Hybrid"] as const;

export const SKILL_LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Any Level"] as const;

interface DocOption {
  value: string;
  label: string;
  locked?: boolean;
}

export const REQUIRED_DOC_OPTIONS: DocOption[] = [
  { value: "resume", label: "Resume (PDF)", locked: true },
  { value: "cover-letter", label: "Cover Letter" },
  { value: "github-link", label: "GitHub Link" },
  { value: "portfolio-link", label: "Portfolio Link" },
  { value: "project-proposal", label: "Project Proposal" },
  { value: "other-document", label: "Other Document" },
];

export interface FacultyUser {
  role: "faculty";
  profileComplete: boolean;
  loggedIn: boolean;
  empId?: string;
  name?: string;
  email?: string;
  designation?: string;
  campus?: string;
  department?: string;
  faOrAa?: string;
  experience?: number;
  domains?: string[];
  currentSubjects?: string[];
  previousSubjects?: string[];
  skills?: string[];
}

export interface FacultyPostRecord {
  id: number;
  type: "project" | "hackathon" | "research";
  postType: string;
  faculty: string;
  dept: string;
  campus: string;
  time: string;
  title: string;
  description: string;
  skills: string[];
  domain: string;
  duration: string;
  slots: number;
  remaining: number;
  deadline: string;
  mode: string;
  skillLevel: string;
  compatibility: number;
  status: "open" | "closed";
  createdAt: string;
  requiredDocs: string[];
  additionalRequirements: string;
}

export function safeParseJson<T>(rawValue: string | null, fallback: T): T {
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export function readFacultyUser(): FacultyUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  return safeParseJson<FacultyUser | null>(window.localStorage.getItem(USER_STORAGE_KEY), null);
}

export function readFacultyPosts(): FacultyPostRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  return safeParseJson<FacultyPostRecord[]>(window.localStorage.getItem(POSTS_STORAGE_KEY), []);
}

export function writeFacultyUser(user: FacultyUser): void {
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function writeFacultyPosts(posts: FacultyPostRecord[]): void {
  window.localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
}

export function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

  return initials.slice(0, 2) || "FC";
}

export function getImageCompletionPercent(filledSections: number, totalSections: number): number {
  if (totalSections <= 0) {
    return 0;
  }

  return Math.round((filledSections / totalSections) * 100);
}

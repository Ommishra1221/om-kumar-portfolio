/**
 * Single source of truth for every real detail on the site.
 *
 * Nothing here is invented: projects, employers, dates, scores and links are the
 * author's actual content. The "Living Backend" framing (endpoints, status
 * codes, graph edges) is presentation only and is derived from these facts.
 */

export const profile = {
  name: "Om Kumar Mishra",
  short: "OM",
  role: "Java Backend Developer",
  location: "Bhubaneswar · India",
  email: "ommishra1449@gmail.com",
  github: "https://github.com/Ommishra1221",
  githubHandle: "@Ommishra1221",
  linkedin: "https://www.linkedin.com/in/om-mishra-b6677625b",
  linkedinHandle: "@om-mishra",
  resume: "/om-kumar-mishra-resume.pdf",
  portrait: "/om-kumar-mishra-portrait.webp",
  portraitFallback: "/om-kumar-mishra-portrait.png",
  logo: "/om-monogram-favicon.ico",
} as const;

export const intro =
  "I design Java and Spring Boot backends with clear API boundaries, secure access control, and dependable data models for products that need to keep moving.";

export const roles = [
  "Java Backend Developer",
  "Spring Boot Engineer",
  "REST API Builder",
  "Secure Systems Developer",
  "Database-Focused Engineer",
];

/** Boot log lines shown while the "application" starts. */
export const bootLines = [
  { text: "Booting PortfolioApplication 1.0.0", tone: "dim" },
  { text: "Loading application properties…", tone: "dim" },
  { text: "HikariPool-1 - Starting…", tone: "dim" },
  { text: "Hibernate: initializing JPA EntityManagerFactory", tone: "dim" },
  { text: "Tomcat started on port 8080 (http)", tone: "cyan" },
] as const;

export const bootSummary = "Started PortfolioApplication in 1.2s (JVM running for 1.6s)";

export type HttpMethod = "GET" | "POST";

export type Endpoint = {
  id: string;
  /** Path as it appears in the nav, e.g. "/about". */
  path: string;
  method: HttpMethod;
  label: string;
  description: string;
};

/**
 * Navigation modelled as API endpoints. Order matches the page order and every
 * section below has a real endpoint.
 */
export const endpoints: Endpoint[] = [
  { id: "about", path: "/about", method: "GET", label: "Expertise", description: "Engineering focus and working principles" },
  { id: "skills", path: "/skills", method: "GET", label: "Stack", description: "Languages, frameworks, data stores and tools" },
  { id: "projects", path: "/projects", method: "GET", label: "Projects", description: "Backend systems built end to end" },
  { id: "experience", path: "/experience", method: "GET", label: "Experience", description: "Where the work has shipped" },
  { id: "education", path: "/education", method: "GET", label: "Education", description: "Academic foundation" },
  { id: "contact", path: "/contact", method: "POST", label: "Contact", description: "Open a channel" },
];

/** Bottom bar actions for mobile — five at most, all real destinations. */
export const quickActions = [
  { id: "projects", href: "#projects", label: "Projects" },
  { id: "skills", href: "#skills", label: "Skills" },
  { id: "github", href: profile.github, label: "GitHub", external: true },
  { id: "resume", href: profile.resume, label: "Resume", download: true },
  { id: "contact", href: "#contact", label: "Contact" },
] as const;

export const capabilities = [
  { icon: "server", title: "Backend architecture", meta: "Java · Spring Boot · MVC", tone: "orange" },
  { icon: "shield", title: "Secure access", meta: "JWT · RBAC · Spring Security", tone: "green" },
  { icon: "database", title: "Data modeling", meta: "MySQL · PostgreSQL · MongoDB", tone: "cyan" },
  { icon: "terminal", title: "API delivery", meta: "REST · Postman · Maven", tone: "blue" },
] as const;

export type SkillGroup = {
  icon: "code" | "server" | "database" | "terminal" | "layers" | "check";
  name: string;
  tone: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  { icon: "code", name: "Languages", tone: "orange", items: ["Java", "SQL", "JavaScript", "C++"] },
  {
    icon: "server",
    name: "Backend",
    tone: "green",
    items: ["Spring Boot", "Spring MVC", "Spring Security", "REST APIs", "JWT", "JPA/Hibernate"],
  },
  { icon: "database", name: "Databases", tone: "cyan", items: ["PostgreSQL", "MySQL", "MongoDB"] },
  { icon: "terminal", name: "Tools", tone: "blue", items: ["Git", "GitHub", "Postman", "IntelliJ IDEA", "VS Code", "Maven"] },
  {
    icon: "layers",
    name: "Concepts",
    tone: "orange",
    items: ["OOP", "Data Structures", "Algorithms", "MVC", "RBAC", "Exception Handling"],
  },
  { icon: "check", name: "Testing", tone: "green", items: ["Mockito", "JUnit"] },
];

export const coreSkills = new Set(["Java", "SQL", "Spring Boot", "Spring Security", "JPA/Hibernate", "MySQL"]);

export const skillCodes: Record<string, string> = {
  Java: "JV", SQL: "SQL", JavaScript: "JS", "C++": "C++", "Spring Boot": "SB", "Spring MVC": "MVC",
  "Spring Security": "SEC", "REST APIs": "API", JWT: "JWT", "JPA/Hibernate": "JPA", PostgreSQL: "PG",
  MySQL: "MY", MongoDB: "MDB", Git: "GIT", GitHub: "GH", Postman: "PM", "IntelliJ IDEA": "IDE",
  "VS Code": "VSC", Maven: "MVN", OOP: "OOP", "Data Structures": "DS", Algorithms: "ALG", MVC: "MVC",
  RBAC: "RBAC", "Exception Handling": "EXC", Mockito: "MCK", JUnit: "JUT",
};

/**
 * Architecture graph: how the stack actually connects. Edges describe real
 * dependencies between technologies the author works with, so the diagram is a
 * truthful model rather than decoration.
 */
export type GraphNode = {
  id: string;
  label: string;
  layer: "language" | "framework" | "security" | "api" | "data" | "store" | "quality";
  detail: string;
};

export const graphNodes: GraphNode[] = [
  { id: "java", label: "Java", layer: "language", detail: "Primary language across every service and module." },
  { id: "sql", label: "SQL", layer: "language", detail: "Querying and shaping relational data by hand." },
  { id: "boot", label: "Spring Boot", layer: "framework", detail: "Bootstrap, dependency injection and auto-configuration." },
  { id: "mvc", label: "Spring MVC", layer: "framework", detail: "Controller layer: routing, binding, response shaping." },
  { id: "jpa", label: "JPA/Hibernate", layer: "framework", detail: "Entity mapping and persistence between objects and tables." },
  { id: "security", label: "Spring Security", layer: "security", detail: "Authentication and authorization filter chain." },
  { id: "jwt", label: "JWT", layer: "security", detail: "Stateless token sessions for API clients." },
  { id: "rbac", label: "RBAC", layer: "security", detail: "Role-based endpoint access control." },
  { id: "rest", label: "REST APIs", layer: "api", detail: "Resource-oriented endpoints with predictable contracts." },
  { id: "postman", label: "Postman", layer: "api", detail: "Request collections used to verify each endpoint." },
  { id: "mysql", label: "MySQL", layer: "store", detail: "Relational store for transactional workflows." },
  { id: "postgres", label: "PostgreSQL", layer: "store", detail: "Relational store for structured domain models." },
  { id: "mongo", label: "MongoDB", layer: "store", detail: "Document store for flexible shapes." },
  { id: "junit", label: "JUnit", layer: "quality", detail: "Unit coverage for service and domain behaviour." },
  { id: "mockito", label: "Mockito", layer: "quality", detail: "Test doubles for isolated unit verification." },
  { id: "maven", label: "Maven", layer: "quality", detail: "Build lifecycle and dependency management." },
];

export const graphEdges: Array<[string, string]> = [
  ["java", "boot"],
  ["sql", "jpa"],
  ["boot", "mvc"],
  ["boot", "security"],
  ["boot", "jpa"],
  ["boot", "junit"],
  ["boot", "maven"],
  ["mvc", "rest"],
  ["rest", "postman"],
  ["security", "jwt"],
  ["security", "rbac"],
  ["jpa", "mysql"],
  ["jpa", "postgres"],
  ["boot", "mongo"],
  ["junit", "mockito"],
];

export type Project = {
  title: string;
  tag: string;
  art: "commerce" | "workflow";
  repo: string;
  live?: string;
  desc: string;
  bullets: string[];
  tags: string[];
  /** JSON response preview shown when the card is opened. */
  response: Record<string, string | number | string[] | boolean>;
};

export const projects: Project[] = [
  {
    title: "E-Commerce Backend System",
    tag: "JAVA · SPRING BOOT",
    art: "commerce",
    repo: "https://github.com/Ommishra1221/ecommerce-springboot-react",
    live: "https://frontend-wine-seven-27.vercel.app/",
    desc: "A secure commerce backend designed around clear product, user, and order workflows.",
    bullets: [
      "JWT authentication with role-based access control",
      "JPA/Hibernate data layer with MySQL persistence",
    ],
    tags: ["Java", "Spring Boot", "Spring Security", "MySQL"],
    response: {
      status: 200,
      resource: "/api/v1/products",
      auth: "Bearer <jwt>",
      roles: ["ROLE_USER", "ROLE_ADMIN"],
      works: ["product", "user", "order"],
      persistence: "MySQL · JPA/Hibernate",
    },
  },
  {
    title: "Leave Management System",
    tag: "SPRING MVC · MYSQL",
    art: "workflow",
    repo: "https://github.com/Ommishra1221/Leave-Management-System",
    desc: "A structured employee leave workflow from application through administrator approval.",
    bullets: [
      "Authentication and administrator approval workflow",
      "JPA-backed leave, user, and status data model",
    ],
    tags: ["Java", "Spring MVC", "MySQL", "JPA"],
    response: {
      status: 200,
      resource: "/api/v1/leaves",
      auth: "session · role guarded",
      roles: ["ROLE_EMPLOYEE", "ROLE_ADMIN"],
      workflow: "apply → review → approve",
      persistence: "MySQL · JPA/Hibernate",
    },
  },
];

export const experiences = [
  {
    date: "JUL 2026 — PRESENT",
    role: "Associate Software Engineer (Trainee)",
    company: "AASHDIT Technologies",
    location: "Bhubaneswar, Odisha · In person",
    points: [
      "Developing and maintaining backend applications with Java, Spring Boot, and REST APIs.",
      "Designing scalable modules with MVC, OOP, MySQL, and JPA/Hibernate conventions.",
      "Collaborating with Git, GitHub, Postman, and IntelliJ IDEA across feature delivery and API testing.",
    ],
  },
  {
    date: "APR 2026 — JUN 2026",
    role: "Java Developer Intern",
    company: "Bariflo Cybernetics Private Limited",
    location: "Bhubaneswar, Odisha · In person",
    points: [
      "Developed backend services with Java, Spring Boot, REST APIs, and MVC architecture.",
      "Contributed to a CMMS application through database schemas, REST APIs, and role-based access control.",
      "Applied Git/GitHub version control and industry-standard development practices.",
    ],
  },
];

export const education = [
  ["AUG 2022 — MAY 2026", "B.Tech in Computer Science & Engineering", "GITA Autonomous College, Bhubaneswar", "8.01 / 10"],
  ["2020 — 2022", "Class XII — CBSE", "DAV Public School, Bokaro Steel City, Jharkhand", "73%"],
] as const;

export const credentials = [
  { label: "APPLIED LEARNING", value: "Udemy Bootcamp · CodSoft Internship" },
  { label: "SQL SIGNAL", value: "HackerRank Credential" },
  { label: "ENGINEERING BADGE", value: "Software Engineer Intern · HackerRank" },
  { label: "ALGORITHM PRACTICE", value: "300+ solved · GfG + LeetCode" },
];

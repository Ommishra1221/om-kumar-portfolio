/** Premium developer portfolio for Om Kumar Mishra. */
import { FormEvent, useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import "./project-links.css";
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, Award, Box, BriefcaseBusiness,
  CheckCircle2, ChevronDown, CircleDot, Clock3, Code2, Database, Download,
  ExternalLink, Github, GraduationCap, Layers3, Linkedin, Mail, MapPin, Menu,
  Moon, Send, ServerCog, ShieldCheck, Sparkles, Sun, Terminal, X,
} from "lucide-react";

const assets = {
  logo: "/om-monogram-favicon.ico",
  portrait: "/om-kumar-mishra-portrait.jpeg",
  resume: "/om-kumar-mishra-resume.pdf",
  hero: "/manus-storage/om-hero-system-map_9daeb078.jpg",
  commerce: "/manus-storage/om-project-ecommerce_dc67cd72.jpg",
  leave: "/manus-storage/om-project-leave_d345795e.jpg",
  systems: "/manus-storage/om-java-spring-visual_60ca8546.jpg",
};

const nav = [["Expertise", "about"], ["Stack", "skills"], ["Projects", "projects"], ["Experience", "experience"], ["Education", "education"], ["Contact", "contact"]] as const;
const roles = ["Java Backend Developer", "Spring Boot Engineer", "REST API Builder", "Secure Systems Developer", "Database-Focused Engineer"];
const coreSkills = new Set(["Java", "SQL", "Spring Boot", "Spring Security", "JPA/Hibernate", "MySQL"]);
const skillCodes: Record<string, string> = {
  Java: "JV", SQL: "SQL", JavaScript: "JS", "C++": "C++", "Spring Boot": "SB", "Spring MVC": "MVC", "Spring Security": "SEC", "REST APIs": "API", JWT: "JWT", "JPA/Hibernate": "JPA", PostgreSQL: "PG", MySQL: "MY", MongoDB: "MDB", Git: "GIT", GitHub: "GH", Postman: "PM", "IntelliJ IDEA": "IDE", "VS Code": "VSC", Maven: "MVN", OOP: "OOP", "Data Structures": "DS", Algorithms: "ALG", MVC: "MVC", RBAC: "RBAC", "Exception Handling": "EXC", Mockito: "MCK", JUnit: "JUT",
};

const capabilities = [
  [ServerCog, "Backend architecture", "Java · Spring Boot · MVC", "orange"],
  [ShieldCheck, "Secure access", "JWT · RBAC · Spring Security", "green"],
  [Database, "Data modeling", "MySQL · PostgreSQL · MongoDB", "cyan"],
  [Terminal, "API delivery", "REST · Postman · Maven", "blue"],
] as const;

const skills = [
  [Code2, "Languages", "orange", ["Java", "SQL", "JavaScript", "C++"]],
  [ServerCog, "Backend", "green", ["Spring Boot", "Spring MVC", "Spring Security", "REST APIs", "JWT", "JPA/Hibernate"]],
  [Database, "Databases", "cyan", ["PostgreSQL", "MySQL", "MongoDB"]],
  [Terminal, "Tools", "blue", ["Git", "GitHub", "Postman", "IntelliJ IDEA", "VS Code", "Maven"]],
  [Layers3, "Concepts", "orange", ["OOP", "Data Structures", "Algorithms", "MVC", "RBAC", "Exception Handling"]],
  [CheckCircle2, "Testing", "green", ["Mockito", "JUnit"]],
] as const;

const projects = [
  {
    title: "E-Commerce Backend System",
    tag: "JAVA · SPRING BOOT",
    image: assets.commerce,
    repo: "https://github.com/Ommishra1221/ecommerce-springboot-react",
    live: "https://frontend-wine-seven-27.vercel.app/",
    desc: "A secure commerce backend designed around clear product, user, and order workflows.",
    bullets: ["JWT authentication with role-based access control", "JPA/Hibernate data layer with MySQL persistence"],
    tags: ["Java", "Spring Boot", "Spring Security", "MySQL"],
  },
  {
    title: "Leave Management System",
    tag: "SPRING MVC · MYSQL",
    image: assets.leave,
    repo: "https://github.com/Ommishra1221/Leave-Management-System",
    desc: "A structured employee leave workflow from application through administrator approval.",
    bullets: ["Authentication and administrator approval workflow", "JPA-backed leave, user, and status data model"],
    tags: ["Java", "Spring MVC", "MySQL", "JPA"],
  },
];

const experiences = [
  {
    date: "JUL 2026 — PRESENT",
    role: "Associate Software Engineer (Trainee)",
    company: "AASHDIT Technologies",
    location: "Bhubaneswar, Odisha · In person",
    points: ["Developing and maintaining backend applications with Java, Spring Boot, and REST APIs.", "Designing scalable modules with MVC, OOP, MySQL, and JPA/Hibernate conventions.", "Collaborating with Git, GitHub, Postman, and IntelliJ IDEA across feature delivery and API testing."],
  },
  {
    date: "APR 2026 — JUN 2026",
    role: "Java Developer Intern",
    company: "Bariflo Cybernetics Private Limited",
    location: "Bhubaneswar, Odisha · In person",
    points: ["Developed backend services with Java, Spring Boot, REST APIs, and MVC architecture.", "Contributed to a CMMS application through database schemas, REST APIs, and role-based access control.", "Applied Git/GitHub version control and industry-standard development practices."],
  },
];

const education = [
  ["AUG 2022 — MAY 2026", "B.Tech in Computer Science & Engineering", "GITA Autonomous College, Bhubaneswar", "8.01 / 10"],
  ["2020 — 2022", "Class XII — CBSE", "DAV Public School, Bokaro Steel City, Jharkhand", "73%"],
] as const;

function SectionTitle({ eyebrow, first, accent, note }: { eyebrow: string; first: string; accent: string; note?: string }) {
  return <div className="section-heading"><div className="eyebrow"><span />{eyebrow}<i /></div><div className="section-title-row"><h2>{first} <em>{accent}</em></h2>{note && <p>{note}</p>}</div></div>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <a href="#home" className={`brand ${compact ? "compact" : ""}`} aria-label="Om Kumar Mishra — home"><img src={assets.logo} alt="OM monogram" /><span><b>OM</b><small>KUMAR MISHRA</small></span></a>;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(true);
  const [menu, setMenu] = useState(false);
  const [time, setTime] = useState("");
  const [role, setRole] = useState(0);
  const [typed, setTyped] = useState("");
  const [formSent, setFormSent] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [formError, setFormError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [activeSection, setActiveSection] = useState("about");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1100);
    const clock = () => setTime(new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
    clock(); const id = window.setInterval(clock, 1000);
    return () => { window.clearTimeout(timer); window.clearInterval(id); };
  }, []);

  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  useEffect(() => { document.body.style.overflow = menu ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menu]);
  useEffect(() => {
    const word = roles[role]; let n = 0; setTyped("");
    const id = window.setInterval(() => { n += 1; setTyped(word.slice(0, n)); if (n === word.length) window.clearInterval(id); }, 42);
    const rotate = window.setTimeout(() => setRole((value) => (value + 1) % roles.length), 3200);
    return () => { window.clearInterval(id); window.clearTimeout(rotate); };
  }, [role]);
  useEffect(() => {
    const updateProgress = () => {
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maximum > 0 ? (window.scrollY / maximum) * 100 : 0);
    };
    updateProgress(); window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }), { rootMargin: "-34% 0px -54% 0px", threshold: 0.05 });
    nav.forEach(([, id]) => { const node = document.getElementById(id); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSending(true); setFormError("");
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      if (!serviceId || !templateId || !publicKey) {
        setFormError("Email is not configured yet. Please email me directly at ommishra1449@gmail.com");
        setFormSending(false);
        return;
      }
      await emailjs.sendForm(
        serviceId,
        templateId,
        formRef.current!,
        { publicKey }
      );
      setFormSent(true);
      formRef.current?.reset();
    } catch (err: any) {
      console.error("EmailJS error:", err?.text || err?.message || err);
      setFormError("Failed to send message. Please try again or email me directly at ommishra1449@gmail.com");
    } finally {
      setFormSending(false);
    }
  };

  return <main id="home" className="portfolio">
    {loading && <div className="loader" aria-live="polite"><div className="loader-grid left" /><div className="loader-grid right" /><div className="loader-core"><img src={assets.logo} alt="" /><b>OM KUMAR MISHRA</b><span>INITIALIZING ENGINEERING PROFILE</span><i><em /></i><small>READY · 100%</small></div></div>}
    <div className="ambient" aria-hidden="true" /><div className="progress-line" style={{ transform: `scaleX(${Math.min(scrollProgress, 100) / 100})` }} aria-hidden="true" />
    <header className="header"><Brand /><nav className="desktop-nav" aria-label="Primary navigation">{nav.map(([label, id]) => <a className={activeSection === id ? "active" : ""} href={`#${id}`} key={id}>{label}</a>)}</nav><div className="head-actions"><span className="clock"><i />{time} IST</span><button onClick={() => setDark(!dark)} aria-label="Toggle color theme">{dark ? <Sun size={14} /> : <Moon size={14} />}</button><a className="resume" href={assets.resume} download><Download size={13} />Résumé</a><button className="hamburger" onClick={() => setMenu(true)} aria-label="Open navigation"><Menu size={20} /></button></div></header>
    <div className={`mobile-menu ${menu ? "open" : ""}`}><button onClick={() => setMenu(false)} className="close" aria-label="Close navigation"><X size={23} /></button><Brand compact /><nav>{nav.map(([label, id], index) => <a href={`#${id}`} key={id} onClick={() => setMenu(false)}><small>0{index + 1}</small>{label}<ArrowRight size={17} /></a>)}</nav><a className="mobile-resume" href={assets.resume} download><Download size={16} /> Download Résumé</a></div>

    <section className="hero"><div className="hero-art" style={{ backgroundImage: `url(${assets.hero})` }} /><div className="hero-noise" aria-hidden="true" /><div className="hero-inner"><div className="hero-copy"><div className="hero-label"><i />JAVA BACKEND ENGINEER <span>AVAILABLE FOR ROLES</span></div><div className="hero-favicon"><img src={assets.logo} alt="OM monogram" /></div><p className="hero-name">OM KUMAR MISHRA</p><h1>Backend systems that feel <em>simple</em> to use—and strong underneath.</h1><div className="typed"><b>$</b>{typed}<i /></div><p className="hero-intro">I design Java and Spring Boot backends with clear API boundaries, secure access control, and dependable data models for products that need to keep moving.</p><div className="hero-actions"><a className="primary" href="#projects"><Box size={16} />Explore my work<ArrowRight size={15} /></a><a className="secondary" href="#contact"><Send size={15} />Start a conversation</a></div><div className="hero-signals"><span><CheckCircle2 size={14} />Secure API design</span><span><Database size={14} />Relational data</span><span><Activity size={14} />Production mindset</span></div></div><div className="profile-stage"><div className="profile-glow" /><div className="orbit a" /><div className="orbit b" /><div className="profile-side-label left"><span>01</span><b>JAVA</b><b>SPRING</b><b>JPA</b></div><div className="portrait"><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /><img src={assets.portrait} alt="Om Kumar Mishra" /><b className="scan" /><div className="portrait-meta"><span><CircleDot size={11} />SYSTEMS ENGINEER</span><small>BHUBANESWAR · INDIA</small></div></div><div className="profile-side-label right"><span>02</span><b>JWT</b><b>SQL</b><b>REST</b></div><div className="availability-card"><span><i />OPEN TO OPPORTUNITIES</span><b>Java · Spring · SQL</b></div></div></div><a href="#about" className="scroll">SCROLL TO EXPLORE<ChevronDown size={17} /></a></section>

    <Rule /><section id="about" className="section about-section"><SectionTitle eyebrow="ENGINEERING FOCUS" first="Built for reliable" accent="delivery." note="A systems-first approach to backend work that stays clear as products grow." /><div className="about-grid"><div className="narrative"><p>I specialize in <b>Java backend development</b> with <strong>Spring Boot</strong>, creating REST API layers, MVC-based modules, and relational data structures designed for maintainability.</p><p>My working toolkit combines <strong>Spring Security and JWT</strong> for controlled access with <b>MySQL and PostgreSQL</b> for structured persistence and JPA/Hibernate for practical data access.</p><div className="pills">{["Java", "Spring Boot", "Spring Security", "MySQL", "JPA / Hibernate", "REST APIs", "JWT", "Maven"].map((item) => <span key={item}>{item}</span>)}</div><a className="text-link" href="#contact">Discuss a backend opportunity <ArrowRight size={15} /></a></div><div className="capabilities">{capabilities.map(([Icon, title, meta, tone], index) => <article className={tone} key={title}><span className="capability-index">0{index + 1}</span><Icon size={23} /><div><h3>{title}</h3><p>{meta}</p></div><ArrowUpRight size={15} /></article>)}</div></div><div className="system-banner" style={{ backgroundImage: `linear-gradient(90deg, var(--bg) 3%, transparent 63%), url(${assets.systems})` }}><div><small>ENGINEERING PRINCIPLE</small><b>Structure first. Secure the pathways. Ship with intent.</b><span>Clear boundaries · deliberate systems · maintainable outcomes</span></div></div></section>

    <Rule /><section id="skills" className="section"><SectionTitle eyebrow="TECHNICAL INVENTORY" first="Core" accent="arsenal." note="A purposeful toolkit for building and maintaining backend systems." /><div className="skill-categories">{skills.map(([Icon, name, tone, items], index) => <article className={tone} key={name}><header><span className="category-title"><Icon size={15} /><b>{name}</b></span><small>0{index + 1} // {items.length} UNITS</small></header><div>{items.map((item) => { const isCore = coreSkills.has(item); return <span className={`tile ${isCore ? "core-tile" : ""}`} key={item}><b>{skillCodes[item] ?? item.split(/\s+/).map((word) => word[0]).join("").slice(0, 3)}</b><small>{item}</small>{isCore && <em>CORE</em>}</span>; })}</div></article>)}</div><div className="credential"><div className="credential-lead"><Award size={22} /><div><small>CREDENTIALS + PRACTICE</small><b>Learning signals, applied consistently.</b></div></div><div className="credential-signals"><article><small>APPLIED LEARNING</small><b>Udemy Bootcamp · CodSoft Internship</b></article><article><small>SQL SIGNAL</small><b>HackerRank Credential</b></article><article><small>ENGINEERING BADGE</small><b>Software Engineer Intern · HackerRank</b></article><article><small>ALGORITHM PRACTICE</small><b>300+ solved · GfG + LeetCode</b></article></div></div></section>

    <Rule /><section id="projects" className="section"><SectionTitle eyebrow="SELECTED WORK" first="Build" accent="log." note="Backend projects shaped around security, workflow clarity, and maintainable data." /><div className="projects">{projects.map((project, index) => <article className="project" key={project.title}><div className="project-art" style={{ backgroundImage: `url(${project.image})` }}><span>{project.tag}</span><b>0{index + 1}</b></div><div className="project-body"><h3>{project.title}</h3><p>{project.desc}</p><ul>{project.bullets.map((point) => <li key={point}>{point}</li>)}</ul><div className="tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="project-links"><a href={project.repo} target="_blank" rel="noreferrer"><Github size={15} />View repository<ArrowUpRight size={15} /></a>{project.live && <a className="live-link" href={project.live} target="_blank" rel="noreferrer"><ExternalLink size={14} />Live demo</a>}</div></div></article>)}<article className="project queue"><Sparkles size={27} /><small>CONTINUOUSLY BUILDING</small><h3>More backend work is in the queue.</h3><p>Follow the GitHub profile for current repositories and project progress.</p><a href="https://github.com/Ommishra1221" target="_blank" rel="noreferrer">View GitHub <ExternalLink size={14} /></a></article></div></section>

    <Rule /><section id="experience" className="section"><SectionTitle eyebrow="EXPERIENCE" first="Where I’ve" accent="shipped." note="Hands-on backend development across trainee and internship environments." /><div className="experiences">{experiences.map((job, index) => <article key={job.company}><div className="experience-rail"><span>0{index + 1}</span><i /></div><div className="experience-main"><small>{job.date}</small><div className="job-title"><BriefcaseBusiness size={21} /><div><h3>{job.role}</h3><strong>{job.company}</strong><p><MapPin size={12} />{job.location}</p></div></div><ul>{job.points.map((point) => <li key={point}>{point}</li>)}</ul></div></article>)}</div></section>

    <Rule /><section id="education" className="section"><SectionTitle eyebrow="FOUNDATION" first="Built on" accent="curiosity." note="Academic foundations strengthened through practical systems work." /><div className="education-grid"><div className="timeline">{education.map(([date, degree, school, score]) => <article key={degree}><i /><small>{date}</small><h3>{degree}</h3><p>{school}</p><b>{score}</b></article>)}</div><aside><GraduationCap size={29} /><small>CONTINUING SIGNAL</small><h3>Learning is part of the operating system.</h3><p>From data structures and core Java concepts to modern Spring Boot workflows, the focus stays on building practical depth through steady, hands-on work.</p><div><span>Java fundamentals</span><span>Data structures</span><span>Spring Boot</span></div></aside></div></section>

    <Rule /><section id="contact" className="section contact-section"><SectionTitle eyebrow="OPEN CHANNEL" first="Let’s build" accent="something reliable." note="Open to full-time roles, internships, and practical backend engineering work." /><div className="contact-grid"><div className="contact-info"><div className="contact-callout"><span><i />AVAILABLE FOR ROLES</span><h3>Bring a real system problem. I’ll bring a clear engineering mindset.</h3></div><a className="hire" href="mailto:ommishra1449@gmail.com?subject=Portfolio%20enquiry"><Mail size={16} />Start via email<ArrowUpRight size={15} /></a><div className="contact-cards"><a href="mailto:ommishra1449@gmail.com"><Mail size={17} /><span><small>EMAIL</small>ommishra1449@gmail.com</span><ArrowUpRight size={15} /></a><a href="https://www.linkedin.com/in/om-mishra-b6677625b" target="_blank" rel="noreferrer"><Linkedin size={17} /><span><small>LINKEDIN</small>linkedin.com/in/om-mishra-b6677625b</span><ArrowUpRight size={15} /></a></div><div className="social"><a href="https://github.com/Ommishra1221" target="_blank" rel="noreferrer"><Github size={18} /><b>GitHub</b><small>@Ommishra1221</small><ArrowUpRight size={15} /></a><a href="https://www.linkedin.com/in/om-mishra-b6677625b" target="_blank" rel="noreferrer"><Linkedin size={18} /><b>LinkedIn</b><small>@om-mishra</small><ArrowUpRight size={15} /></a></div></div><form className="contact-form" ref={formRef} onSubmit={submit}><div className="form-heading"><span>DIRECT INQUIRY</span><b>Send a message</b></div><div><label><span>Name</span><input name="name" required placeholder="Your name" /></label><label><span>Email</span><input name="email" required type="email" placeholder="you@company.com" /></label></div><label><span>Subject</span><input name="subject" required placeholder="Java Backend opportunity" /></label><label><span>Message</span><textarea name="message" required rows={7} placeholder="Tell me about the opportunity, team, or system challenge..." /></label><button type="submit" disabled={formSending}>{formSending ? "Sending..." : <><Send size={15} />Send message<ArrowRight size={14} /></>}</button>{formSent && <small className="sent">Message sent successfully! I'll get back to you soon.</small>}{formError && <small className="sent" style={{color:"var(--orange)"}}>{formError}</small>}</form></div></section>

    <footer><div className="footer-grid"><div><Brand /><p>Java Backend Developer creating structured, secure systems with Spring Boot, REST APIs, and relational data at the core.</p></div><div><small>NAVIGATION</small>{nav.map(([label, id]) => <a href={`#${id}`} key={id}>{label}</a>)}</div><div><small>CONNECT</small><a href="https://github.com/Ommishra1221" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com/in/om-mishra-b6677625b" target="_blank" rel="noreferrer">LinkedIn</a><a href="mailto:ommishra1449@gmail.com">Email</a></div><div className="footer-status"><span><i />AVAILABLE</span><p><Clock3 size={13} />{time} IST</p></div></div><div className="footer-meta"><span>© 2026 Om Kumar Mishra. Crafted with intent.</span><span>JAVA · SPRING BOOT · REST APIs · SQL</span></div></footer><a className="to-top" href="#home" aria-label="Back to top"><ArrowDown size={18} /></a>
  </main>;
}

function Rule() { return <div className="rule" />; }

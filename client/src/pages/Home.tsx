/**
 * Premium developer portfolio for Om Kumar Mishra.
 *
 * Framed as "The Living Backend": the page boots like a Spring Boot service, and
 * navigation, projects, skills and contact are modelled as API resources. Every
 * project, employer, date, score and link is real content pulled from
 * `@/data/portfolio` — the API framing is presentation only.
 */
import { useEffect, useState } from "react";
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, Award, Box, BriefcaseBusiness, CheckCircle2,
  ChevronDown, CircleDot, Clock3, Code2, Database, Download, Github, GraduationCap, Layers3,
  Linkedin, Mail, MapPin, Moon, Send, ServerCog, ShieldCheck, Sparkles, Sun, Terminal,
  Vibrate, VibrateOff,
} from "lucide-react";
import {
  capabilities, credentials, coreSkills, education, endpoints, experiences, intro,
  profile, projects, roles, skillCodes, skillGroups,
} from "@/data/portfolio";
import BootLog, { shouldBoot } from "@/components/portfolio/BootLog";
import BottomBar from "@/components/portfolio/BottomBar";
import ContactPanel from "@/components/portfolio/ContactPanel";
import { DesktopNav, MobileNav } from "@/components/portfolio/ApiNav";
import PacketField from "@/components/portfolio/PacketField";
import ProjectCard from "@/components/portfolio/ProjectCard";
import SkillGraph from "@/components/portfolio/SkillGraph";
import { BannerArt, SystemMap } from "@/components/portfolio/ProceduralArt";
import { useHapticPreference, usePrefersReducedMotion } from "@/hooks/useHaptics";
import { haptic } from "@/lib/haptics";
import { useScrollStorytelling } from "@/lib/motion";
import "./project-links.css";

const capabilityIcons = { server: ServerCog, shield: ShieldCheck, database: Database, terminal: Terminal } as const;
const groupIcons = { code: Code2, server: ServerCog, database: Database, terminal: Terminal, layers: Layers3, check: CheckCircle2 } as const;

function SectionTitle({ eyebrow, first, accent, note }: { eyebrow: string; first: string; accent: string; note?: string }) {
  return (
    <div className="section-heading" data-reveal>
      <div className="eyebrow">
        <span />
        {eyebrow}
        <i />
      </div>
      <div className="section-title-row">
        <h2 data-words>
          {first} <em>{accent}</em>
        </h2>
        {note && <p>{note}</p>}
      </div>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#home" className={`brand ${compact ? "compact" : ""}`} aria-label="Om Kumar Mishra — home">
      <img src={profile.logo} alt="" width={31} height={31} />
      <span>
        <b>{profile.short}</b>
        <small>KUMAR MISHRA</small>
      </span>
    </a>
  );
}

function Rule() {
  return <div className="rule" />;
}

export default function Home() {
  const reducedMotion = usePrefersReducedMotion();
  const haptics = useHapticPreference();
  const [booting, setBooting] = useState(() => shouldBoot());
  const [dark, setDark] = useState(true);
  const [menu, setMenu] = useState(false);
  const [time, setTime] = useState("");
  const [role, setRole] = useState(0);
  const [typed, setTyped] = useState("");
  const [activeSection, setActiveSection] = useState("about");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useScrollStorytelling();

  // Clock in the visitor's target timezone, not the author's.
  useEffect(() => {
    const clock = () =>
      setTime(
        new Intl.DateTimeFormat("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }).format(new Date())
      );

    clock();
    const id = window.setInterval(clock, 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  // Typewriter for the rotating role list.
  useEffect(() => {
    if (reducedMotion) {
      setTyped(roles[role]);
      return;
    }

    const word = roles[role];
    let index = 0;
    setTyped("");

    const type = window.setInterval(() => {
      index += 1;
      setTyped(word.slice(0, index));
      if (index === word.length) window.clearInterval(type);
    }, 42);
    const rotate = window.setTimeout(() => setRole((value) => (value + 1) % roles.length), 3200);

    return () => {
      window.clearInterval(type);
      window.clearTimeout(rotate);
    };
  }, [role, reducedMotion]);

  useEffect(() => {
    const update = () => {
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maximum > 0 ? (window.scrollY / maximum) * 100 : 0;
      setScrollProgress(progress);
      setShowTop(window.scrollY > 900);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Scroll spy over the real endpoint ids.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }),
      { rootMargin: "-34% 0px -54% 0px", threshold: 0.05 }
    );

    endpoints.forEach(({ id }) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main id="home" className="portfolio">
      <a className="skip-link" href="#about">
        Skip to content
      </a>

      {booting && !reducedMotion && <BootLog onDone={() => setBooting(false)} />}

      <div className="ambient" aria-hidden="true" />
      <div
        className="progress-line"
        style={{ transform: `scaleX(${Math.min(scrollProgress, 100) / 100})` }}
        aria-hidden="true"
      />

      <header className="header">
        <Brand />
        <DesktopNav activeId={activeSection} />

        <div className="head-actions">
          <span className="clock">
            <i aria-hidden="true" />
            {time} IST
          </span>

          <button
            type="button"
            className="head-icon hit"
            onClick={() => {
              setDark(!dark);
              haptic("toggle");
            }}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            aria-pressed={dark}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            type="button"
            className="head-icon hit"
            onClick={() => {
              if (!haptics.enabled) haptic("toggle");
              haptics.toggle();
            }}
            aria-label="Haptic feedback"
            aria-pressed={haptics.enabled}
          >
            {haptics.enabled ? <Vibrate size={15} /> : <VibrateOff size={15} />}
          </button>

          <a className="resume" href={profile.resume} download onPointerDown={() => haptic("tap")}>
            <Download size={13} aria-hidden="true" />
            Résumé
          </a>

          <MobileNav
            activeId={activeSection}
            menuOpen={menu}
            onMenuOpen={() => setMenu(true)}
            onMenuClose={() => setMenu(false)}
          />
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <SystemMap />
        <PacketField />
        <div className="hero-noise" aria-hidden="true" />

        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-label">
              <i aria-hidden="true" />
              JAVA BACKEND ENGINEER
              <span>AVAILABLE FOR ROLES</span>
            </div>

            <p className="hero-name" data-words>
              {profile.name.toUpperCase()}
            </p>

            <h1 data-words>Backend systems that feel <em>simple</em> to use—and strong underneath.</h1>

            <div className="typed">
              <b aria-hidden="true">$</b>
              <span className="visually-hidden">Current focus: {roles[role]}</span>
              <span aria-hidden="true">{typed}</span>
              <i aria-hidden="true" />
            </div>

            <p className="hero-intro">{intro}</p>

            <div className="hero-actions">
              <a className="primary ripple" href="#projects" onPointerDown={() => haptic("tap")}>
                <Box size={16} aria-hidden="true" />
                Explore my work
                <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a className="secondary ripple" href="#contact" onPointerDown={() => haptic("tap")}>
                <Send size={15} aria-hidden="true" />
                Start a conversation
              </a>
            </div>

            <div className="hero-signals">
              <span>
                <CheckCircle2 size={14} aria-hidden="true" />
                Secure API design
              </span>
              <span>
                <Database size={14} aria-hidden="true" />
                Relational data
              </span>
              <span>
                <Activity size={14} aria-hidden="true" />
                Production mindset
              </span>
            </div>
          </div>

          <div className="profile-stage">
            <div className="profile-glow" aria-hidden="true" />
            <div className="orbit a" aria-hidden="true" />
            <div className="orbit b" aria-hidden="true" />
            <div className="profile-side-label left" aria-hidden="true">
              <span>01</span>
              <b>JAVA</b>
              <b>SPRING</b>
              <b>JPA</b>
            </div>

            <div className="portrait">
              <i className="tl" aria-hidden="true" />
              <i className="tr" aria-hidden="true" />
              <i className="bl" aria-hidden="true" />
              <i className="br" aria-hidden="true" />
              <picture>
                <source srcSet={profile.portrait} type="image/webp" />
                <img
                  src={profile.portraitFallback}
                  alt={`Portrait of ${profile.name}`}
                  width={1254}
                  height={1254}
                  fetchPriority="high"
                />
              </picture>
              <b className="scan" aria-hidden="true" />
              <div className="portrait-meta">
                <span>
                  <CircleDot size={11} aria-hidden="true" />
                  SYSTEMS ENGINEER
                </span>
                <small>{profile.location.toUpperCase()}</small>
              </div>
            </div>

            <div className="profile-side-label right" aria-hidden="true">
              <span>02</span>
              <b>JWT</b>
              <b>SQL</b>
              <b>REST</b>
            </div>

            <div className="availability-card">
              <span>
                <i aria-hidden="true" />
                OPEN TO OPPORTUNITIES
              </span>
              <b>Java · Spring · SQL</b>
            </div>
          </div>
        </div>

        <a href="#about" className="scroll">
          SCROLL TO EXPLORE
          <ChevronDown size={17} aria-hidden="true" />
        </a>
      </section>

      {/* ---------------- GET /about ---------------- */}
      <Rule />
      <section id="about" className="section">
        <SectionTitle
          eyebrow="GET /about"
          first="Built for reliable"
          accent="delivery."
          note="A systems-first approach to backend work that stays clear as products grow."
        />

        <div className="about-grid">
          <div className="narrative">
            <p>
              I specialize in <b>Java backend development</b> with <strong>Spring Boot</strong>, creating REST API
              layers, MVC-based modules, and relational data structures designed for maintainability.
            </p>
            <p>
              My working toolkit combines <strong>Spring Security and JWT</strong> for controlled access with{" "}
              <b>MySQL and PostgreSQL</b> for structured persistence and JPA/Hibernate for practical data access.
            </p>
            <div className="pills">
              {["Java", "Spring Boot", "Microservices", "Spring Security", "MySQL", "JPA / Hibernate", "REST APIs", "JWT", "Maven"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <a className="text-link" href="#contact">
              Discuss a backend opportunity <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>

          <div className="capabilities" data-stagger>
            {capabilities.map((capability, index) => {
              const Icon = capabilityIcons[capability.icon];
              return (
                <article className={capability.tone} key={capability.title}>
                  <span className="capability-index">0{index + 1}</span>
                  <Icon size={23} aria-hidden="true" />
                  <div>
                    <h3>{capability.title}</h3>
                    <p>{capability.meta}</p>
                  </div>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </article>
              );
            })}
          </div>
        </div>

        <div className="system-banner" data-reveal>
          <BannerArt />
          <div>
            <small>ENGINEERING PRINCIPLE</small>
            <b>Structure first. Secure the pathways. Ship with intent.</b>
            <span>Clear boundaries · deliberate systems · maintainable outcomes</span>
          </div>
        </div>
      </section>

      {/* ---------------- GET /skills ---------------- */}
      <Rule />
      <section id="skills" className="section">
        <SectionTitle
          eyebrow="GET /skills"
          first="Core"
          accent="arsenal."
          note="A purposeful toolkit for building and maintaining backend systems."
        />

        <SkillGraph />

        <div className="skill-categories" data-stagger>
          {skillGroups.map((group, index) => {
            const Icon = groupIcons[group.icon];
            return (
              <article className={group.tone} key={group.name}>
                <header>
                  <span className="category-title">
                    <Icon size={15} aria-hidden="true" />
                    <b>{group.name}</b>
                  </span>
                  <small>
                    0{index + 1} // {group.items.length} UNITS
                  </small>
                </header>
                <div>
                  {group.items.map((item) => {
                    const isCore = coreSkills.has(item);
                    return (
                      <span className={`tile ${isCore ? "core-tile" : ""}`} key={item}>
                        <b>{skillCodes[item] ?? item.split(/\s+/).map((word) => word[0]).join("").slice(0, 3)}</b>
                        <small>{item}</small>
                        {isCore && <em>CORE</em>}
                      </span>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        <div className="credential" data-reveal>
          <div className="credential-lead">
            <Award size={22} aria-hidden="true" />
            <div>
              <small>CREDENTIALS + PRACTICE</small>
              <b>Learning signals, applied consistently.</b>
            </div>
          </div>
          <div className="credential-signals" data-stagger>
            {credentials.map((item) => (
              <article key={item.label}>
                <small>{item.label}</small>
                <b>{item.value}</b>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- GET /projects ---------------- */}
      <Rule />
      <section id="projects" className="section">
        <SectionTitle
          eyebrow="GET /projects"
          first="Build"
          accent="log."
          note="Backend projects shaped around security, workflow clarity, and maintainable data. Open a card to read its response."
        />

        <div className="projects" data-stagger>
          {projects.map((project, index) => (
            <ProjectCard project={project} index={index} key={project.title} />
          ))}

          <article className="project queue">
            <Sparkles size={27} aria-hidden="true" />
            <small>CONTINUOUSLY BUILDING</small>
            <h3>More backend work is in the queue.</h3>
            <p>Follow the GitHub profile for current repositories and project progress.</p>
            <a href={profile.github} target="_blank" rel="noreferrer">
              View GitHub <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </article>
        </div>
      </section>

      {/* ---------------- GET /experience ---------------- */}
      <Rule />
      <section id="experience" className="section">
        <SectionTitle
          eyebrow="GET /experience"
          first="Where I've"
          accent="shipped."
          note="Hands-on backend development across trainee and internship environments."
        />

        <div className="experiences" data-stagger>
          {experiences.map((job, index) => (
            <article key={job.company}>
              <div className="experience-rail" aria-hidden="true">
                <span>0{index + 1}</span>
                <i />
              </div>
              <div className="experience-main">
                <small>{job.date}</small>
                <div className="job-title">
                  <BriefcaseBusiness size={21} aria-hidden="true" />
                  <div>
                    <h3>{job.role}</h3>
                    <strong>{job.company}</strong>
                    <p>
                      <MapPin size={12} aria-hidden="true" />
                      {job.location}
                    </p>
                  </div>
                </div>
                <ul>
                  {job.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- GET /education ---------------- */}
      <Rule />
      <section id="education" className="section">
        <SectionTitle
          eyebrow="GET /education"
          first="Built on"
          accent="curiosity."
          note="Academic foundations strengthened through practical systems work."
        />

        <div className="education-grid">
          <div className="timeline" data-stagger>
            {education.map(([date, degree, school, score]) => (
              <article key={degree}>
                <i aria-hidden="true" />
                <small>{date}</small>
                <h3>{degree}</h3>
                <p>{school}</p>
                <b>{score}</b>
              </article>
            ))}
          </div>

          <aside data-reveal>
            <GraduationCap size={29} aria-hidden="true" />
            <small>CONTINUING SIGNAL</small>
            <h3>Learning is part of the operating system.</h3>
            <p>
              From data structures and core Java concepts to modern Spring Boot workflows, the focus stays on
              building practical depth through steady, hands-on work.
            </p>
            <div>
              <span>Java fundamentals</span>
              <span>Data structures</span>
              <span>Spring Boot</span>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------- POST /contact ---------------- */}
      <Rule />
      <section id="contact" className="section">
        <SectionTitle
          eyebrow="POST /contact"
          first="Let's build"
          accent="something reliable."
          note="Open to full-time roles, internships, and practical backend engineering work."
        />

        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-callout" data-reveal>
              <span>
                <i aria-hidden="true" />
                AVAILABLE FOR ROLES
              </span>
              <h3>Bring a real system problem. I'll bring a clear engineering mindset.</h3>
            </div>

            <a className="hire ripple" href={`mailto:${profile.email}?subject=Portfolio%20enquiry`} onPointerDown={() => haptic("tap")}>
              <Mail size={16} aria-hidden="true" />
              Start via email
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>

            <div className="contact-cards" data-stagger>
              <a href={`mailto:${profile.email}`} onPointerDown={() => haptic("tap")}>
                <Mail size={17} aria-hidden="true" />
                <span>
                  <small>EMAIL</small>
                  {profile.email}
                </span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" onPointerDown={() => haptic("tap")}>
                <Linkedin size={17} aria-hidden="true" />
                <span>
                  <small>LINKEDIN</small>
                  linkedin.com/in/om-mishra-b6677625b
                </span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>

            <div className="social" data-stagger>
              <a href={profile.github} target="_blank" rel="noreferrer" onPointerDown={() => haptic("tap")}>
                <Github size={18} aria-hidden="true" />
                <b>GitHub</b>
                <small>{profile.githubHandle}</small>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" onPointerDown={() => haptic("tap")}>
                <Linkedin size={18} aria-hidden="true" />
                <b>LinkedIn</b>
                <small>{profile.linkedinHandle}</small>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>

          <ContactPanel />
        </div>
      </section>

      <footer>
        <div className="footer-grid">
          <div>
            <Brand />
            <p>
              Java Backend Developer creating structured, secure systems with Spring Boot, REST APIs, and relational
              data at the core.
            </p>
          </div>
          <div>
            <small>NAVIGATION</small>
            {endpoints.map((endpoint) => (
              <a href={`#${endpoint.id}`} key={endpoint.id}>
                {endpoint.label}
              </a>
            ))}
          </div>
          <div>
            <small>CONNECT</small>
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={`mailto:${profile.email}`}>Email</a>
          </div>
          <div className="footer-status">
            <span>
              <i aria-hidden="true" />
              AVAILABLE
            </span>
            <p>
              <Clock3 size={13} aria-hidden="true" />
              {time} IST
            </p>
          </div>
        </div>

        <div className="footer-meta">
          <span>© 2026 Om Kumar Mishra. Crafted with intent.</span>
          <span>JAVA · SPRING BOOT · REST APIs · SQL</span>
        </div>
      </footer>

      {showTop && (
        <a
          className="to-top"
          href="#home"
          aria-label="Back to top"
          onPointerDown={() => haptic("tap")}
        >
          <ArrowDown size={18} aria-hidden="true" />
        </a>
      )}

      <BottomBar activeId={activeSection} />
    </main>
  );
}

import { useState } from "react";
import Builder from "./pages/Builder";
import Dashboard from "./pages/Dashboard";

import {
  migrateLegacyResume,
  getResumes,
  createResume,
} from "./utils/resumeStorage";

import "./App.css";

// Initialize resume storage before rendering
migrateLegacyResume();

function App() {
  const [page, setPage] = useState("home");

  const [selectedResumeId, setSelectedResumeId] = useState(null);

  const openDashboard = () => {
    setSelectedResumeId(null);
    setPage("dashboard");
    window.scrollTo(0, 0);
  };

  const openBuilder = (resumeId) => {
    let id = resumeId;

    // For the current Dashboard's Continue Editing button,
    // use the first saved resume or create one if needed.
    if (typeof id !== "string") {
      const resumes = getResumes();

      id = resumes.length > 0
        ? resumes[0].id
        : createResume().id;
    }

    setSelectedResumeId(id);
    setPage("builder");
    window.scrollTo(0, 0);
  };

  const openHome = () => {
    setPage("home");
    window.scrollTo(0, 0);
  };

  // DASHBOARD PAGE
  if (page === "dashboard") {
    return (
      <div className="app">
        <nav className="navbar">
          <button
            className="logo logo-button"
            onClick={openHome}
          >
            <span className="logo-icon">R</span>
            ResumeCraft
          </button>

          <button className="nav-btn" onClick={openHome}>
            ← Back to Home
          </button>
        </nav>

        <Dashboard
          onEditResume={openBuilder}
        />
      </div>
    );
  }

  // RESUME BUILDER PAGE
  if (page === "builder") {
    return (
      <div className="app">
        <nav className="navbar">
          <button
            className="logo logo-button"
            onClick={openHome}
          >
            <span className="logo-icon">R</span>
            ResumeCraft
          </button>

          <button
            className="nav-btn"
            onClick={openDashboard}
          >
            ← Dashboard
          </button>
        </nav>

        <Builder
          key={selectedResumeId}
          resumeId={selectedResumeId}
        />
      </div>
    );
  }

  // HOMEPAGE
  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <button
          className="logo logo-button"
          onClick={openHome}
        >
          <span className="logo-icon">R</span>
          ResumeCraft
        </button>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#templates">Template</a>
        </div>

        <button
          className="nav-btn"
          onClick={openDashboard}
        >
          My Dashboard →
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-content">

          <div className="hero-badge">
            ✦ PROFESSIONAL RESUME BUILDER
          </div>

          <h1>
            Build a Resume That
            <span> Gets You Noticed.</span>
          </h1>

          <p className="hero-description">
            Create a polished, professional resume in minutes.
            Showcase your skills, highlight your achievements,
            and take the next step in your career.
          </p>

          <div className="hero-actions">
            <button
              className="hero-btn"
              onClick={openDashboard}
            >
              Build My Resume →
            </button>

            <a
              className="secondary-btn"
              href="#how-it-works"
            >
              See How It Works ↓
            </a>
          </div>

          <p className="hero-small">
            ✓ Free to use &nbsp; ✓ Auto-save &nbsp; ✓ Download PDF
          </p>
        </div>

        <div className="hero-visual">
          <div className="resume-mockup">

            <div className="mockup-header">
              <h3>ALEX MORGAN</h3>
              <p>SOFTWARE ENGINEER</p>
              <span>
                alex@email.com | +1 555 0100 | New York
              </span>
            </div>

            <div className="mockup-section">
              <h4>PROFESSIONAL SUMMARY</h4>
              <div className="mockup-line long"></div>
              <div className="mockup-line"></div>
              <div className="mockup-line medium"></div>
            </div>

            <div className="mockup-section">
              <h4>WORK EXPERIENCE</h4>
              <strong>Software Engineer</strong>
              <p>Technology Company | 2022 – Present</p>
              <div className="mockup-line long"></div>
              <div className="mockup-line medium"></div>
              <div className="mockup-line"></div>
            </div>

            <div className="mockup-section">
              <h4>EDUCATION</h4>
              <strong>Bachelor of Technology</strong>
              <p>University Name | 2018 – 2022</p>
            </div>

            <div className="mockup-section">
              <h4>TECHNICAL SKILLS</h4>
              <div className="mockup-line long"></div>
              <div className="mockup-line medium"></div>
            </div>

          </div>

          <div className="floating-label">
            ✓ Professional Resume
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features" id="features">
        <div className="section-heading">
          <span className="section-tag">WHY CHOOSE US</span>
          <h2>
            Everything You Need to Build a Better Resume
          </h2>
          <p>
            Simple tools, professional formatting, and a smooth
            experience from start to finish.
          </p>
        </div>

        <div className="feature-container">

          <div className="feature-card">
            <div className="feature-icon">✎</div>
            <h3>Easy Resume Builder</h3>
            <p>
              Enter your personal details, experience, education,
              projects, and skills using simple forms.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">▤</div>
            <h3>Professional Formatting</h3>
            <p>
              Present your qualifications in a clean corporate
              resume layout suitable for job applications.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">↓</div>
            <h3>Download as PDF</h3>
            <p>
              Export your finished resume as a professional
              PDF with selectable text.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">↻</div>
            <h3>Automatic Saving</h3>
            <p>
              Your resume information is saved automatically
              in your browser while you work.
            </p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="how-it-works"
        id="how-it-works"
      >
        <div className="section-heading">
          <span className="section-tag">SIMPLE PROCESS</span>

          <h2>
            Three Steps to Your Professional Resume
          </h2>

          <p>
            Building a professional resume doesn't
            have to be complicated.
          </p>
        </div>

        <div className="steps-container">

          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Enter Your Details</h3>
            <p>
              Add your personal information, education,
              work experience, projects, and skills.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Preview Your Resume</h3>
            <p>
              See your resume update as you complete
              each section of the builder.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Download Your PDF</h3>
            <p>
              Export your completed resume and get
              ready to apply for your next opportunity.
            </p>
          </div>

        </div>
      </section>

      {/* TEMPLATE SECTION */}
      <section
        className="template-section"
        id="templates"
      >
        <div className="template-content">
          <span className="section-tag">
            PROFESSIONAL DESIGN
          </span>

          <h2>
            A Clean Resume That Keeps the Focus on You
          </h2>

          <p>
            Our corporate resume layout uses clear headings,
            readable typography, and organized sections to
            highlight your professional qualifications.
          </p>

          <div className="template-benefits">
            <p>✓ Clean, single-column layout</p>
            <p>✓ Professional black-and-white formatting</p>
            <p>✓ Organized experience and education sections</p>
            <p>✓ Selectable-text PDF export</p>
          </div>

          <button
            className="hero-btn"
            onClick={openDashboard}
          >
            Create Your Resume →
          </button>
        </div>

        <div className="template-preview">
          <div className="template-preview-icon">▤</div>
          <h3>Corporate Professional</h3>
          <p>Clean. Simple. Professional.</p>
          <span>AVAILABLE TEMPLATE</span>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <h2>
          Your Next Opportunity Starts with a Great Resume
        </h2>

        <p>
          Build a professional resume and take the next step
          toward your career goals.
        </p>

        <button
          className="hero-btn"
          onClick={openDashboard}
        >
          Get Started for Free →
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">

          <div>
            <h3>ResumeCraft</h3>
            <p>Professional resumes made simple.</p>
          </div>

          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
          </div>

        </div>

        <div className="footer-bottom">
          <p>
            © 2026 ResumeCraft. All Rights Reserved.
          </p>
          <p>Built for your career journey.</p>
        </div>
      </footer>

    </div>
  );
}

export default App;
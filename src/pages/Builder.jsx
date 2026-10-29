import { useEffect, useState } from "react";
import { generatePDF } from "../utils/generatePDF";

import {
  getResumeById,
  updateResume,
  createEmptyResumeData,
  normalizeResumeData,
} from "../utils/resumeStorage";

import "./Builder.css";

// Default resume information
const defaultResume = {
  name: "",
  jobTitle: "",
  email: "",
  phone: "",
  address: "",
  linkedin: "",
  github: "",
  summary: "",
  skills: "",
  certifications: "",
  languages: "",
};

// Default experience
const emptyExperience = () => ({
  jobTitle: "",
  company: "",
  startDate: "",
  endDate: "",
  description: "",
});

// Default education
const emptyEducation = () => ({
  degree: "",
  institution: "",
  field: "",
  startYear: "",
  endYear: "",
  grade: "",
});

// Default project
const emptyProject = () => ({
  title: "",
  technologies: "",
  description: "",
  link: "",
});

// Load the selected resume
const loadSavedData = (resumeId) => {
  if (!resumeId) {
    return createEmptyResumeData();
  }

  const savedResume = getResumeById(resumeId);

  if (!savedResume) {
    return createEmptyResumeData();
  }

  return normalizeResumeData(savedResume.data);
};

// Format date
const formatDate = (date) => {
  if (!date) return "";

  const [year, month] = date.split("-");

  if (!year || !month) return date;

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec",
  ];

  const monthIndex = Number(month) - 1;

  if (monthIndex < 0 || monthIndex > 11) return date;

  return `${monthNames[monthIndex]} ${year}`;
};

// Convert descriptions into bullet points
const getDescriptionLines = (text) => {
  if (!text) return [];

  return text
    .split("\n")
    .map((line) =>
      line.trim().replace(/^[•\-\*]\s*/, "")
    )
    .filter(Boolean);
};
function Builder({ resumeId }) {

const [initialData] = useState(() =>
  loadSavedData(resumeId)
);

  const [resume, setResume] = useState(initialData.resume);
  const [experiences, setExperiences] = useState(
    initialData.experiences
  );
  const [educations, setEducations] = useState(
    initialData.educations
  );
  const [projects, setProjects] = useState(
    initialData.projects
  );

  const [downloading, setDownloading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");

// Automatically save the selected resume
useEffect(() => {
  if (!resumeId) return;

  setSaveStatus("saving");

  const saveData = () => {
    try {
      const data = {
        resume,
        experiences,
        educations,
        projects,
      };

      updateResume(resumeId, { data });

      setSaveStatus("saved");
    } catch (error) {
      console.error("Unable to save resume:", error);
      setSaveStatus("error");
    }
  };

  // Save after the user stops typing
  const timer = setTimeout(saveData, 500);

  // Save the latest changes before leaving the Builder
  return () => {
    clearTimeout(timer);

    try {
      updateResume(resumeId, {
        data: {
          resume,
          experiences,
          educations,
          projects,
        },
      });
    } catch (error) {
      console.error("Unable to save before leaving:", error);
    }
  };
}, [
  resumeId,
  resume,
  experiences,
  educations,
  projects,
]);

  // Handle personal information
  const handleChange = (e) => {
    const { name, value } = e.target;

    setResume((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Experience functions
  const handleExperienceChange = (index, field, value) => {
    setExperiences((previous) =>
      previous.map((experience, i) =>
        i === index
          ? { ...experience, [field]: value }
          : experience
      )
    );
  };

  const addExperience = () => {
    setExperiences((previous) => [
      ...previous,
      emptyExperience(),
    ]);
  };

  const removeExperience = (index) => {
    setExperiences((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // Education functions
  const handleEducationChange = (index, field, value) => {
    setEducations((previous) =>
      previous.map((education, i) =>
        i === index
          ? { ...education, [field]: value }
          : education
      )
    );
  };

  const addEducation = () => {
    setEducations((previous) => [
      ...previous,
      emptyEducation(),
    ]);
  };

  const removeEducation = (index) => {
    setEducations((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // Project functions
  const handleProjectChange = (index, field, value) => {
    setProjects((previous) =>
      previous.map((project, i) =>
        i === index
          ? { ...project, [field]: value }
          : project
      )
    );
  };

  const addProject = () => {
    setProjects((previous) => [
      ...previous,
      emptyProject(),
    ]);
  };

  const removeProject = (index) => {
    setProjects((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // Download PDF
  const downloadPDF = () => {
  if (downloading) return;

  setDownloading(true);

  try {
    generatePDF(
      resume,
      experiences,
      educations,
      projects
    );
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("Unable to generate PDF. Please try again.");
  } finally {
    setDownloading(false);
  }
};

  // Reusable input field
  const renderInput = (
    label,
    name,
    placeholder,
    type = "text"
  ) => (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={resume[name]}
        onChange={handleChange}
      />
    </div>
  );

  // Reusable textarea
  const renderTextarea = (label, name, placeholder) => (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>

      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={resume[name]}
        onChange={handleChange}
      />
    </div>
  );

  // Filter empty entries from preview
  const visibleExperiences = experiences.filter(
    (exp) =>
      exp.jobTitle ||
      exp.company ||
      exp.startDate ||
      exp.endDate ||
      exp.description
  );

  const visibleEducations = educations.filter(
    (edu) =>
      edu.degree ||
      edu.institution ||
      edu.field ||
      edu.startYear ||
      edu.endYear ||
      edu.grade
  );

  const visibleProjects = projects.filter(
    (project) =>
      project.title ||
      project.technologies ||
      project.description ||
      project.link
  );

  return (
    <div className="builder-page">

      {/* PAGE HEADER */}

      <div className="builder-header">
        <h1>Professional Resume Builder</h1>

        <p>
          Enter your information and create a professional
          corporate resume.
        </p>
      </div>

      <div className="builder-container">

        {/* LEFT SIDE: RESUME FORM */}

        <div className="resume-form">

          {/* PERSONAL INFORMATION */}

          <h2>Personal Information</h2>

          {renderInput(
            "Full Name",
            "name",
            "Enter your full name"
          )}

          {renderInput(
            "Professional Job Title",
            "jobTitle",
            "Software Developer"
          )}

          {renderInput(
            "Email Address",
            "email",
            "example@gmail.com",
            "email"
          )}

          {renderInput(
            "Phone Number",
            "phone",
            "+91 9876543210",
            "tel"
          )}

          {renderInput(
            "Address",
            "address",
            "Kolkata, India"
          )}

          {renderInput(
            "LinkedIn Profile",
            "linkedin",
            "linkedin.com/in/username"
          )}

          {renderInput(
            "GitHub / Portfolio",
            "github",
            "github.com/username"
          )}

          {/* SUMMARY */}

          <h2>Professional Summary</h2>

          {renderTextarea(
            "About Yourself",
            "summary",
            "Write a short professional summary..."
          )}

          {/* WORK EXPERIENCE */}

          <h2>Work Experience</h2>

          {experiences.map((exp, index) => (
            <div className="experience-card" key={index}>

              <h3>Experience {index + 1}</h3>

              <label>Job Title</label>

              <input
                type="text"
                placeholder="Frontend Developer"
                value={exp.jobTitle}
                onChange={(e) =>
                  handleExperienceChange(
                    index,
                    "jobTitle",
                    e.target.value
                  )
                }
              />

              <label>Company Name</label>

              <input
                type="text"
                placeholder="ABC Technologies"
                value={exp.company}
                onChange={(e) =>
                  handleExperienceChange(
                    index,
                    "company",
                    e.target.value
                  )
                }
              />

              <label>Start Date</label>

              <input
                type="month"
                value={exp.startDate}
                onChange={(e) =>
                  handleExperienceChange(
                    index,
                    "startDate",
                    e.target.value
                  )
                }
              />

              <label>End Date</label>

              <input
                type="month"
                value={exp.endDate}
                onChange={(e) =>
                  handleExperienceChange(
                    index,
                    "endDate",
                    e.target.value
                  )
                }
              />

              <label>Job Description</label>

              <textarea
                placeholder="Describe your responsibilities and achievements..."
                value={exp.description}
                onChange={(e) =>
                  handleExperienceChange(
                    index,
                    "description",
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                className="remove-btn"
                onClick={() => removeExperience(index)}
              >
                Remove Experience
              </button>

            </div>
          ))}

          <button
            type="button"
            className="add-btn"
            onClick={addExperience}
          >
            + Add Another Experience
          </button>

          {/* EDUCATION */}

          <h2>Education</h2>

          {educations.map((edu, index) => (
            <div className="education-card" key={index}>

              <h3>Education {index + 1}</h3>

              <label>Degree / Qualification</label>

              <input
                type="text"
                placeholder="Bachelor of Technology"
                value={edu.degree}
                onChange={(e) =>
                  handleEducationChange(
                    index,
                    "degree",
                    e.target.value
                  )
                }
              />

              <label>College / University</label>

              <input
                type="text"
                placeholder="XYZ University"
                value={edu.institution}
                onChange={(e) =>
                  handleEducationChange(
                    index,
                    "institution",
                    e.target.value
                  )
                }
              />

              <label>Field of Study</label>

              <input
                type="text"
                placeholder="Computer Science"
                value={edu.field}
                onChange={(e) =>
                  handleEducationChange(
                    index,
                    "field",
                    e.target.value
                  )
                }
              />

              <label>Start Year</label>

              <input
                type="number"
                placeholder="2022"
                value={edu.startYear}
                onChange={(e) =>
                  handleEducationChange(
                    index,
                    "startYear",
                    e.target.value
                  )
                }
              />

              <label>Graduation Year</label>

              <input
                type="number"
                placeholder="2026"
                value={edu.endYear}
                onChange={(e) =>
                  handleEducationChange(
                    index,
                    "endYear",
                    e.target.value
                  )
                }
              />

              <label>CGPA / Percentage</label>

              <input
                type="text"
                placeholder="8.5 CGPA"
                value={edu.grade}
                onChange={(e) =>
                  handleEducationChange(
                    index,
                    "grade",
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                className="remove-btn"
                onClick={() => removeEducation(index)}
              >
                Remove Education
              </button>

            </div>
          ))}

          <button
            type="button"
            className="add-btn"
            onClick={addEducation}
          >
            + Add Another Education
          </button>

          {/* PROJECTS */}

          <h2>Projects</h2>

          {projects.map((project, index) => (
            <div className="project-card" key={index}>

              <h3>Project {index + 1}</h3>

              <label>Project Name</label>

              <input
                type="text"
                placeholder="E-Commerce Website"
                value={project.title}
                onChange={(e) =>
                  handleProjectChange(
                    index,
                    "title",
                    e.target.value
                  )
                }
              />

              <label>Technologies Used</label>

              <input
                type="text"
                placeholder="React, JavaScript, CSS"
                value={project.technologies}
                onChange={(e) =>
                  handleProjectChange(
                    index,
                    "technologies",
                    e.target.value
                  )
                }
              />

              <label>Project Description</label>

              <textarea
                placeholder="Describe your project..."
                value={project.description}
                onChange={(e) =>
                  handleProjectChange(
                    index,
                    "description",
                    e.target.value
                  )
                }
              />

              <label>Project Link</label>

              <input
                type="url"
                placeholder="https://github.com/username/project"
                value={project.link}
                onChange={(e) =>
                  handleProjectChange(
                    index,
                    "link",
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                className="remove-btn"
                onClick={() => removeProject(index)}
              >
                Remove Project
              </button>

            </div>
          ))}

          <button
            type="button"
            className="add-btn"
            onClick={addProject}
          >
            + Add Another Project
          </button>

          {/* SKILLS */}

          <h2>Technical Skills</h2>

          {renderTextarea(
            "Skills",
            "skills",
            "HTML, CSS, JavaScript, React, Git..."
          )}

          {/* CERTIFICATIONS */}

          <h2>Certifications</h2>

          {renderTextarea(
            "Certifications",
            "certifications",
            "AWS Certified Cloud Practitioner..."
          )}

          {/* LANGUAGES */}

          <h2>Languages</h2>

          {renderTextarea(
            "Languages Known",
            "languages",
            "English, Hindi, Bengali..."
          )}

        </div>

        {/* RIGHT SIDE: RESUME PREVIEW */}

        <div className="resume-preview-container">

          <h2>Corporate Resume Preview</h2>

          <div className="corporate-resume">

            {/* HEADER */}

            <header className="corporate-header">

              <h1>
                {resume.name || "YOUR FULL NAME"}
              </h1>

              <h3>
                {resume.jobTitle || "Professional Job Title"}
              </h3>

              <div className="corporate-contact">

                {resume.address && (
                  <span>{resume.address}</span>
                )}

                {resume.phone && (
                  <span>{resume.phone}</span>
                )}

                {resume.email && (
                  <span>{resume.email}</span>
                )}

              </div>

              <div className="corporate-links">

                {resume.linkedin && (
                  <span>{resume.linkedin}</span>
                )}

                {resume.github && (
                  <span>{resume.github}</span>
                )}

              </div>

            </header>

            {/* PROFESSIONAL SUMMARY */}

            {resume.summary && (
              <section className="corporate-section">

                <h2>PROFESSIONAL SUMMARY</h2>

                <p>{resume.summary}</p>

              </section>
            )}

            {/* WORK EXPERIENCE */}

            {visibleExperiences.length > 0 && (
              <section className="corporate-section">

                <h2>WORK EXPERIENCE</h2>

                {visibleExperiences.map((exp, index) => (
                  <div
                    className="experience-preview"
                    key={index}
                  >

                    <div className="experience-heading">

                      <strong>{exp.jobTitle}</strong>

                      <span>
                        {formatDate(exp.startDate)}
                        {exp.startDate && " - "}
                        {exp.endDate
                          ? formatDate(exp.endDate)
                          : exp.startDate
                            ? "Present"
                            : ""}
                      </span>

                    </div>

                    {exp.company && (
                      <p className="company-name">
                        {exp.company}
                      </p>
                    )}

                    {exp.description && (
  <ul className="resume-bullets">
    {getDescriptionLines(exp.description).map(
      (line, index) => (
        <li key={index}>{line}</li>
      )
    )}
  </ul>
)}

                  </div>
                ))}

              </section>
            )}

            {/* EDUCATION */}

            {visibleEducations.length > 0 && (
              <section className="corporate-section">

                <h2>EDUCATION</h2>

                {visibleEducations.map((edu, index) => (
                  <div
                    className="education-preview"
                    key={index}
                  >

                    <div className="education-heading">

                      <strong>{edu.degree}</strong>

                      <span>
                        {[edu.startYear, edu.endYear]
                          .filter(Boolean)
                          .join(" - ")}
                      </span>

                    </div>

                    {edu.institution && (
                      <p className="institution-name">
                        {edu.institution}
                      </p>
                    )}

                    {edu.field && (
                      <p>{edu.field}</p>
                    )}

                    {edu.grade && (
                      <p>Grade: {edu.grade}</p>
                    )}

                  </div>
                ))}

              </section>
            )}

            {/* PROJECTS */}

            {visibleProjects.length > 0 && (
              <section className="corporate-section">

                <h2>PROJECTS</h2>

                {visibleProjects.map((project, index) => (
                  <div
                    className="project-preview"
                    key={index}
                  >

                    {project.title && (
                      <h3>{project.title}</h3>
                    )}

                    {project.technologies && (
                      <p className="project-technologies">
                        {project.technologies}
                      </p>
                    )}

                    {project.description && (
                      <p>{project.description}</p>
                    )}

                    {project.link && (
                      <p className="project-link">
                        {project.link}
                      </p>
                    )}

                  </div>
                ))}

              </section>
            )}

            {/* TECHNICAL SKILLS */}

            {resume.skills && (
              <section className="corporate-section">

                <h2>TECHNICAL SKILLS</h2>

                <p>{resume.skills}</p>

              </section>
            )}

            {/* CERTIFICATIONS */}

            {resume.certifications && (
              <section className="corporate-section">

                <h2>CERTIFICATIONS</h2>

                <p>{resume.certifications}</p>

              </section>
            )}

            {/* LANGUAGES */}

            {resume.languages && (
              <section className="corporate-section">

                <h2>LANGUAGES</h2>

                <p>{resume.languages}</p>

              </section>
            )}

          </div>

          {/* DOWNLOAD BUTTON */}

          <button
            className="download-pdf-btn"
            onClick={downloadPDF}
            disabled={downloading}
          >
            {downloading
              ? "Generating PDF..."
              : "📥 Download Corporate Resume"}
          </button>

          <div className={`resume-save-status ${saveStatus}`}>
  {saveStatus === "saving" && "◌ Saving changes..."}

  {saveStatus === "saved" && "✓ All changes saved"}

  {saveStatus === "error" && "⚠ Unable to save changes"}
</div>

        </div>

      </div>

    </div>
  );
}

export default Builder;
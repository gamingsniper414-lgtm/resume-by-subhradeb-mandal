import { useRef, useState } from "react";

import {
  getResumes,
  createResume,
  deleteResume,
  duplicateResume,
  renameResume,
  exportResumeJSON,
  importResumeJSON,
} from "../utils/resumeStorage";

import "./Dashboard.css";

// Calculate resume completion
const calculateProgress = (data) => {
  const resume = data?.resume || {};
  const experiences = data?.experiences || [];
  const educations = data?.educations || [];
  const projects = data?.projects || [];

  const completed = [
    Boolean(resume.name?.trim() && resume.email?.trim()),
    Boolean(resume.summary?.trim()),

    experiences.some(
      (exp) => exp?.jobTitle?.trim() || exp?.company?.trim()
    ),

    educations.some(
      (edu) => edu?.degree?.trim() || edu?.institution?.trim()
    ),

    projects.some(
      (project) => project?.title?.trim()
    ),

    Boolean(resume.skills?.trim()),
  ].filter(Boolean).length;

  return Math.round((completed / 6) * 100);
};

// Format date
const formatDate = (date) => {
  if (!date) return "Unknown";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function Dashboard({ onEditResume }) {
  const [resumes, setResumes] = useState(getResumes);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const refreshResumes = () => {
    setResumes(getResumes());
  };

  // CREATE RESUME
  const handleCreate = () => {
    const title = window.prompt(
      "Enter a name for your new resume:",
      "My Resume"
    );

    if (title === null) return;

    try {
      const newResume = createResume(
        title.trim() || "Untitled Resume"
      );

      refreshResumes();
      onEditResume(newResume.id);
    } catch (error) {
      console.error("Unable to create resume:", error);
      window.alert("Unable to create resume. Please try again.");
    }
  };

  // RENAME RESUME
  const handleRename = (resume) => {
    const title = window.prompt(
      "Enter a new name for your resume:",
      resume.title
    );

    if (title === null || !title.trim()) return;

    try {
      renameResume(resume.id, title.trim());
      refreshResumes();
    } catch (error) {
      console.error("Unable to rename resume:", error);
      window.alert("Unable to rename resume.");
    }
  };

  // DUPLICATE RESUME
  const handleDuplicate = (id) => {
    try {
      duplicateResume(id);
      refreshResumes();
    } catch (error) {
      console.error("Unable to duplicate resume:", error);
      window.alert("Unable to duplicate resume.");
    }
  };

  // DELETE RESUME
  const handleDelete = (resume) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${resume.title}"?`
    );

    if (!confirmed) return;

    try {
      deleteResume(resume.id);
      refreshResumes();
    } catch (error) {
      console.error("Unable to delete resume:", error);
      window.alert("Unable to delete resume.");
    }
  };

  // EXPORT RESUME
  const handleExport = (id) => {
    try {
      exportResumeJSON(id);
    } catch (error) {
      console.error("Unable to export resume:", error);
      window.alert("Unable to export resume.");
    }
  };

  // IMPORT RESUME
  const handleImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImporting(true);

    try {
      await importResumeJSON(file);

      refreshResumes();

      window.alert("Resume imported successfully!");
    } catch (error) {
      console.error("Unable to import resume:", error);

      window.alert(
        error.message || "Unable to import resume."
      );
    } finally {
      setImporting(false);

      // Allow the same file to be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <main className="dashboard">

      {/* DASHBOARD HEADER */}
      <header className="dashboard-header">
        <div>
          <span className="dashboard-tag">
            YOUR WORKSPACE
          </span>

          <h1>My Resumes</h1>

          <p>
            Create, manage, import, and export professional
            resumes for different job opportunities.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            className="dashboard-import-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? "Importing..." : "↑ Import Resume"}
          </button>

          <button
            className="dashboard-header-btn"
            onClick={handleCreate}
          >
            + Create New Resume
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          style={{ display: "none" }}
          aria-label="Import resume JSON file"
        />
      </header>

      {/* RESUME COLLECTION */}
      {resumes.length === 0 ? (
        <div className="dashboard-empty">
          <div className="dashboard-empty-icon">▤</div>

          <h2>No Resumes Yet</h2>

          <p>
            Create your first resume or import a
            previously exported resume.
          </p>

          <button
            className="dashboard-btn primary"
            onClick={handleCreate}
          >
            Create My First Resume →
          </button>
        </div>
      ) : (
        <div className="resume-dashboard-grid">
          {resumes.map((item) => {
            const progress = calculateProgress(item.data);

            return (
              <article
                className="saved-resume-card"
                key={item.id}
              >
                <div className="saved-resume-icon">
                  ▤
                </div>

                <h2>{item.title}</h2>

                <p className="saved-resume-name">
                  {item.data?.resume?.name ||
                    "Name not added"}
                </p>

                <p className="saved-resume-date">
                  Updated: {formatDate(item.updatedAt)}
                </p>

                <div className="saved-resume-progress">
                  <div className="saved-resume-progress-heading">
                    <span>Completion</span>
                    <strong>{progress}%</strong>
                  </div>

                  <div
                    className="progress-bar"
                    role="progressbar"
                    aria-label={`${item.title} completion`}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="saved-resume-actions">
                  <button
                    className="dashboard-btn primary"
                    onClick={() => onEditResume(item.id)}
                  >
                    ✎ Edit Resume
                  </button>

                  <div className="saved-resume-secondary-actions">
                    <button
                      onClick={() => handleRename(item)}
                    >
                      Rename
                    </button>

                    <button
                      onClick={() => handleDuplicate(item.id)}
                    >
                      Duplicate
                    </button>

                    <button
                      onClick={() => handleExport(item.id)}
                    >
                      Export JSON
                    </button>

                    <button
                      className="delete-action"
                      onClick={() => handleDelete(item)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Dashboard;
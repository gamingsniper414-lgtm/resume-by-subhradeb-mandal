const STORAGE_KEY = "resumecraft_resumes";
const LEGACY_KEY = "resumecraft_data";

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

const emptyExperience = () => ({
  jobTitle: "",
  company: "",
  startDate: "",
  endDate: "",
  description: "",
});

const emptyEducation = () => ({
  degree: "",
  institution: "",
  field: "",
  startYear: "",
  endYear: "",
  grade: "",
});

const emptyProject = () => ({
  title: "",
  technologies: "",
  description: "",
  link: "",
});

// Create a fresh, independent set of resume fields
export const createEmptyResumeData = () => ({
  resume: { ...defaultResume },
  experiences: [emptyExperience()],
  educations: [emptyEducation()],
  projects: [emptyProject()],
});

// Make sure loaded data has the expected structure
export const normalizeResumeData = (data = {}) => ({
  resume: {
    ...defaultResume,
    ...(data?.resume || {}),
  },

  experiences: Array.isArray(data?.experiences)
    ? data.experiences
    : [emptyExperience()],

  educations: Array.isArray(data?.educations)
    ? data.educations
    : [emptyEducation()],

  projects: Array.isArray(data?.projects)
    ? data.projects
    : [emptyProject()],
});

// Create a unique identifier
const createId = () => crypto.randomUUID();

// Read saved resumes
export const getResumes = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Unable to load resumes:", error);
    return [];
  }
};

// Save the full resume collection
export const saveResumes = (resumes) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(resumes)
  );
};

// Create a new resume
export const createResume = (title = "Untitled Resume") => {
  const now = new Date().toISOString();

  const newResume = {
    id: createId(),
    title,
    createdAt: now,
    updatedAt: now,
    data: createEmptyResumeData(),
  };

  const resumes = getResumes();

  saveResumes([newResume, ...resumes]);

  return newResume;
};

// Find one resume by its ID
export const getResumeById = (id) => {
  return getResumes().find((resume) => resume.id === id);
};

// Update an existing resume
export const updateResume = (id, changes) => {
  const resumes = getResumes();

  const updated = resumes.map((resume) => {
    if (resume.id !== id) return resume;

    return {
      ...resume,
      ...changes,
      updatedAt: new Date().toISOString(),
    };
  });

  saveResumes(updated);
};

// Delete a resume
export const deleteResume = (id) => {
  const resumes = getResumes();

  saveResumes(
    resumes.filter((resume) => resume.id !== id)
  );
};

// Duplicate a resume
export const duplicateResume = (id) => {
  const original = getResumeById(id);

  if (!original) return null;

  const now = new Date().toISOString();

  const copy = {
    id: createId(),
    title: `${original.title} (Copy)`,
    createdAt: now,
    updatedAt: now,
    data: structuredClone(original.data),
  };

  saveResumes([copy, ...getResumes()]);

  return copy;
};

// Rename a resume
export const renameResume = (id, title) => {
  updateResume(id, { title });
};

// Migrate the old single-resume data
export const migrateLegacyResume = () => {
  try {
    // Never migrate again if the new system already exists
    if (localStorage.getItem(STORAGE_KEY) !== null) {
      return;
    }

    const legacy = localStorage.getItem(LEGACY_KEY);

    if (!legacy) {
      saveResumes([]);
      return;
    }

    const parsed = JSON.parse(legacy);

    const now = new Date().toISOString();

    const migratedResume = {
      id: createId(),
      title: parsed?.resume?.name
        ? `${parsed.resume.name}'s Resume`
        : "My First Resume",
      createdAt: now,
      updatedAt: now,
      data: normalizeResumeData(parsed),
    };

    saveResumes([migratedResume]);

    // Keep old data untouched as a backup
  } catch (error) {
    console.error("Resume migration failed:", error);
  }
};
// Export one resume as a JSON file
export const exportResumeJSON = (id) => {
  const resume = getResumeById(id);

  if (!resume) {
    throw new Error("Resume not found.");
  }

  const json = JSON.stringify(resume, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  const safeTitle = resume.title
    .replace(/[^a-z0-9_-]/gi, "_")
    .slice(0, 80);

  link.download = `${safeTitle || "Resume"}.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

// Import a resume from a JSON file
export const importResumeJSON = async (file) => {
  if (!file) {
    throw new Error("Please select a JSON file.");
  }

  if (!file.name.toLowerCase().endsWith(".json")) {
    throw new Error("Only JSON files are supported.");
  }

  // Limit file size to 1 MB
  if (file.size > 1024 * 1024) {
    throw new Error("File is too large. Maximum size is 1 MB.");
  }

  const text = await file.text();

  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file.");
  }

  // Check the basic file structure
  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    !parsed.data ||
    typeof parsed.data !== "object" ||
    !parsed.data.resume ||
    typeof parsed.data.resume !== "object"
  ) {
    throw new Error("This file is not a valid ResumeCraft export.");
  }

  const now = new Date().toISOString();

  const importedResume = {
    id: createId(),
    title:
      typeof parsed.title === "string" &&
      parsed.title.trim()
        ? `${parsed.title.trim()} (Imported)`
        : "Imported Resume",
    createdAt: now,
    updatedAt: now,
    data: normalizeResumeData(parsed.data),
  };

  saveResumes([importedResume, ...getResumes()]);

  return importedResume;
};
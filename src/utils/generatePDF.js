import { jsPDF } from "jspdf";

// Format dates: 2025-06 -> Jun 2025
const formatPDFDate = (date) => {
  if (!date) return "";

  const [year, month] = String(date).split("-");

  if (!year || !month) return date;

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec",
  ];

  const monthIndex = Number(month) - 1;

  if (monthIndex < 0 || monthIndex > 11) {
    return date;
  }

  return `${monthNames[monthIndex]} ${year}`;
};

// Convert descriptions into clean lines
const getDescriptionLines = (text) => {
  if (!text) return [];

  return String(text)
    .split("\n")
    .map((line) =>
      line.trim().replace(/^[•\-*]\s*/, "")
    )
    .filter(Boolean);
};

// Generate professional resume PDF
export const generatePDF = (
  resume,
  experiences = [],
  educations = [],
  projects = []
) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page settings
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 20;

  let y = 20;

  // Add a new page when needed
  const checkPage = (requiredHeight = 10) => {
    if (y + requiredHeight > pageHeight - bottomMargin) {
      pdf.addPage();
      y = margin;
    }
  };

  // Add text with automatic wrapping
  const addText = (
    text,
    fontSize = 10,
    bold = false,
    spacing = 4
  ) => {
    if (!text) return;

    pdf.setFont(
      "helvetica",
      bold ? "bold" : "normal"
    );

    pdf.setFontSize(fontSize);
    pdf.setTextColor(31, 41, 55);

    const paragraphs = String(text).split("\n");
    const lineHeight = fontSize * 0.45;

    paragraphs.forEach((paragraph) => {
      const lines = pdf.splitTextToSize(
        paragraph || " ",
        contentWidth
      );

      lines.forEach((line) => {
        checkPage(lineHeight);

        pdf.text(line, margin, y);
        y += lineHeight;
      });
    });

    y += spacing;
  };

  // Add section heading
  const addSection = (title) => {
    checkPage(22);

    y += 4;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(17, 24, 39);

    pdf.text(title, margin, y);

    y += 3;

    pdf.setDrawColor(156, 163, 175);
    pdf.setLineWidth(0.25);

    pdf.line(
      margin,
      y,
      pageWidth - margin,
      y
    );

    y += 7;
  };

  // Add bullet points
  const addBullets = (text) => {
    const lines = getDescriptionLines(text);

    if (!lines.length) return;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(31, 41, 55);

    const bulletIndent = 5;
    const bulletTextWidth = contentWidth - 10;
    const lineHeight = 4.5;

    lines.forEach((line) => {
      const wrappedLines = pdf.splitTextToSize(
        line,
        bulletTextWidth
      );

      wrappedLines.forEach((wrappedLine, index) => {
        checkPage(lineHeight);

        if (index === 0) {
          pdf.setFillColor(31, 41, 55);
          pdf.circle(
            margin + 2,
            y - 1,
            0.4,
            "F"
          );
        }

        pdf.text(
          wrappedLine,
          margin + bulletIndent,
          y
        );

        y += lineHeight;
      });

      y += 1;
    });

    y += 3;
  };

  // Add centered header text
  const addCenteredText = (
    text,
    fontSize = 10,
    bold = false
  ) => {
    if (!text) return;

    pdf.setFont(
      "helvetica",
      bold ? "bold" : "normal"
    );

    pdf.setFontSize(fontSize);
    pdf.setTextColor(17, 24, 39);

    const lines = pdf.splitTextToSize(
      String(text),
      contentWidth
    );

    const lineHeight = fontSize * 0.45;

    lines.forEach((line) => {
      checkPage(lineHeight);

      pdf.text(
        line,
        pageWidth / 2,
        y,
        { align: "center" }
      );

      y += lineHeight;
    });

    y += 2;
  };

  // =====================================
  // RESUME HEADER
  // =====================================

  addCenteredText(
    resume.name || "YOUR FULL NAME",
    20,
    true
  );

  addCenteredText(
    resume.jobTitle || "Professional Job Title",
    12
  );

  const contact = [
    resume.address,
    resume.phone,
    resume.email,
  ]
    .filter(Boolean)
    .join(" | ");

  addCenteredText(contact, 9);

  const links = [
    resume.linkedin,
    resume.github,
  ]
    .filter(Boolean)
    .join(" | ");

  addCenteredText(links, 9);

  // Header separator
  checkPage(8);

  pdf.setDrawColor(17, 24, 39);
  pdf.setLineWidth(0.5);

  pdf.line(
    margin,
    y,
    pageWidth - margin,
    y
  );

  y += 7;

  // =====================================
  // PROFESSIONAL SUMMARY
  // =====================================

  if (resume.summary?.trim()) {
    addSection("PROFESSIONAL SUMMARY");
    addText(resume.summary, 9.5);
  }

  // =====================================
  // WORK EXPERIENCE
  // =====================================

  const validExperiences = experiences.filter(
    (exp) =>
      exp.jobTitle ||
      exp.company ||
      exp.startDate ||
      exp.endDate ||
      exp.description
  );

  if (validExperiences.length > 0) {
    addSection("WORK EXPERIENCE");

    validExperiences.forEach((exp) => {
      checkPage(18);

      addText(exp.jobTitle, 10, true, 2);

      const dates = [
        formatPDFDate(exp.startDate),
        exp.endDate
          ? formatPDFDate(exp.endDate)
          : exp.startDate
            ? "Present"
            : "",
      ]
        .filter(Boolean)
        .join(" - ");

      const companyLine = [
        exp.company,
        dates,
      ]
        .filter(Boolean)
        .join(" | ");

      addText(companyLine, 9, false, 2);

      addBullets(exp.description);
    });
  }

  // =====================================
  // EDUCATION
  // =====================================

  const validEducations = educations.filter(
    (edu) =>
      edu.degree ||
      edu.institution ||
      edu.field ||
      edu.startYear ||
      edu.endYear ||
      edu.grade
  );

  if (validEducations.length > 0) {
    addSection("EDUCATION");

    validEducations.forEach((edu) => {
      checkPage(16);

      addText(edu.degree, 10, true, 2);

      const educationDates = [
        edu.startYear,
        edu.endYear,
      ]
        .filter(Boolean)
        .join(" - ");

      const institutionLine = [
        edu.institution,
        educationDates,
      ]
        .filter(Boolean)
        .join(" | ");

      addText(institutionLine, 9, false, 2);

      if (edu.field) {
        addText(edu.field, 9, false, 2);
      }

      if (edu.grade) {
        addText(
          `Grade: ${edu.grade}`,
          9,
          false,
          5
        );
      }
    });
  }

  // =====================================
  // PROJECTS
  // =====================================

  const validProjects = projects.filter(
    (project) =>
      project.title ||
      project.technologies ||
      project.description ||
      project.link
  );

  if (validProjects.length > 0) {
    addSection("PROJECTS");

    validProjects.forEach((project) => {
      checkPage(18);

      addText(project.title, 10, true, 2);

      addText(
        project.technologies,
        9,
        false,
        2
      );

      addBullets(project.description);

      addText(
        project.link,
        8,
        false,
        5
      );
    });
  }

  // =====================================
  // TECHNICAL SKILLS
  // =====================================

  if (resume.skills?.trim()) {
    addSection("TECHNICAL SKILLS");

    addText(
      resume.skills,
      9,
      false,
      5
    );
  }

  // =====================================
  // CERTIFICATIONS
  // =====================================

  if (resume.certifications?.trim()) {
    addSection("CERTIFICATIONS");

    addText(
      resume.certifications,
      9,
      false,
      5
    );
  }

  // =====================================
  // LANGUAGES
  // =====================================

  if (resume.languages?.trim()) {
    addSection("LANGUAGES");

    addText(
      resume.languages,
      9,
      false,
      5
    );
  }

  // =====================================
  // PAGE NUMBERS
  // =====================================

  const totalPages =
    pdf.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);

    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: "right" }
    );
  }

  // =====================================
  // DOWNLOAD PDF
  // =====================================

  const filename =
    `${
      resume.name
        ?.trim()
        .replace(/[^\w-]+/g, "_") || "My"
    }_Resume.pdf`;

  pdf.save(filename);
};
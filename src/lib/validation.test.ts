import { describe, expect, it } from "vitest";
import {
  certificationSchema,
  changePasswordSchema,
  educationSchema,
  experienceSchema,
  languageSchema,
  projectSchema,
  settingsSchema,
  skillSchema,
} from "./validation";

const baseProject = {
  title: "Título",
  category: "Categoría",
  year: "2026",
  summary: "Resumen",
  tags: ["a", "b"],
  featured: false,
  sortOrder: 0,
};

describe("projectSchema", () => {
  it("acepta un proyecto válido", () => {
    expect(projectSchema.safeParse(baseProject).success).toBe(true);
  });
  it("rechaza el título vacío", () => {
    const parsed = projectSchema.safeParse({ ...baseProject, title: "" });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0].path).toContain("title");
  });
  it("rechaza más de 50 etiquetas", () => {
    const parsed = projectSchema.safeParse({
      ...baseProject,
      tags: Array(51).fill("x"),
    });
    expect(parsed.success).toBe(false);
  });
});

const baseExperience = {
  period: "2026",
  role: "Rol",
  company: "Empresa",
  highlights: ["uno"],
  sortOrder: 0,
};

describe("experienceSchema", () => {
  it("acepta una experiencia válida", () => {
    expect(experienceSchema.safeParse(baseExperience).success).toBe(true);
  });
  it("rechaza el rol vacío", () => {
    const parsed = experienceSchema.safeParse({ ...baseExperience, role: "" });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0].path).toContain("role");
  });
});

const baseEducation = {
  period: "2026",
  degree: "Título",
  school: "Escuela",
  note: "",
  sortOrder: 0,
};

describe("educationSchema", () => {
  it("acepta una educación válida", () => {
    expect(educationSchema.safeParse(baseEducation).success).toBe(true);
  });
  it("rechaza el título vacío", () => {
    const parsed = educationSchema.safeParse({ ...baseEducation, degree: "" });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0].path).toContain("degree");
  });
});

describe("certificationSchema", () => {
  it("acepta una certificación válida", () => {
    expect(certificationSchema.safeParse({ name: "Cert", sortOrder: 0 }).success).toBe(true);
  });
  it("rechaza el nombre vacío", () => {
    expect(certificationSchema.safeParse({ name: "", sortOrder: 0 }).success).toBe(false);
  });
});

describe("languageSchema", () => {
  it("acepta un idioma válido", () => {
    expect(
      languageSchema.safeParse({ name: "Español", level: "Nativo", sortOrder: 0 }).success,
    ).toBe(true);
  });
  it("rechaza el nombre vacío", () => {
    expect(languageSchema.safeParse({ name: "", level: "Nativo", sortOrder: 0 }).success).toBe(
      false,
    );
  });
});

describe("skillSchema", () => {
  it("acepta una skill válida", () => {
    expect(skillSchema.safeParse({ kind: "software", name: "Python", sortOrder: 0 }).success).toBe(
      true,
    );
  });
  it("rechaza un kind inválido", () => {
    expect(skillSchema.safeParse({ kind: "otro", name: "Python", sortOrder: 0 }).success).toBe(
      false,
    );
  });
});

describe("settingsSchema", () => {
  const baseSettings = {
    name: "N",
    title: "T",
    tagline: "L",
    location: "L",
    email: "a@b.cl",
    linkedin: "L",
    github: "G",
    availability: "A",
    aboutHeading: "H",
    aboutP1: "P1",
    aboutP2: "P2",
    aboutP3: "P3",
  };
  it("acepta ajustes válidos", () => {
    expect(settingsSchema.safeParse(baseSettings).success).toBe(true);
  });
  it("rechaza el email inválido", () => {
    expect(settingsSchema.safeParse({ ...baseSettings, email: "no-es-un-email" }).success).toBe(
      false,
    );
  });
});

describe("changePasswordSchema", () => {
  it("acepta una contraseña nueva válida", () => {
    expect(changePasswordSchema.safeParse({ current: "actual", next: "nueva1234" }).success).toBe(
      true,
    );
  });
  it("rechaza la contraseña nueva demasiado corta", () => {
    expect(changePasswordSchema.safeParse({ current: "actual", next: "corta" }).success).toBe(
      false,
    );
  });
  it("rechaza la contraseña actual vacía", () => {
    expect(changePasswordSchema.safeParse({ current: "", next: "nueva1234" }).success).toBe(false);
  });
});

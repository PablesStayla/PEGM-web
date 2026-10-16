import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Esquema de la base de datos (SQLite + Drizzle ORM).
 * El contenido del sitio es administrable desde /admin.
 */

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("ADMIN"),
  /** Revocación de sesiones: se incrementa al cambiar la contraseña. */
  sessionEpoch: integer("session_epoch").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(), // fila única: id = 1
  name: text("name").notNull(),
  title: text("title").notNull(),
  tagline: text("tagline").notNull(),
  location: text("location").notNull(),
  email: text("email").notNull(),
  linkedin: text("linkedin").notNull(),
  github: text("github").notNull(),
  availability: text("availability").notNull(),
  aboutHeading: text("about_heading").notNull(),
  aboutP1: text("about_p1").notNull(),
  aboutP2: text("about_p2").notNull(),
  aboutP3: text("about_p3").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  year: text("year").notNull(),
  summary: text("summary").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const experience = sqliteTable("experience", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  period: text("period").notNull(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  highlights: text("highlights", { mode: "json" }).$type<string[]>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const education = sqliteTable("education", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  period: text("period").notNull(),
  degree: text("degree").notNull(),
  school: text("school").notNull(),
  note: text("note").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const certifications = sqliteTable("certifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const skills = sqliteTable("skills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").notNull(), // "software" | "area"
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const languages = sqliteTable("languages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  level: text("level").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  body: text("body").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Ventanas de rate limiting compartidas entre instancias serverless. */
export const rateLimits = sqliteTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    windowStart: integer("window_start").notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [index("rate_limits_window_idx").on(table.windowStart)],
);

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userEmail: text("user_email").notNull(),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    detail: text("detail").notNull().default(""),
    /** Clave máquina estable del evento (auth.login_failure, content.update, …). */
    event: text("event").notNull().default(""),
    /** HMAC de la IP (nunca la IP en claro). */
    ipHash: text("ip_hash").notNull().default(""),
    userAgent: text("user_agent").notNull().default(""),
    /** JSON {before, after} acotado; nunca contraseñas ni tokens. */
    diff: text("diff").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("audit_created_idx").on(table.createdAt),
    index("audit_action_idx").on(table.action, table.createdAt),
  ],
);

/** Eventos anónimos: no se guardan IP, URL completa, mensajes ni datos de formularios. */
export const analyticsEvents = sqliteTable(
  "analytics_events",
  {
    id: text("id").primaryKey(),
    visitorId: text("visitor_id").notNull(),
    sessionId: text("session_id").notNull(),
    pageId: text("page_id").notNull(),
    name: text("name").notNull(),
    path: text("path").notNull(),
    label: text("label").notNull().default(""),
    source: text("source").notNull().default("Directo"),
    campaign: text("campaign").notNull().default(""),
    device: text("device").notNull(),
    browser: text("browser").notNull(),
    country: text("country").notNull().default("Desconocido"),
    value: real("value").notNull().default(0),
    activeSeconds: integer("active_seconds").notNull().default(0),
    scrollDepth: integer("scroll_depth").notNull().default(0),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    index("analytics_created_idx").on(table.createdAt),
    index("analytics_session_idx").on(table.sessionId, table.createdAt),
    index("analytics_name_idx").on(table.name, table.createdAt),
  ],
);

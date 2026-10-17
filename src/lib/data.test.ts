import { describe, expect, it } from "vitest";
import * as t from "@/db/schema";
import { projects as seedProjects } from "@/lib/content";
import { getCertificationsFromDb, getProjectsFromDb, getSkillsFromDb } from "./data";
import { makeTestDb } from "./test-db";

describe("consultas públicas: tabla vacía vs. sembrada", () => {
  it("getProjectsFromDb: tabla vacía devuelve [] (no reaparece semilla)", async () => {
    const { db, cleanup } = await makeTestDb();
    try {
      expect(await getProjectsFromDb(db)).toEqual([]);
    } finally {
      cleanup();
    }
  });

  it("getProjectsFromDb: tabla sembrada devuelve las filas de la BD", async () => {
    const { db, cleanup } = await makeTestDb();
    try {
      await db.insert(t.projects).values({ ...seedProjects[0], sortOrder: 0 });
      const rows = await getProjectsFromDb(db);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0].title).toBe(seedProjects[0].title);
    } finally {
      cleanup();
    }
  });

  it("getCertificationsFromDb: tabla vacía devuelve []", async () => {
    const { db, cleanup } = await makeTestDb();
    try {
      expect(await getCertificationsFromDb(db)).toEqual([]);
    } finally {
      cleanup();
    }
  });

  it("getSkillsFromDb: tabla vacía devuelve { software: [], areas: [] }", async () => {
    const { db, cleanup } = await makeTestDb();
    try {
      expect(await getSkillsFromDb(db)).toEqual([]);
    } finally {
      cleanup();
    }
  });
});

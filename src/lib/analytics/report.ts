import { and, count, countDistinct, desc, eq, gte, lt, sql, sum } from "drizzle-orm";
import { getDb } from "@/db";
import { analyticsEvents as events } from "@/db/schema";
import { percentile } from "./shared";

export type Ranking = { label: string; value: number }[];
const DAY = 86400000;
export const chileDay = (timestamp: number) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(timestamp);

export async function getAnalyticsReport(days: number, now = Date.now()) {
  const db = await getDb();
  const start = now - days * DAY;
  const period = and(gte(events.createdAt, start), lt(events.createdAt, now));
  const pageviews = and(period, eq(events.name, "pageview"));
  const summary = async (from: number, to: number) => {
    const [row] = await db
      .select({
        views: count(),
        visitors: countDistinct(events.visitorId),
        sessions: countDistinct(events.sessionId),
        active: sum(events.activeSeconds),
        depth: sql<number>`coalesce(avg(${events.scrollDepth}), 0)`,
      })
      .from(events)
      .where(
        and(gte(events.createdAt, from), lt(events.createdAt, to), eq(events.name, "pageview")),
      );
    return { ...row, active: Number(row.active ?? 0), depth: Number(row.depth) };
  };
  const rank = async (
    column:
      | typeof events.path
      | typeof events.source
      | typeof events.device
      | typeof events.browser
      | typeof events.country
      | typeof events.campaign,
  ): Promise<Ranking> =>
    db
      .select({ label: column, value: count() })
      .from(events)
      .where(pageviews)
      .groupBy(column)
      .orderBy(desc(count()))
      .limit(10);
  const [
    current,
    previous,
    pages,
    sources,
    devices,
    browsers,
    countries,
    campaigns,
    actions,
    sections,
    hours,
    live,
    vitalRows,
    engaged,
    converted,
  ] = await Promise.all([
    summary(start, now),
    summary(start - days * DAY, start),
    rank(events.path),
    rank(events.source),
    rank(events.device),
    rank(events.browser),
    rank(events.country),
    rank(events.campaign),
    db
      .select({ label: events.name, value: count() })
      .from(events)
      .where(
        and(
          period,
          sql`${events.name} NOT IN ('pageview','section_view','performance','client_error')`,
        ),
      )
      .groupBy(events.name)
      .orderBy(desc(count())),
    db
      .select({ label: events.label, value: count() })
      .from(events)
      .where(and(period, eq(events.name, "section_view")))
      .groupBy(events.label)
      .orderBy(desc(count()))
      .limit(15),
    db
      .select({
        hour: sql<number>`cast(${events.createdAt} / 3600000 as integer) * 3600000`,
        value: count(),
      })
      .from(events)
      .where(pageviews)
      .groupBy(sql`cast(${events.createdAt} / 3600000 as integer)`)
      .orderBy(sql`cast(${events.createdAt} / 3600000 as integer)`),
    db
      .select({ value: countDistinct(events.sessionId) })
      .from(events)
      .where(and(gte(events.updatedAt, now - 5 * 60000), eq(events.name, "pageview"))),
    db
      .select({ label: events.label, value: events.value })
      .from(events)
      .where(and(period, eq(events.name, "performance")))
      .orderBy(desc(events.createdAt))
      .limit(10000),
    db
      .select({ session: events.sessionId })
      .from(events)
      .where(pageviews)
      .groupBy(events.sessionId)
      .having(
        sql`count(*) > 1 OR sum(${events.activeSeconds}) >= 10 OR max(${events.scrollDepth}) >= 75`,
      ),
    db
      .select({ value: countDistinct(events.sessionId) })
      .from(events)
      .where(and(period, sql`${events.name} IN ('cv_download','email_click','contact_success')`)),
  ]);
  const [errors] = await db
    .select({ value: count() })
    .from(events)
    .where(and(period, eq(events.name, "client_error")));
  const daily = new Map<string, number>();
  for (let i = days; i >= 0; i--) daily.set(chileDay(now - i * DAY), 0);
  for (const hour of hours) {
    const key = chileDay(Number(hour.hour));
    daily.set(key, (daily.get(key) ?? 0) + hour.value);
  }
  const vitals = ["LCP", "INP", "CLS", "TTFB", "FCP"].map((label) => {
    const values = vitalRows.filter((item) => item.label === label).map((item) => item.value);
    return { label, samples: values.length, p75: percentile(values) };
  });
  return {
    current,
    previous,
    pages,
    sources,
    devices,
    browsers,
    countries,
    campaigns: campaigns.filter((item) => item.label),
    actions,
    sections,
    daily: [...daily].map(([label, value]) => ({ label, value })),
    live: live[0].value,
    errors: errors.value,
    vitals,
    vitalSampleCapped: vitalRows.length === 10000,
    engagementRate: current.sessions ? (engaged.length / current.sessions) * 100 : null,
    conversionRate: current.sessions ? (converted[0].value / current.sessions) * 100 : null,
    averageSeconds: current.views ? current.active / current.views : null,
  };
}

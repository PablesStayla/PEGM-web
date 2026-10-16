import type { Metadata } from "next";
import { Portfolio } from "@/components/portfolio";
import { getSettings } from "@/lib/data";
import { en } from "@/lib/i18n/en";

export const revalidate = 120;
export const metadata: Metadata = {
  title: { absolute: "Pablo Garrido — Metallurgical Engineer | CFD & Data Analytics" },
  description:
    "Metallurgical Engineer from Universidad de Concepción. Experimental research at CODELCO, CFD in OpenFOAM and ANSYS Fluent, process simulation and data analytics.",
  alternates: { canonical: "/en", languages: { "es-CL": "/", en: "/en" } },
  openGraph: {
    locale: "en_US",
    url: "/en",
    title: "Pablo Garrido — Metallurgical Engineer",
    description: "Processes, CFD simulation and data analytics for mining and metallurgy.",
  },
};

export default async function EnglishPortfolio() {
  const settings = await getSettings();
  return (
    <Portfolio
      lang="en"
      settings={settings}
      dict={en}
      role={en.hero.role}
      stats={en.stats}
      about={en.about}
      projects={en.projects.items ?? []}
    />
  );
}

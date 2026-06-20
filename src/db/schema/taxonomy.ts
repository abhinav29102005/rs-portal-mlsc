import {
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { studentProfiles, facultyProfiles } from "./profiles";

/* ──────────────────── Skills Taxonomy ──────────────────── */

export const skills = sqliteTable("skills", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  name: text("name").notNull().unique(),
  category: text("category", {
    enum: ["language", "framework", "tool", "domain", "soft_skill"],
  }).notNull(),
});

/* ──────────────────── Student Skills (junction) ──────────────────── */

export const studentSkills = sqliteTable("student_skills", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  studentProfileId: text("student_profile_id")
    .notNull()
    .references(() => studentProfiles.id, { onDelete: "cascade" }),
  skillId: text("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  proficiency: text("proficiency", {
    enum: ["familiar", "proficient", "expert"],
  })
    .notNull()
    .default("familiar"),
});

/* ──────────────────── Research Domains Taxonomy ──────────────────── */

export const researchDomains = sqliteTable("research_domains", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  name: text("name").notNull(),
  parentDomainId: text("parent_domain_id"),
  description: text("description"),
});

/* ──────────────────── Faculty Research Domains (junction) ──────────────────── */

export const facultyResearchDomains = sqliteTable("faculty_research_domains", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  facultyProfileId: text("faculty_profile_id")
    .notNull()
    .references(() => facultyProfiles.id, { onDelete: "cascade" }),
  researchDomainId: text("research_domain_id")
    .notNull()
    .references(() => researchDomains.id, { onDelete: "cascade" }),
});

/* ──────────────────── Student Research Domains (junction) ──────────────────── */

export const studentResearchDomains = sqliteTable("student_research_domains", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => globalThis.crypto.randomUUID()),
  studentProfileId: text("student_profile_id")
    .notNull()
    .references(() => studentProfiles.id, { onDelete: "cascade" }),
  researchDomainId: text("research_domain_id")
    .notNull()
    .references(() => researchDomains.id, { onDelete: "cascade" }),
});

/* ──────────────────── Relations ──────────────────── */

export const skillsRelations = relations(skills, ({ many }) => ({
  studentSkills: many(studentSkills),
}));

export const studentSkillsRelations = relations(studentSkills, ({ one }) => ({
  studentProfile: one(studentProfiles, {
    fields: [studentSkills.studentProfileId],
    references: [studentProfiles.id],
  }),
  skill: one(skills, {
    fields: [studentSkills.skillId],
    references: [skills.id],
  }),
}));

export const researchDomainsRelations = relations(
  researchDomains,
  ({ one, many }) => ({
    parent: one(researchDomains, {
      fields: [researchDomains.parentDomainId],
      references: [researchDomains.id],
      relationName: "domainHierarchy",
    }),
    children: many(researchDomains, { relationName: "domainHierarchy" }),
    facultyDomains: many(facultyResearchDomains),
    studentDomains: many(studentResearchDomains),
  })
);

export const facultyResearchDomainsRelations = relations(
  facultyResearchDomains,
  ({ one }) => ({
    facultyProfile: one(facultyProfiles, {
      fields: [facultyResearchDomains.facultyProfileId],
      references: [facultyProfiles.id],
    }),
    researchDomain: one(researchDomains, {
      fields: [facultyResearchDomains.researchDomainId],
      references: [researchDomains.id],
    }),
  })
);

export const studentResearchDomainsRelations = relations(
  studentResearchDomains,
  ({ one }) => ({
    studentProfile: one(studentProfiles, {
      fields: [studentResearchDomains.studentProfileId],
      references: [studentProfiles.id],
    }),
    researchDomain: one(researchDomains, {
      fields: [studentResearchDomains.researchDomainId],
      references: [researchDomains.id],
    }),
  })
);

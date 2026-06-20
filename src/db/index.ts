import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import * as users from "@/db/schema/users";
import * as profiles from "@/db/schema/profiles";
import * as taxonomy from "@/db/schema/taxonomy";
import * as portfolio from "@/db/schema/portfolio";
import * as openings from "@/db/schema/openings";
import * as proposals from "@/db/schema/proposals";
import * as workspaces from "@/db/schema/workspaces";
import * as messaging from "@/db/schema/messaging";
import * as alumni from "@/db/schema/alumni";
import * as events from "@/db/schema/events";

const client = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, {
  schema: {
    ...users,
    ...profiles,
    ...taxonomy,
    ...portfolio,
    ...openings,
    ...proposals,
    ...workspaces,
    ...messaging,
    ...alumni,
    ...events,
  },
});

export type Database = typeof db;

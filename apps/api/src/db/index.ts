import { env } from "../config/env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema.js";

export const pool = new Pool({ connectionString: env.databaseUrl });
export const db = drizzle(pool, { schema });

/**
 * Bootstrap entry point — MUST be the first module executed.
 *
 * WHY this exists:
 * ES module `import` statements are statically hoisted to the top of the file.
 * This means that even if you write `dotenv.config()` before your imports in
 * server.ts, ALL service singleton constructors (Redis, Supabase, Groq, Neo4j)
 * already run at import-resolution time, before dotenv has populated process.env.
 *
 * The solution: call dotenv.config() HERE, synchronously, and then use a
 * dynamic import() for server.ts. Dynamic imports are NOT hoisted, so env vars
 * are guaranteed to be set before any service constructor runs.
 */
import { config } from 'dotenv';

// Populate process.env synchronously — this MUST happen before any other import
config();

// Dynamic import ensures server.ts (and all its transitive service singletons)
// only load AFTER process.env is fully populated
import('./server.js').catch((err) => {
  console.error('[Bootstrap] Failed to start server:', err);
  process.exit(1);
});

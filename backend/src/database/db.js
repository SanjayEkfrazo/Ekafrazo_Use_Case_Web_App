// Set up the SQLite database connection
// This file creates the connection once and shares it across the app

const { DatabaseSync } = require("node:sqlite");
const { DB_PATH } = require("../config/database.config");

// Open (or create) the SQLite database file
const db = new DatabaseSync(DB_PATH);

// Create the use_cases table if it does not already exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS use_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    domain TEXT NOT NULL,
    domain_image_url TEXT NOT NULL DEFAULT '',
    deployment_url TEXT NOT NULL DEFAULT '',
    resource_url TEXT NOT NULL DEFAULT '',
    client_name TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    business_problem TEXT NOT NULL,
    proposed_solution TEXT NOT NULL,
    technology_stack TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`;

db.exec(createTableQuery);

function ensureColumn(columnName, columnDefinition) {
  const columns = db.prepare("PRAGMA table_info(use_cases)").all();
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE use_cases ADD COLUMN ${columnName} ${columnDefinition}`);
  }
}

// Keep existing DB files compatible by adding new required fields if missing.
ensureColumn("deployment_url", "TEXT NOT NULL DEFAULT ''");
ensureColumn("resource_url", "TEXT NOT NULL DEFAULT ''");
ensureColumn("client_name", "TEXT NOT NULL DEFAULT ''");

function migrateUseCasesTableRemoveStatusPriority() {
  const columns = db.prepare("PRAGMA table_info(use_cases)").all().map((column) => column.name);
  const hasStatus = columns.includes("status");
  const hasPriority = columns.includes("priority");

  if (!hasStatus && !hasPriority) {
    return;
  }

  db.exec("BEGIN");
  try {
    db.exec(`
      CREATE TABLE use_cases_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        domain TEXT NOT NULL,
        domain_image_url TEXT NOT NULL DEFAULT '',
        deployment_url TEXT NOT NULL DEFAULT '',
        resource_url TEXT NOT NULL DEFAULT '',
        client_name TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL,
        business_problem TEXT NOT NULL,
        proposed_solution TEXT NOT NULL,
        technology_stack TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    db.exec(`
      INSERT INTO use_cases_new (
        id,
        title,
        description,
        domain,
        deployment_url,
        resource_url,
        client_name,
        category,
        business_problem,
        proposed_solution,
        technology_stack,
        created_at,
        updated_at
      )
      SELECT
        id,
        title,
        description,
        domain,
        deployment_url,
        resource_url,
        client_name,
        category,
        business_problem,
        proposed_solution,
        technology_stack,
        created_at,
        updated_at
      FROM use_cases
    `);

    db.exec("DROP TABLE use_cases");
    db.exec("ALTER TABLE use_cases_new RENAME TO use_cases");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

migrateUseCasesTableRemoveStatusPriority();

// Keep existing DB files compatible by adding optional image URL if missing.
ensureColumn("domain_image_url", "TEXT NOT NULL DEFAULT ''");

module.exports = db;

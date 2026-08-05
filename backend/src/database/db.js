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
    deployment_url TEXT NOT NULL DEFAULT '',
    resource_url TEXT NOT NULL DEFAULT '',
    client_name TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    priority TEXT NOT NULL DEFAULT 'Medium',
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

module.exports = db;

// This file contains all the raw SQL queries for the use_cases table
// Keeping SQL here means the rest of the app never writes SQL directly

const db = require("./db");

// Fetch every use case, newest updated first
function findAll() {
  const query = `SELECT * FROM use_cases ORDER BY updated_at DESC`;
  return db.prepare(query).all();
}

// Find a single use case by its id
function findById(id) {
  const query = `SELECT * FROM use_cases WHERE id = ?`;
  return db.prepare(query).get(id);
}

// Insert a new use case and return the created row
function create(useCase) {
  const query = `
    INSERT INTO use_cases (
      title, description, domain, deployment_url, resource_url, client_name, category, status, priority,
      business_problem, proposed_solution, technology_stack
    ) VALUES (
      @title, @description, @domain, @deployment_url, @resource_url, @client_name, @category, @status, @priority,
      @business_problem, @proposed_solution, @technology_stack
    )
  `;
  const result = db.prepare(query).run(useCase);
  return findById(result.lastInsertRowid);
}

// Update an existing use case by id and return the updated row
function update(id, useCase) {
  const query = `
    UPDATE use_cases SET
      title = @title,
      description = @description,
      domain = @domain,
      deployment_url = @deployment_url,
      resource_url = @resource_url,
      client_name = @client_name,
      category = @category,
      status = @status,
      priority = @priority,
      business_problem = @business_problem,
      proposed_solution = @proposed_solution,
      technology_stack = @technology_stack,
      updated_at = datetime('now')
    WHERE id = @id
  `;
  db.prepare(query).run({ ...useCase, id });
  return findById(id);
}

// Delete a use case by id
function remove(id) {
  const query = `DELETE FROM use_cases WHERE id = ?`;
  const result = db.prepare(query).run(id);
  return result.changes > 0;
}

// Count total number of use cases (used on the Dashboard)
function count() {
  const query = `SELECT COUNT(*) AS total FROM use_cases`;
  return db.prepare(query).get().total;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  count,
};

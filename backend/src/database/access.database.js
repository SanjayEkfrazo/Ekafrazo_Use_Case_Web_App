const db = require("./db");

function findUserByEmail(workEmail) {
  const query = `
    SELECT *
    FROM access_users
    WHERE LOWER(TRIM(work_email)) = LOWER(TRIM(?))
    LIMIT 1
  `;
  return db.prepare(query).get(workEmail);
}

function findUserById(id) {
  const query = `SELECT * FROM access_users WHERE id = ?`;
  return db.prepare(query).get(id);
}

function createUser(profile) {
  const query = `
    INSERT INTO access_users (
      full_name,
      work_email,
      organization,
      purpose,
      phone,
      department,
      project_timeline,
      notes
    ) VALUES (
      @full_name,
      @work_email,
      @organization,
      @purpose,
      @phone,
      @department,
      @project_timeline,
      @notes
    )
  `;

  const result = db.prepare(query).run(profile);
  return findUserById(result.lastInsertRowid);
}

function updateUserById(id, profile) {
  const query = `
    UPDATE access_users
    SET
      full_name = @full_name,
      work_email = @work_email,
      organization = @organization,
      purpose = @purpose,
      phone = @phone,
      department = @department,
      project_timeline = @project_timeline,
      notes = @notes,
      updated_at = datetime('now')
    WHERE id = @id
  `;

  db.prepare(query).run({ ...profile, id });
  return findUserById(id);
}

function touchLastSignedIn(id) {
  const query = `
    UPDATE access_users
    SET
      last_signed_in_at = datetime('now'),
      updated_at = datetime('now')
    WHERE id = ?
  `;
  db.prepare(query).run(id);
  return findUserById(id);
}

function createSigninLog(accessUserId, fullName, workEmail) {
  const query = `
    INSERT INTO access_signin_logs (access_user_id, full_name, work_email)
    VALUES (?, ?, ?)
  `;
  db.prepare(query).run(accessUserId, fullName, workEmail);
}

function findUsers({ limit = 100 } = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  const query = `
    SELECT *
    FROM access_users
    ORDER BY datetime(created_at) DESC, id DESC
    LIMIT ?
  `;
  return db.prepare(query).all(safeLimit);
}

function findSigninLogs({ limit = 200 } = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 200, 1000));
  const query = `
    SELECT
      logs.id,
      logs.access_user_id,
      logs.full_name,
      logs.work_email,
      logs.created_at,
      users.organization,
      users.department
    FROM access_signin_logs AS logs
    LEFT JOIN access_users AS users
      ON users.id = logs.access_user_id
    ORDER BY datetime(logs.created_at) DESC, logs.id DESC
    LIMIT ?
  `;
  return db.prepare(query).all(safeLimit);
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserById,
  touchLastSignedIn,
  createSigninLog,
  findUsers,
  findSigninLogs,
};

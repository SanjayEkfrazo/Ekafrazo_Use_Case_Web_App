const db = require("./db");

function findAll() {
  const query = `
    SELECT *
    FROM domain_media
    ORDER BY LOWER(TRIM(domain)) ASC, created_at DESC, id DESC
  `;
  return db.prepare(query).all();
}

function findByDomain(domain) {
  const query = `
    SELECT *
    FROM domain_media
    WHERE LOWER(TRIM(domain)) = LOWER(TRIM(?))
    ORDER BY created_at DESC, id DESC
  `;
  return db.prepare(query).all(domain);
}

function findByDomains(domains) {
  if (!Array.isArray(domains) || domains.length === 0) {
    return [];
  }

  const normalized = domains
    .map((domain) => String(domain || "").trim())
    .filter(Boolean);

  if (normalized.length === 0) {
    return [];
  }

  const placeholders = normalized.map(() => "?").join(", ");
  const query = `
    SELECT *
    FROM domain_media
    WHERE LOWER(TRIM(domain)) IN (${placeholders})
    ORDER BY created_at DESC, id DESC
  `;

  return db.prepare(query).all(...normalized.map((domain) => domain.toLowerCase()));
}

function findById(id) {
  const query = `SELECT * FROM domain_media WHERE id = ?`;
  return db.prepare(query).get(id);
}

function findByDomainAndUrl(domain, imageUrl) {
  const query = `
    SELECT *
    FROM domain_media
    WHERE LOWER(TRIM(domain)) = LOWER(TRIM(?))
      AND image_url = ?
    LIMIT 1
  `;
  return db.prepare(query).get(domain, imageUrl);
}

function create(domain, imageUrl) {
  const query = `
    INSERT INTO domain_media (domain, image_url)
    VALUES (?, ?)
  `;
  const result = db.prepare(query).run(domain, imageUrl);
  return findById(result.lastInsertRowid);
}

function updateImageUrlById(id, imageUrl) {
  const query = `
    UPDATE domain_media
    SET image_url = ?, updated_at = datetime('now')
    WHERE id = ?
  `;
  db.prepare(query).run(imageUrl, id);
  return findById(id);
}

function countByImageUrl(imageUrl) {
  const query = `SELECT COUNT(*) AS total FROM domain_media WHERE image_url = ?`;
  return Number(db.prepare(query).get(imageUrl)?.total || 0);
}

function remove(id) {
  const query = `DELETE FROM domain_media WHERE id = ?`;
  const result = db.prepare(query).run(id);
  return result.changes > 0;
}

module.exports = {
  findAll,
  findByDomain,
  findByDomains,
  findById,
  findByDomainAndUrl,
  create,
  updateImageUrlById,
  countByImageUrl,
  remove,
};

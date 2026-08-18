const browseDomainMediaDb = require("../database/browseDomainMedia.database");

function normalizeDomain(value) {
  return String(value || "").trim();
}

function getBrowseDomainMedia({ domain, domains }) {
  const resolvedDomain = normalizeDomain(domain);
  if (resolvedDomain) {
    return browseDomainMediaDb.findByDomain(resolvedDomain);
  }

  if (Array.isArray(domains) && domains.length > 0) {
    return browseDomainMediaDb.findByDomains(domains);
  }

  return browseDomainMediaDb.findAll();
}

function addBrowseDomainMediaImages(domain, imageUrls) {
  const resolvedDomain = normalizeDomain(domain);
  if (!resolvedDomain) {
    return { errors: ["domain is required"] };
  }

  const urls = Array.isArray(imageUrls)
    ? imageUrls.map((url) => String(url || "").trim()).filter(Boolean)
    : [];

  if (urls.length === 0) {
    return { errors: ["at least one image is required"] };
  }

  const nextImageUrl = urls[0];
  const existingRows = browseDomainMediaDb.findByDomain(resolvedDomain);

  if (existingRows.length === 0) {
    const created = browseDomainMediaDb.create(resolvedDomain, nextImageUrl);
    return { data: created ? [created] : [] };
  }

  const primaryRow = existingRows[0];
  const updated = browseDomainMediaDb.updateImageUrlById(primaryRow.id, nextImageUrl);
  const removedImageUrls = [];

  existingRows.slice(1).forEach((row) => {
    browseDomainMediaDb.remove(row.id);
    removedImageUrls.push(String(row.image_url || "").trim());
  });

  return {
    data: updated ? [updated] : [],
    replacedImageUrl: String(primaryRow.image_url || "").trim(),
    removedImageUrls,
  };
}

function deleteBrowseDomainMediaImage(id) {
  const existing = browseDomainMediaDb.findById(id);
  if (!existing) {
    return { notFound: true };
  }

  browseDomainMediaDb.remove(id);
  return { data: existing };
}

function replaceBrowseDomainMediaImage(id, imageUrl) {
  const existing = browseDomainMediaDb.findById(id);
  if (!existing) {
    return { notFound: true };
  }

  const nextUrl = String(imageUrl || "").trim();
  if (!nextUrl) {
    return { errors: ["image url is required"] };
  }

  const updated = browseDomainMediaDb.updateImageUrlById(id, nextUrl);
  return {
    data: updated,
    previousImageUrl: existing.image_url,
  };
}

function countImageUrlUsage(imageUrl) {
  return browseDomainMediaDb.countByImageUrl(String(imageUrl || "").trim());
}

module.exports = {
  getBrowseDomainMedia,
  addBrowseDomainMediaImages,
  deleteBrowseDomainMediaImage,
  replaceBrowseDomainMediaImage,
  countImageUrlUsage,
};

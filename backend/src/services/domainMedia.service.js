const domainMediaDb = require("../database/domainMedia.database");

function normalizeDomain(value) {
  return String(value || "").trim();
}

function getDomainMedia({ domain, domains }) {
  const resolvedDomain = normalizeDomain(domain);
  if (resolvedDomain) {
    return domainMediaDb.findByDomain(resolvedDomain);
  }

  if (Array.isArray(domains) && domains.length > 0) {
    return domainMediaDb.findByDomains(domains);
  }

  return domainMediaDb.findAll();
}

function addDomainMediaImages(domain, imageUrls) {
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

  const created = [];

  urls.forEach((imageUrl) => {
    const existing = domainMediaDb.findByDomainAndUrl(resolvedDomain, imageUrl);
    if (!existing) {
      const row = domainMediaDb.create(resolvedDomain, imageUrl);
      if (row) {
        created.push(row);
      }
    }
  });

  return { data: created };
}

function deleteDomainMediaImage(id) {
  const existing = domainMediaDb.findById(id);
  if (!existing) {
    return { notFound: true };
  }

  domainMediaDb.remove(id);
  return { data: existing };
}

function replaceDomainMediaImage(id, imageUrl) {
  const existing = domainMediaDb.findById(id);
  if (!existing) {
    return { notFound: true };
  }

  const nextUrl = String(imageUrl || "").trim();
  if (!nextUrl) {
    return { errors: ["image url is required"] };
  }

  const updated = domainMediaDb.updateImageUrlById(id, nextUrl);
  return {
    data: updated,
    previousImageUrl: existing.image_url,
  };
}

function countImageUrlUsage(imageUrl) {
  return domainMediaDb.countByImageUrl(String(imageUrl || "").trim());
}

module.exports = {
  getDomainMedia,
  addDomainMediaImages,
  deleteDomainMediaImage,
  replaceDomainMediaImage,
  countImageUrlUsage,
};

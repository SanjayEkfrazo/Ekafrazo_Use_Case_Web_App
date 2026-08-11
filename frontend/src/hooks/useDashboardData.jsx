import { useEffect, useMemo, useState } from "react";
import { fetchDashboardSummary, fetchUseCases } from "../services/useCaseService";

const DASHBOARD_CACHE_TTL_MS = 60 * 1000;
let dashboardCache = null;

function normalizeText(value) {
  return String(value || "").trim();
}

function parseTechnologyStack(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(/[,;|\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseDate(value) {
  if (!value) {
    return 0;
  }

  const parsed = new Date(String(value).replace(" ", "T")).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

async function fetchAllUseCasesForDashboard() {
  const pageSize = 100;
  let currentPage = 1;
  let totalPages = 1;
  const collected = [];

  do {
    const response = await fetchUseCases({
      page: currentPage,
      limit: pageSize,
      search: "",
      domain: "",
      sortBy: "updated_at",
      sortOrder: "desc",
    });

    collected.push(...(response?.data || []));
    totalPages = response?.pagination?.totalPages || 1;
    currentPage += 1;
  } while (currentPage <= totalPages);

  return collected;
}

export function useDashboardData(showToast) {
  const cacheIsFresh = dashboardCache && Date.now() - dashboardCache.timestamp < DASHBOARD_CACHE_TTL_MS;
  const [summary, setSummary] = useState(cacheIsFresh ? dashboardCache.summary : null);
  const [allUseCases, setAllUseCases] = useState(cacheIsFresh ? dashboardCache.allUseCases : []);
  const [isLoading, setIsLoading] = useState(!cacheIsFresh);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadSummary() {
      if (dashboardCache && Date.now() - dashboardCache.timestamp < DASHBOARD_CACHE_TTL_MS) {
        setSummary(dashboardCache.summary);
        setAllUseCases(dashboardCache.allUseCases);
        setIsLoading(false);
        return;
      }

      try {
        setHasError(false);
        const [summaryResponse, allUseCasesData] = await Promise.all([
          fetchDashboardSummary(),
          fetchAllUseCasesForDashboard(),
        ]);

        if (isCancelled) {
          return;
        }

        const nextSummary = summaryResponse.data || {};
        setSummary(nextSummary);
        setAllUseCases(allUseCasesData);
        dashboardCache = {
          timestamp: Date.now(),
          summary: nextSummary,
          allUseCases: allUseCasesData,
        };
      } catch (error) {
        if (!isCancelled) {
          setHasError(true);
          showToast(error.message || "Failed to load dashboard data", "error");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      isCancelled = true;
    };
  }, [showToast]);

  return useMemo(() => {
    const items = allUseCases;

    const domainMap = new Map();
    const clientSet = new Set();
    const technologyMap = new Map();

    let missingDeploymentCount = 0;
    let missingPresentationCount = 0;
    let missingImageCount = 0;
    let incompleteRecordsCount = 0;
    let readyForDemoAndPresentationCount = 0;
    let missingOnlyDemoCount = 0;
    let missingOnlyPresentationCount = 0;
    let missingBothLinksCount = 0;

    items.forEach((item) => {
      const domain = normalizeText(item.domain);
      const client = normalizeText(item.client_name);
      const deploymentUrl = normalizeText(item.deployment_url);
      const resourceUrl = normalizeText(item.resource_url);
      const imageUrl = normalizeText(item.domain_image_url);
      const createdAt = parseDate(item.created_at || item.updated_at);

      if (domain) {
        domainMap.set(domain, (domainMap.get(domain) || 0) + 1);
      }
      if (client) {
        clientSet.add(client.toLowerCase());
      }

      parseTechnologyStack(item.technology_stack).forEach((techName) => {
        technologyMap.set(techName, (technologyMap.get(techName) || 0) + 1);
      });

      if (!deploymentUrl) {
        missingDeploymentCount += 1;
      }
      if (!resourceUrl) {
        missingPresentationCount += 1;
      }
      if (!imageUrl) {
        missingImageCount += 1;
      }

      const hasCoreGaps = ["title", "description", "domain", "client_name", "technology_stack"]
        .some((field) => !normalizeText(item[field]));
      if (hasCoreGaps || !deploymentUrl || !resourceUrl || !imageUrl) {
        incompleteRecordsCount += 1;
      }

      if (deploymentUrl && resourceUrl) {
        readyForDemoAndPresentationCount += 1;
      } else if (!deploymentUrl && resourceUrl) {
        missingOnlyDemoCount += 1;
      } else if (deploymentUrl && !resourceUrl) {
        missingOnlyPresentationCount += 1;
      } else {
        missingBothLinksCount += 1;
      }

      if (!Number.isFinite(createdAt)) {
        return;
      }
    });

    const domainDistribution = Array.from(domainMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const technologyDistribution = Array.from(technologyMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const totalUseCases = summary?.total ?? items.length;
    const uniqueDomainCount = summary?.uniqueDomainCount ?? domainDistribution.length;
    const withDeploymentUrlCount = summary?.withDeploymentUrlCount ?? items.length - missingDeploymentCount;
    const withResourceUrlCount = summary?.withResourceUrlCount ?? items.length - missingPresentationCount;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const createdThisMonthCount = items.filter((item) => {
      const parsedDate = parseDate(item.created_at || item.updated_at);
      if (!parsedDate) {
        return false;
      }
      const date = new Date(parsedDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    const lastUpdatedAt = items[0]?.updated_at || items[0]?.created_at || "";

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const updatedLast7Days = summary?.updatedLast7Days ?? items.filter((item) => {
      const updatedAt = parseDate(item.updated_at || item.created_at);
      return updatedAt >= sevenDaysAgo;
    }).length;

    const needsAttention = summary?.needsAttention?.length
      ? summary.needsAttention
      : items
          .filter((item) => !normalizeText(item.deployment_url) || !normalizeText(item.resource_url))
          .slice(0, 5);

    const recentlyCreated = [...items]
      .sort((a, b) => parseDate(b.created_at || b.updated_at) - parseDate(a.created_at || a.updated_at))
      .slice(0, 8);

    return {
      isLoading,
      hasError,
      totalUseCases,
      uniqueDomainCount,
      clientCount: clientSet.size,
      withDeploymentUrlCount,
      withResourceUrlCount,
      createdThisMonthCount,
      lastUpdatedAt,
      updatedLast7Days,
      technologyCount: technologyDistribution.length,
      domainDistribution,
      technologyDistribution,
      recentlyUpdated: summary?.recentlyUpdated || items.slice(0, 6),
      recentlyCreated,
      needsAttention,
      readinessDistribution: [
        { key: "ready", label: "Demo + Presentation Ready", count: readyForDemoAndPresentationCount },
        { key: "demo-missing", label: "Demo Missing", count: missingOnlyDemoCount },
        { key: "presentation-missing", label: "Presentation Missing", count: missingOnlyPresentationCount },
        { key: "both-missing", label: "Both Links Missing", count: missingBothLinksCount },
      ],
      healthCounts: {
        missingDeploymentCount,
        missingPresentationCount,
        missingImageCount,
        incompleteRecordsCount,
      },
    };
  }, [allUseCases, hasError, isLoading, summary]);
}

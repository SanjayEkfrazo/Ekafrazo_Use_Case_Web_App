import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Pencil, Trash2, UploadCloud } from "lucide-react";
import CreatableSelect from "react-select/creatable";
import Button from "../components/Button";
import Loader from "../components/Loader";
import ConfirmDialog from "../components/ConfirmDialog";
import PageNavCard from "../components/PageNavCard";
import { DOMAIN_OPTIONS } from "../utils/constants";
import { validateCustomDomain } from "../utils/validation";
import {
  deleteDomainMediaImage,
  fetchDomainMedia,
  fetchUseCaseDomains,
  replaceDomainMediaImage,
  uploadDomainMediaImages,
} from "../services/useCaseService";
import { useToast } from "../hooks/useToast";

function DomainMediaManager() {
  const { showToast } = useToast();
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [allMedia, setAllMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [isReplacingId, setIsReplacingId] = useState(null);
  const [domainError, setDomainError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingDeleteImage, setPendingDeleteImage] = useState(null);
  const [pendingReplace, setPendingReplace] = useState(null);
  const [filterDomain, setFilterDomain] = useState("");

  const normalizeDomain = (value) => String(value || "").trim().toLowerCase();

  const domainOptions = useMemo(() => {
    const baseDomains = DOMAIN_OPTIONS.filter((option) => option.value && option.value !== "Other");
    const knownLower = new Set(baseDomains.map((option) => option.value.toLowerCase()));
    const merged = baseDomains.map((option) => ({ value: option.value, label: option.label || option.value }));
    const knownDomains = [
      ...domains,
      ...allMedia.map((item) => String(item?.domain || "").trim()),
    ];

    knownDomains.forEach((domain) => {
      const trimmed = String(domain || "").trim();
      if (!trimmed) {
        return;
      }

      const lowered = trimmed.toLowerCase();
      if (!knownLower.has(lowered)) {
        knownLower.add(lowered);
        merged.push({ value: trimmed, label: trimmed });
      }
    });

    merged.sort((a, b) => a.label.localeCompare(b.label));
    return merged;
  }, [allMedia, domains]);

  const mediaDomainOptions = useMemo(() => {
    const grouped = new Map();

    allMedia.forEach((item) => {
      const value = String(item?.domain || "").trim();
      if (!value) {
        return;
      }

      const key = normalizeDomain(value);
      if (!grouped.has(key)) {
        grouped.set(key, value);
      }
    });

    return Array.from(grouped.values())
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value }));
  }, [allMedia]);

  const domainGroups = useMemo(() => {
    const grouped = new Map();

    allMedia.forEach((item) => {
      const domainName = String(item?.domain || "").trim();
      const key = normalizeDomain(domainName);
      if (!key) {
        return;
      }

      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          domain: domainName,
          images: [],
        });
      }

      grouped.get(key).images.push(item);
    });

    return Array.from(grouped.values()).sort((a, b) => {
      if (b.images.length !== a.images.length) {
        return b.images.length - a.images.length;
      }
      return a.domain.localeCompare(b.domain);
    });
  }, [allMedia]);

  const filteredDomainGroups = useMemo(() => {
    const selectedFilter = String(filterDomain || "").trim();
    if (!selectedFilter) {
      return domainGroups;
    }

    const normalizedFilter = normalizeDomain(selectedFilter);
    return domainGroups.filter((group) => normalizeDomain(group.domain) === normalizedFilter);
  }, [domainGroups, filterDomain]);

  const knownDomainValues = domainOptions.map((option) => option.value);

  const filterDomainOption = useMemo(() => {
    const currentDomain = String(filterDomain || "").trim();
    if (!currentDomain) {
      return null;
    }

    const matched = mediaDomainOptions.find((option) => normalizeDomain(option.value) === normalizeDomain(currentDomain));
    if (matched) {
      return matched;
    }

    return { value: currentDomain, label: currentDomain };
  }, [mediaDomainOptions, filterDomain]);

  const selectedDomainOption = useMemo(() => {
    const currentDomain = selectedDomain.trim();
    if (!currentDomain) {
      return null;
    }

    const matched = domainOptions.find((option) => normalizeDomain(option.value) === normalizeDomain(currentDomain));
    if (matched) {
      return matched;
    }

    return { value: currentDomain, label: currentDomain };
  }, [domainOptions, selectedDomain]);

  const validateDomainValue = (domainRawValue = selectedDomain) => {
    const resolved = String(domainRawValue || "").trim();
    if (!resolved) {
      return "Domain is required";
    }

    const entered = normalizeDomain(resolved);
    const alreadyExists = knownDomainValues.some((domain) => normalizeDomain(domain) === entered);
    if (alreadyExists) {
      return "";
    }

    return validateCustomDomain(resolved);
  };

  const findDomainMatch = (domainValue) => {
    const normalized = normalizeDomain(domainValue);
    if (!normalized) {
      return "";
    }

    return knownDomainValues.find((domain) => normalizeDomain(domain) === normalized) || "";
  };

  const loadDomains = async () => {
    try {
      const response = await fetchUseCaseDomains();
      const nextDomains = response?.data || [];
      setDomains(nextDomains);
      return nextDomains;
    } catch (error) {
      showToast(error.message || "Failed to load domains", "error");
      return [];
    }
  };

  const loadAllDomainMedia = async () => {
    try {
      const response = await fetchDomainMedia();
      setAllMedia(response?.data || []);
    } catch (error) {
      showToast(error.message || "Failed to load domain images", "error");
    }
  };

  useEffect(() => {
    async function bootstrap() {
      const loadedDomains = await loadDomains();
      await loadAllDomainMedia();
      if (!selectedDomain.trim() && Array.isArray(loadedDomains) && loadedDomains.length > 0) {
        setSelectedDomain(String(loadedDomains[0] || "").trim());
      }
      setIsLoading(false);
    }

    bootstrap();
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleUpload = async ({ domain, files }) => {
    const resolvedDomain = String(domain || "").trim();
    const safeFiles = Array.from(files || []);

    if (!resolvedDomain) {
      const message = "Domain is required";
      setDomainError(message);
      showToast(message, "error");
      return;
    }

    if (safeFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    try {
      await uploadDomainMediaImages(resolvedDomain, safeFiles);
      showToast("Domain images uploaded successfully");
      setSuccessMessage(`Uploaded ${safeFiles.length} image${safeFiles.length > 1 ? "s" : ""} to ${resolvedDomain}.`);
      await Promise.all([loadAllDomainMedia(), loadDomains()]);
    } catch (error) {
      showToast(error.message || "Failed to upload domain images", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadFromAddCard = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    const domainValidationError = validateDomainValue(selectedDomain);
    if (domainValidationError) {
      setDomainError(domainValidationError);
      showToast(domainValidationError, "error");
      return;
    }

    await handleUpload({ domain: selectedDomain.trim(), files });
  };

  const handleDomainChange = (option) => {
    const nextRawValue = option?.value || "";
    const canonicalDomain = findDomainMatch(nextRawValue);
    const nextDomain = canonicalDomain || String(nextRawValue).trim();
    setSelectedDomain(nextDomain);
    setDomainError("");
  };

  const handleDomainBlur = () => {
    setDomainError(validateDomainValue(selectedDomain));
  };

  const handleFilterDomainChange = (option) => {
    const nextRawValue = option?.value || "";
    const canonicalDomain = findDomainMatch(nextRawValue);
    const nextDomain = canonicalDomain || String(nextRawValue).trim();
    setFilterDomain(nextDomain);
  };

  const handleDelete = async (image) => {
    if (!image?.id) {
      return;
    }

    setIsDeletingId(image.id);
    try {
      await deleteDomainMediaImage(image.id);
      showToast("Image deleted successfully");
      setSuccessMessage("Image deleted successfully.");
      await loadAllDomainMedia();
    } catch (error) {
      showToast(error.message || "Failed to delete image", "error");
    } finally {
      setIsDeletingId(null);
      setPendingDeleteImage(null);
    }
  };

  const handleReplacePick = (id, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setPendingReplace({ id, file, fileName: file.name });
  };

  const handleReplace = async () => {
    if (!pendingReplace?.id || !pendingReplace?.file) {
      return;
    }

    setIsReplacingId(pendingReplace.id);
    try {
      await replaceDomainMediaImage(pendingReplace.id, pendingReplace.file);
      showToast("Image updated successfully");
      setSuccessMessage("Image updated successfully.");
      await loadAllDomainMedia();
    } catch (error) {
      showToast(error.message || "Failed to update image", "error");
    } finally {
      setIsReplacingId(null);
      setPendingReplace(null);
    }
  };

  return (
    <>
      <div className="usecase-auto-shell page-enter">
        <PageNavCard title="Detail Page Media" subtitle="Upload and manage images shown on use case detail pages." />

        <div className="p-4 md:p-6">
          <div className="w-full space-y-4">
          {successMessage && (
            <section className="rounded-xl border border-success/35 bg-success-light/45 px-3 py-2.5 text-sm text-success-text">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{successMessage}</span>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-card md:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div>
                <label htmlFor="domain-picker" className="text-xs font-medium uppercase tracking-wide text-muted">
                  Media Domain
                  <span className="ml-1 text-danger-text">*</span>
                </label>
                <div className="mt-1">
                  <CreatableSelect
                    inputId="domain-picker"
                    name="domain"
                    value={selectedDomainOption}
                    onChange={handleDomainChange}
                    onBlur={handleDomainBlur}
                    options={domainOptions}
                    isClearable
                    placeholder="Select or type media domain"
                    noOptionsMessage={({ inputValue }) =>
                      inputValue ? "Press Enter to create this domain" : "No matching domains"
                    }
                    formatCreateLabel={(inputValue) => `Create domain: "${inputValue.trim()}"`}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "rgb(var(--color-surface))",
                        borderColor: domainError
                          ? "rgb(var(--color-danger))"
                          : state.isFocused
                            ? "rgb(var(--color-primary))"
                            : "rgb(var(--color-border))",
                        boxShadow: state.isFocused ? "var(--shadow-glow-primary)" : "none",
                        minHeight: 38,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "rgb(var(--color-ink))",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "rgb(var(--color-ink))",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "rgb(var(--color-muted-dim))",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "rgb(var(--color-surface))",
                        border: "1px solid rgb(var(--color-border))",
                        boxShadow: "var(--shadow-card)",
                      }),
                      menuList: (base) => ({
                        ...base,
                        backgroundColor: "rgb(var(--color-surface))",
                        paddingTop: 4,
                        paddingBottom: 4,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? "rgb(var(--color-primary-subtle))"
                          : "rgb(var(--color-surface))",
                        color: state.isFocused
                          ? "rgb(var(--color-primary-text))"
                          : "rgb(var(--color-ink))",
                        cursor: "pointer",
                      }),
                    }}
                    classNames={{
                      control: (state) =>
                        `min-h-[38px] rounded-lg border bg-surface px-1 text-sm text-ink transition-all duration-200 ${
                          domainError ? "border-danger" : "border-border"
                        } ${state.isFocused ? "border-primary shadow-glow-primary" : ""}`,
                      valueContainer: () => "py-0",
                      input: () => "!m-0 !p-0",
                      placeholder: () => "text-muted-dim",
                      menu: () => "z-20 mt-1 overflow-hidden rounded-lg border border-border bg-surface shadow-card",
                      option: (state) =>
                        `cursor-pointer px-3 py-2 text-sm ${state.isFocused ? "bg-primary-light text-primary-text" : "text-ink"}`,
                    }}
                  />
                </div>
              </div>

              <label className="inline-flex h-[38px] cursor-pointer items-center justify-center gap-2 self-end whitespace-nowrap rounded-xl border border-dashed border-border-strong bg-surface-elevated px-3 text-sm font-semibold text-ink transition-all duration-200 hover:border-primary hover:bg-primary/10">
                <UploadCloud className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Images"}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={isUploading}
                  onChange={handleUploadFromAddCard}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-muted">Select an existing domain or create one. Custom domain must start with a letter, be 2-50 characters, and use only letters, numbers, spaces, &, /, +, and -.</p>
            {domainError && <p className="mt-1 text-xs text-danger-text">{domainError}</p>}
            <p className="mt-1 text-xs text-muted">Upload multiple images. These will power carousel visuals for all use cases in the selected domain.</p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-card md:p-5">
            <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <label htmlFor="domain-filter-picker" className="text-xs font-medium uppercase tracking-wide text-muted">
                  Filter By Added Media Domain
                </label>
                <div className="mt-1">
                  <CreatableSelect
                    inputId="domain-filter-picker"
                    name="domain_filter"
                    value={filterDomainOption}
                    onChange={handleFilterDomainChange}
                    options={mediaDomainOptions}
                    isClearable
                    placeholder="Select added media domain"
                    noOptionsMessage={() => "No matching domains"}
                    formatCreateLabel={(inputValue) => `Use added domain: \"${inputValue.trim()}\"`}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "rgb(var(--color-surface))",
                        borderColor: state.isFocused
                          ? "rgb(var(--color-primary))"
                          : "rgb(var(--color-border))",
                        boxShadow: state.isFocused ? "var(--shadow-glow-primary)" : "none",
                        minHeight: 38,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "rgb(var(--color-ink))",
                      }),
                      input: (base) => ({
                        ...base,
                        color: "rgb(var(--color-ink))",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "rgb(var(--color-muted-dim))",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "rgb(var(--color-surface))",
                        border: "1px solid rgb(var(--color-border))",
                        boxShadow: "var(--shadow-card)",
                      }),
                      menuList: (base) => ({
                        ...base,
                        backgroundColor: "rgb(var(--color-surface))",
                        paddingTop: 4,
                        paddingBottom: 4,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? "rgb(var(--color-primary-subtle))"
                          : "rgb(var(--color-surface))",
                        color: state.isFocused
                          ? "rgb(var(--color-primary-text))"
                          : "rgb(var(--color-ink))",
                        cursor: "pointer",
                      }),
                    }}
                    classNames={{
                      control: (state) =>
                        `min-h-[38px] rounded-lg border bg-surface px-1 text-sm text-ink transition-all duration-200 border-border ${state.isFocused ? "border-primary shadow-glow-primary" : ""}`,
                      valueContainer: () => "py-0",
                      input: () => "!m-0 !p-0",
                      placeholder: () => "text-muted-dim",
                      menu: () => "z-20 mt-1 overflow-hidden rounded-lg border border-border bg-surface shadow-card",
                      option: (state) =>
                        `cursor-pointer px-3 py-2 text-sm ${state.isFocused ? "bg-primary-light text-primary-text" : "text-ink"}`,
                    }}
                  />
                </div>
              </div>

              {filterDomain && (
                <Button variant="secondary" className="h-[38px] px-3 text-xs" onClick={() => setFilterDomain("")}>
                  Clear Filter
                </Button>
              )}
            </div>

            {filterDomain && (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-primary/35 bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-text">
                  Filter: {filterDomain}
                </span>
                <span className="text-xs text-muted">
                  {filteredDomainGroups.length} domain card{filteredDomainGroups.length === 1 ? "" : "s"} shown
                </span>
              </div>
            )}

            {isLoading ? (
              <Loader rows={4} />
            ) : filteredDomainGroups.length === 0 ? (
              <p className="text-sm text-muted">No domain images available yet. Add images using the card above.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {filteredDomainGroups.map((group) => (
                  <section key={group.key} className="rounded-xl border border-border bg-surface-elevated p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-ink">{group.domain}</h3>
                        <p className="text-xs text-muted">{group.images.length} image{group.images.length > 1 ? "s" : ""}</p>
                      </div>

                      <label className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink transition-all duration-200 hover:border-primary">
                        <UploadCloud className="h-3.5 w-3.5" />
                        Add More
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={isUploading}
                          onChange={async (event) => {
                            const files = Array.from(event.target.files || []);
                            event.target.value = "";
                            await handleUpload({ domain: group.domain, files });
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {group.images.map((item) => (
                        <article key={item.id} className="rounded-xl border border-border bg-surface p-2">
                          <img
                            src={item.image_url}
                            alt={`${group.domain} thumbnail`}
                            className="h-24 w-full rounded-lg border border-border object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                          <Button
                            variant="secondary"
                            className="mt-2 w-full px-2 py-1 text-xs"
                            disabled={isDeletingId === item.id}
                            onClick={() => setPendingDeleteImage(item)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {isDeletingId === item.id ? "Deleting..." : "Delete"}
                          </Button>

                          <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-2 py-1 text-xs font-semibold text-ink transition-all duration-200 hover:border-primary">
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            {isReplacingId === item.id ? "Updating..." : "Replace Image"}
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isReplacingId === item.id}
                              onChange={(event) => handleReplacePick(item.id, event)}
                              className="hidden"
                            />
                          </label>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteImage)}
        title="Delete this domain image?"
        description="This image will be removed from the selected domain and will no longer appear in browse and details carousels."
        confirmLabel="Delete"
        onConfirm={() => handleDelete(pendingDeleteImage)}
        onCancel={() => setPendingDeleteImage(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingReplace)}
        title="Replace this domain image?"
        description={`Selected file: ${pendingReplace?.fileName || "image"}. This will update the current image for this domain card.`}
        confirmLabel="Replace"
        onConfirm={handleReplace}
        onCancel={() => setPendingReplace(null)}
      />
    </>
  );
}

export default DomainMediaManager;

// Pagination controls shown below the use cases table

function Pagination({ currentPage, totalPages, onPageChange }) {
  const goToPrevious = () => onPageChange(Math.max(currentPage - 1, 1));
  const goToNext = () => onPageChange(Math.min(currentPage + 1, totalPages));

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-muted">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={goToPrevious}
          disabled={currentPage <= 1}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={goToNext}
          disabled={currentPage >= totalPages}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;

// Pagination controls shown below the use cases table

function Pagination({ currentPage, totalPages, onPageChange }) {
  const goToPrevious = () => onPageChange(Math.max(currentPage - 1, 1));
  const goToNext = () => onPageChange(Math.min(currentPage + 1, totalPages));

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-muted">
        Page <span className="font-semibold text-primary">{currentPage}</span> of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={goToPrevious}
          disabled={currentPage <= 1}
          className="rounded-xl border border-border bg-surface-elevated px-3 py-1.5 text-sm font-semibold text-ink transition-all duration-200 ease-out hover:border-primary motion-reduce:transition-none disabled:cursor-not-allowed disabled:text-muted disabled:opacity-50 disabled:hover:border-border"
        >
          Previous
        </button>
        <button
          onClick={goToNext}
          disabled={currentPage >= totalPages}
          className="rounded-xl border border-border bg-surface-elevated px-3 py-1.5 text-sm font-semibold text-ink transition-all duration-200 ease-out hover:border-primary motion-reduce:transition-none disabled:cursor-not-allowed disabled:text-muted disabled:opacity-50 disabled:hover:border-border"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;

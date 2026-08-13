// Loading skeleton shown while data is being fetched
// Renders a few gray placeholder rows to mimic the table shape

function Loader({ rows = 5 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-12 w-full rounded-lg bg-gradient-to-r from-surface via-border to-surface bg-[length:200%_100%] animate-shimmer"
        />
      ))}
    </div>
  );
}

export default Loader;

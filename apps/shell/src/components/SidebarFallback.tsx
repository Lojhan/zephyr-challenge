export function SidebarFallback() {
  return (
    <div className="p-3 space-y-3 animate-pulse">
      <div className="h-4 bg-secondary rounded w-24" />
      <div className="ml-3 space-y-2">
        <div className="h-3.5 bg-secondary/60 rounded w-20" />
        <div className="h-3.5 bg-secondary/60 rounded w-28" />
        <div className="h-3.5 bg-secondary/60 rounded w-16" />
      </div>
      <div className="h-4 bg-secondary rounded w-20" />
      <div className="ml-3 space-y-2">
        <div className="h-3.5 bg-secondary/60 rounded w-32" />
        <div className="h-3.5 bg-secondary/60 rounded w-24" />
      </div>
      <div className="h-4 bg-secondary rounded w-16" />
      <div className="ml-3 space-y-2">
        <div className="h-3.5 bg-secondary/60 rounded w-20" />
        <div className="h-3.5 bg-secondary/60 rounded w-36" />
      </div>
    </div>
  );
}

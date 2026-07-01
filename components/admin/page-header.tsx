// Shared admin page header: crumb + h1 + optional action (New post, etc.). Stage4 layout.
export function AdminPageHeader({
  crumb,
  title,
  action,
}: {
  crumb?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
      <div className="min-w-0">
        {crumb ? (
          <div className="font-mono text-xs text-muted-foreground">{crumb}</div>
        ) : null}
        <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

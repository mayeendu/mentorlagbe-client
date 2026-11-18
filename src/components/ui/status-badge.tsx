const styles = {
  paid: "bg-emerald-100 text-emerald-950", approved: "bg-emerald-100 text-emerald-950",
  accepted: "bg-emerald-100 text-emerald-950", active: "bg-emerald-100 text-emerald-950",
  pending: "bg-amber-100 text-amber-950", rejected: "bg-red-100 text-red-950",
  failed: "bg-red-100 text-red-950", disabled: "bg-red-100 text-red-950",
  inactive: "bg-muted text-muted-foreground", canceled: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: keyof typeof styles }) {
  return <span className={"inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize " + styles[status]}>{status}</span>;
}

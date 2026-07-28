import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading">
      <TableSkeleton rows={20} />
      <TableSkeleton rows={10} />
      <TableSkeleton rows={10} />
    </div>
  );
}

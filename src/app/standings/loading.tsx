import { TableSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <TableSkeleton rows={20} />
    </div>
  );
}

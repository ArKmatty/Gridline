import { CardGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <CardGridSkeleton count={10} />
    </div>
  );
}

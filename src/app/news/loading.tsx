import { NewsSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <NewsSkeleton />
    </div>
  );
}

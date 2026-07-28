import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-2 text-2xl font-bold">Off track</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        That page doesn&apos;t exist. Head back to the pit wall.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"
      >
        Back home
      </Link>
    </div>
  );
}

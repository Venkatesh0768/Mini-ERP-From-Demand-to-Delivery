import { ShieldOff } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-400">
        <ShieldOff size={28} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Access Denied</h2>
        <p className="text-sm text-gray-500 mt-1">
          You don&apos;t have permission to view this page. Redirecting…
        </p>
      </div>
    </div>
  );
}

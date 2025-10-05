/**
 * Reusable animated loader spinner
 */

'use client';

export function Loader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 animate-spin"></div>
      </div>
      <p className="mt-4 text-sm text-gray-300">{label}</p>
    </div>
  );
}



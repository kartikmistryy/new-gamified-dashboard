/** Carousel State Components - Loading, Error, Empty states */

import { LoaderCircleIcon, AlertCircleIcon } from "lucide-react";

export function CarouselLoadingState({ className }: { className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-lg shadow-sm border border-gray-200">
        <LoaderCircleIcon className="size-12 text-blue-500 animate-spin" aria-hidden="true" />
        <p className="text-gray-600 font-medium mt-4">Loading contributors...</p>
      </div>
    </div>
  );
}

export function CarouselErrorState({ error, className }: { error: Error; className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-lg shadow-sm border border-red-200">
        <AlertCircleIcon className="size-12 text-red-500" aria-hidden="true" />
        <p className="text-red-600 font-semibold text-lg mt-4">Failed to load contributors</p>
        <p className="text-gray-600 text-sm mt-2 max-w-md text-center">{error.message}</p>
      </div>
    </div>
  );
}

export function CarouselEmptyState({
  message,
  detailMessage,
  className,
}: {
  message: string;
  detailMessage?: string;
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-lg shadow-sm border border-gray-200">
        <svg
          className="size-16 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="text-gray-600 font-medium text-lg mt-4">{message}</p>
        <p className="text-gray-400 text-sm mt-2">{detailMessage || "Add contributors to see their performance"}</p>
      </div>
    </div>
  );
}

export default function Skeleton({ className = "", ...props }) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({ className = "", ...props }) {
  return <Skeleton className={`h-4 ${className}`} {...props} />;
}

export function SkeletonImage({ className = "", ...props }) {
  return (
    <Skeleton
      className={`aspect-[3/4] w-full overflow-hidden ${className}`}
      {...props}
    />
  );
}

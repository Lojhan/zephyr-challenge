import { useState, useEffect, type ComponentType } from 'react';

interface RemoteLoaderProps<P extends object> {
  loader: () => Promise<{ default: ComponentType<P> }>;
  fallback: React.ReactNode;
  props: P;
}

export function RemoteLoader<P extends object>({
  loader,
  fallback,
  props,
}: RemoteLoaderProps<P>) {
  const [Component, setComponent] = useState<ComponentType<P> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loader()
      .then((mod) => {
        if (mounted) setComponent(() => mod.default);
      })
      .catch((err) => {
        if (mounted) setError(err?.message || 'Failed to load remote');
      });
    return () => {
      mounted = false;
    };
  }, [loader]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-red-400 text-sm font-medium mb-2">Remote Unavailable</div>
        <p className="text-muted-foreground text-xs max-w-xs">{error}</p>
        <p className="text-muted-foreground text-xs mt-2">
          Make sure the remote app is running.
        </p>
      </div>
    );
  }

  if (!Component) return <>{fallback}</>;

  return <Component {...props} />;
}

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
      <img
        src="https://images.unsplash.com/photo-1527482937786-6f4e4d7d9f07?w=600&h=400&fit=crop"
        alt="Storm weather damage"
        className="w-full max-w-md rounded-xl shadow-lg"
      />
      <h2 className="text-2xl font-bold text-zinc-800">
        Looks like rough weather ahead
      </h2>
      <p className="text-zinc-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

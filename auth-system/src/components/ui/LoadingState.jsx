import Spinner from "./Spinner";

function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-slate-600">
      <Spinner /> {message}
    </div>
  );
}

export default LoadingState;

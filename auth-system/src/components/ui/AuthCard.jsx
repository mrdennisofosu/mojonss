// The centered white card used by the authentication pages.
// (Register and Login still carry their own copy of this wrapper;
// we will switch them to AuthCard in the Phase 7 consistency pass.)
function AuthCard({ children }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}

export default AuthCard;

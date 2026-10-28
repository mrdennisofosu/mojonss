import { SHOW_DEV_TOOLS } from "../../constants/app";
import { mockUsers, MOCK_PASSWORD } from "../../mock/mockUsers";

// TEMPORARY developer helper: lists the fake accounts so you can test signing
// in without typing. Hidden when SHOW_DEV_TOOLS is false; deleted with the mock layer.
function DevAccountsHint({ onUse }) {
  if (!SHOW_DEV_TOOLS) return null;

  return (
    <details className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold text-amber-900">
        Mock accounts for testing (temporary)
      </summary>

      <p className="mt-1 text-amber-800">
        Fake accounts only. Password for all of them:{" "}
        <code>{MOCK_PASSWORD}</code>
      </p>

      <ul className="mt-2 space-y-2">
        {mockUsers.slice(0, 4).map((account) => (
          <li key={account.id}>
            <button
              type="button"
              onClick={() => onUse(account.email, MOCK_PASSWORD)}
              className="min-h-11 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-left hover:bg-amber-100"
            >
              <span className="block break-all font-medium text-slate-900">
                {account.email}
              </span>
              <span className="block text-xs text-slate-600">
                {account.fullName}: {account.role}, {account.status}
                {account.emailVerified ? "" : ", email not verified"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default DevAccountsHint;

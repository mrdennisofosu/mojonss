import { Check, Circle } from "lucide-react";
import {
  getPasswordChecks,
  getPasswordStrength,
} from "../../utils/passwordStrength";

const levels = {
  1: { label: "Weak", bar: "bg-red-500", text: "text-red-600" },
  2: { label: "Fair", bar: "bg-amber-500", text: "text-amber-600" },
  3: { label: "Good", bar: "bg-lime-500", text: "text-lime-700" },
  4: { label: "Strong", bar: "bg-green-600", text: "text-green-700" },
};

// Shows a 4-segment bar, a strength word, and a checklist of the rules.
// Shows nothing until the user starts typing.
function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const { score } = getPasswordStrength(password);
  const level = levels[score];
  const checks = getPasswordChecks(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-1.5 flex-1 rounded-full ${segment <= score ? level.bar : "bg-slate-200"}`}
          />
        ))}
      </div>

      <p
        className={`mt-1 text-sm font-medium ${level.text}`}
        aria-live="polite"
      >
        Password strength: {level.label}
      </p>

      <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {checks.map((check) => (
          <li
            key={check.id}
            className={`flex items-center gap-2 text-sm ${
              check.passed ? "text-green-700" : "text-slate-500"
            }`}
          >
            {check.passed ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <Circle size={14} aria-hidden="true" />
            )}
            <span className="sr-only">
              {check.passed ? "Met: " : "Not met: "}
            </span>
            {check.label}
            {!check.required && " (optional)"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PasswordStrengthMeter;

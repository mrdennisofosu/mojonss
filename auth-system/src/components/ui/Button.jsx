import { Link } from "react-router";

// Our one button. Follows the design rules from Step 4:
//   primary = main action, secondary = alternative action, danger = destructive action.
// Pass "to" to render it as a link that looks like a button.
// min-h-11 = 44px tall, comfortable to tap on a phone.

const baseClasses =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const variantClasses = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

function Button({
  variant = "primary",
  to,
  className = "",
  children,
  ...props
}) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;

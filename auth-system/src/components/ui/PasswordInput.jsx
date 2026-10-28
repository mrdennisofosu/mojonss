import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "./Input";

// An Input that can show or hide what is typed. Accepts the same props as Input.
function PasswordInput(props) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((previous) => !previous)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="grid h-11 w-11 place-items-center rounded-lg text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {visible ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      }
    />
  );
}

export default PasswordInput;

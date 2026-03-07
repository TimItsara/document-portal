import { useState } from "react";
import { LockIcon, EyeIcon, EyeOffIcon, ErrorCircleIcon } from "./Icons";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

/**
 * Controlled password field with an inline show/hide toggle.
 * The show-state is managed internally so the parent only needs
 * to track the value and any validation error.
 */
export default function PasswordInput({
  label,
  value,
  onChange,
  placeholder = "Enter password",
  error,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium" style={{ color: "#374151" }}>
        {label}
      </label>

      <div className="relative">
        {/* Leading lock icon */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#70708F" }}>
          <LockIcon />
        </span>

        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none transition-colors"
          style={{ border: `1px solid ${error ? "#DC2626" : "#D0D0DD"}` }}
        />

        {/* Show / hide toggle */}
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          style={{ color: "#70708F" }}
        >
          {show ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </div>

      {error && (
        <p className="text-xs flex items-center gap-1" style={{ color: "#DC2626" }}>
          <ErrorCircleIcon size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

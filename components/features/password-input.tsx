"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

// Reusable password input with a built-in show/hide toggle.
// Accepts all standard <input> props; renders an eye icon button that flips the input's type between "password" and "text".
const PasswordInput = (props: PasswordInputProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className={`pr-10 ${props.className ?? ""}`} />
      <Button
        type="button" // ← CRITICAL: prevents form submit
        variant="ghost"
        size="sm"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1} // ← skip in tab order
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default PasswordInput;

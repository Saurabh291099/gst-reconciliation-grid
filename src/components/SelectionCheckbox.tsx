import { useEffect, useRef } from "react";

interface SelectionCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  "aria-label": string;
}

export function SelectionCheckbox({
  checked,
  indeterminate = false,
  disabled = false,
  onChange,
  "aria-label": ariaLabel,
}: SelectionCheckboxProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate =
        indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={inputRef}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      aria-label={ariaLabel}
      className="h-4 w-4 cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
    />
  );
}
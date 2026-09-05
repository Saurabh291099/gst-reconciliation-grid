import {
  useEffect,
  useRef,
  useState,
} from "react";

import { formatCurrency } from "../utils/formatters";

interface EditableCellProps {
  value: number;
  onSave: (value: number) => void;
}

export function EditableCell({
  value,
  onSave,
}: EditableCellProps) {
  const [isEditing, setIsEditing] =
    useState(false);

  const [draftValue, setDraftValue] =
    useState(String(value));

  const [error, setError] =
    useState<string | null>(null);

  const inputRef =
    useRef<HTMLInputElement>(null);

  const skipNextBlurRef =
    useRef(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setDraftValue(String(value));
    setError(null);
    setIsEditing(true);
  };

  const closeEditing = () => {
    setIsEditing(false);
    setError(null);
  };

  const cancelEditing = () => {
    skipNextBlurRef.current = true;

    setDraftValue(String(value));
    closeEditing();
  };

  const save = () => {
    const trimmedValue = draftValue.trim();

    if (trimmedValue === "") {
      setError("Amount is required.");
      return;
    }

    const parsedValue = Number(trimmedValue);

    if (
      !Number.isFinite(parsedValue) ||
      parsedValue < 0
    ) {
      setError(
        "Enter a valid amount greater than or equal to 0."
      );
      return;
    }

    // Avoid updating the parent when nothing actually changed.
    if (parsedValue === value) {
      closeEditing();
      return;
    }
    skipNextBlurRef.current = true;
    onSave(parsedValue);
    closeEditing();
  };

  const handleBlur = () => {
    if (skipNextBlurRef.current) {
      skipNextBlurRef.current = false;
      return;
    }

    save();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  if (isEditing) {
    return (
      <div className="w-full">
        <input
          ref={inputRef}
          type="number"
          min="0"
          step="0.01"
          value={draftValue}
          onChange={(event) => {
            setDraftValue(event.target.value);

            if (error) {
              setError(null);
            }
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-label="Edit total amount"
          aria-invalid={Boolean(error)}
          className="
            w-full
            min-w-27.5
            rounded-md
            border
            bg-white
            px-2
            py-1.5
            text-sm
            text-slate-900
            outline-none
            transition
            placeholder:text-slate-400
            focus:border-blue-600
            focus:ring-2
            focus:ring-blue-600/10
            data-[invalid=true]:border-red-500
          "
          data-invalid={error ? "true" : "false"}
        />

        {error && (
          <p
            className="
              mt-1
              text-[11px]
              font-medium
              text-red-600
            "
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      aria-label={`Edit total amount ${formatCurrency(value)}`}
      className="
        w-full
        rounded-md
        border
        border-transparent
        bg-transparent
        px-2
        py-1.5
        text-left
        text-sm
        text-inherit
        transition
        hover:border-slate-300
        hover:bg-slate-50
        focus:border-blue-500
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500/20
      "
    >
      {formatCurrency(value)}
    </button>
  );
}
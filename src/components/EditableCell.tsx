import {
  useEffect,
  useRef,
  useState,
} from "react";

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

  const inputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setDraftValue(String(value));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftValue(String(value));
    setIsEditing(false);
  };

  const save = () => {
    const parsedValue = Number(draftValue);

    if (
      draftValue.trim() === "" ||
      !Number.isFinite(parsedValue) ||
      parsedValue < 0
    ) {
      setDraftValue(String(value));
      setIsEditing(false);
      return;
    }

    onSave(parsedValue);
    setIsEditing(false);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min="0"
        step="0.01"
        value={draftValue}
        onChange={(event) => {
          setDraftValue(event.target.value);
        }}
        onBlur={save}
        onKeyDown={handleKeyDown}
        aria-label="Edit amount"
        className="
    w-full
    min-w-27.5
    rounded-md
    border
    border-blue-600
    bg-white
    px-2
    py-1.5
    text-slate-900
    outline-none
    ring-2
    ring-blue-600/10
  "
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      aria-label={`Edit amount ${value}`}
      className="
    w-full
    rounded-md
    border
    border-transparent
    bg-transparent
    px-2
    py-1.5
    text-left
    font-inherit
    text-inherit
    hover:border-slate-300
    hover:bg-slate-50
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500/20
  "
    >
      {value.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      })}
    </button>
  );
}
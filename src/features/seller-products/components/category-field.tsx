import { useMemo } from "react";
import { useProductCategories } from "../hooks";
import { OptionSelectField, type SelectOption } from "./option-select-field";

/** Show the in-sheet search box once the list gets long. */
const SEARCH_THRESHOLD = 12;

interface CategoryFieldProps {
  /** Selected category id as a string ("" when none). */
  value: string;
  onChange: (value: string) => void;
  /** Field label and sheet title ("Category", "Food category"…). */
  label?: string;
  error?: string;
}

// Single-select category picker: a field that opens a list sheet with the
// flattened tree (children indented). The boards have no search; it only shows
// up for long trees. Handles loading, error and empty states.
export function CategoryField({
  value,
  onChange,
  label = "Category",
  error,
}: CategoryFieldProps) {
  const { data, isLoading, isError, refetch } = useProductCategories();

  const options = useMemo<SelectOption[]>(
    () =>
      (data ?? []).map((category) => ({
        value: String(category.id),
        label: category.name,
        rowLabel: category.label,
      })),
    [data],
  );

  return (
    <OptionSelectField
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      placeholder={`Choose a ${label.toLowerCase()}`}
      error={error}
      loading={isLoading}
      loadFailed={isError}
      onRetry={() => void refetch()}
      loadFailedText="Couldn't load categories. Tap to retry"
      searchAfter={SEARCH_THRESHOLD}
      searchPlaceholder="Search categories"
      emptyTitle="No categories yet"
      emptyMessage="Categories are added by the Stuqet team."
    />
  );
}

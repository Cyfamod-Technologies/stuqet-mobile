import { Controller, type Control } from "react-hook-form";
import { Input } from "~/components/ui/input";
import type {
  PickedFile,
  VerificationElement,
  VerificationFormValues,
} from "../types";
import { ChoiceField } from "./choice-field";
import { FileField } from "./file-field";
import { PickerField } from "./picker-field";

interface VerificationFieldsProps {
  elements: VerificationElement[];
  control: Control<VerificationFormValues>;
}

function asString(value: VerificationFormValues[string]): string {
  return typeof value === "string" ? value : "";
}

function asStrings(value: VerificationFormValues[string]): string[] {
  return Array.isArray(value) ? value : [];
}

function asFile(value: VerificationFormValues[string]): PickedFile | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : null;
}

// Renders the admin's dynamic verification form: one control per element,
// bound to `element_<index>`.
export function VerificationFields({
  elements,
  control,
}: VerificationFieldsProps) {
  return (
    <>
      {elements.map((element) => (
        <Controller
          key={element.index}
          control={control}
          name={`element_${element.index}`}
          render={({ field, fieldState }) => {
            const error = fieldState.error?.message;

            switch (element.type) {
              case "file":
                return (
                  <FileField
                    label={element.label}
                    value={asFile(field.value)}
                    error={error}
                    onChange={field.onChange}
                  />
                );
              case "select":
                return (
                  <PickerField
                    label={element.label}
                    value={asString(field.value)}
                    onValueChange={field.onChange}
                    options={element.options.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                    placeholder="Choose an option"
                    error={error}
                  />
                );
              case "radio":
              case "multi_select":
                return (
                  <ChoiceField
                    label={element.label}
                    options={element.options}
                    multiple={element.type === "multi_select"}
                    value={
                      element.type === "multi_select"
                        ? asStrings(field.value)
                        : [asString(field.value)].filter(Boolean)
                    }
                    onChange={(next) =>
                      field.onChange(
                        element.type === "multi_select"
                          ? next
                          : (next[0] ?? ""),
                      )
                    }
                    error={error}
                  />
                );
              default:
                return (
                  <Input
                    label={element.label}
                    placeholder={element.label}
                    value={asString(field.value)}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={error}
                  />
                );
            }
          }}
        />
      ))}
    </>
  );
}

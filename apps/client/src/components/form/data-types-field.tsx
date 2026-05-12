import { Plus, Trash2 } from "lucide-react"
import {
  Controller,
  type Control,
  type FieldError,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { Button } from "@/components/ui/button"

type StoredDataType = {
  name: string
  isSensitive: boolean
  description: string
}

type DataTypesFieldProps<T extends FieldValues> = {
  control: Control<T>
  error?: FieldError
  errorMessage?: string
  label: string
  name: FieldPath<T>
}

const emptyDataType = (): StoredDataType => ({
  name: "",
  isSensitive: false,
  description: "",
})

export const DataTypesField = <T extends FieldValues>({
  control,
  error,
  errorMessage,
  label,
  name,
}: DataTypesFieldProps<T>) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => {
      const values: StoredDataType[] = Array.isArray(field.value)
        ? field.value
        : []
      const updateValue = (
        index: number,
        key: keyof StoredDataType,
        value: string | boolean,
      ) => {
        field.onChange(
          values.map((item, currentIndex) =>
            currentIndex === index ? { ...item, [key]: value } : item,
          ),
        )
      }
      const removeValue = (index: number) => {
        field.onChange(values.filter((_, currentIndex) => currentIndex !== index))
      }

      return (
        <div className="grid gap-2 text-sm font-medium text-slate-800 md:col-span-2">
          <span>{label}</span>
          <div className="grid gap-3">
            {values.map((item, index) => (
              <div
                className="grid gap-2 rounded-md border border-slate-200 bg-white p-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto_auto]"
                key={index}
              >
                <input
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 transition outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                  placeholder="Customer emails"
                  type="text"
                  value={item.name}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    updateValue(index, "name", event.target.value)
                  }
                />
                <input
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 transition outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                  placeholder="Account contact details used for billing"
                  type="text"
                  value={item.description}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    updateValue(index, "description", event.target.value)
                  }
                />
                <label className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700">
                  <input
                    checked={item.isSensitive}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    type="checkbox"
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      updateValue(index, "isSensitive", event.target.checked)
                    }
                  />
                  Sensitive
                </label>
                <Button
                  aria-label="Remove data type"
                  className="self-start"
                  type="button"
                  variant="outline"
                  onClick={() => removeValue(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              className="w-fit"
              type="button"
              variant="outline"
              onClick={() => field.onChange([...values, emptyDataType()])}
            >
              <Plus />
              Add data type
            </Button>
          </div>
          {(errorMessage || error?.message) && (
            <span className="text-xs text-red-700">
              {errorMessage ?? error?.message}
            </span>
          )}
        </div>
      )
    }}
  />
)

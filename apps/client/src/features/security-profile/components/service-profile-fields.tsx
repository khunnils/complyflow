import { type UseFormReturn } from "react-hook-form"

import { MultiSelectField } from "@/components/form/multi-select-field"
import { TextField } from "@/components/form/text-field"
import { ToggleField } from "@/components/form/toggle-field"
import { type ProfileDraft } from "@/features/security-profile/types/security-profile"
import { type Option } from "@/features/vocabulary/lib/vocabulary"

const MinimumAgeField = ({ form }: { form: UseFormReturn<ProfileDraft> }) => (
  <label className="grid gap-2 text-sm font-medium text-slate-800">
    Minimum user age
    <input
      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 transition outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
      inputMode="numeric"
      min={0}
      type="number"
      {...form.register("service.minimumUserAge", { valueAsNumber: true })}
    />
    {form.formState.errors.service?.minimumUserAge && (
      <span className="text-xs text-red-700">
        {form.formState.errors.service.minimumUserAge.message}
      </span>
    )}
  </label>
)

export const ServiceProfileFields = ({
  audienceOptions,
  customerTypeOptions,
  form,
  regionOptions,
  userTypeOptions,
}: {
  audienceOptions: Option[]
  customerTypeOptions: Option[]
  form: UseFormReturn<ProfileDraft>
  regionOptions: Option[]
  userTypeOptions: Option[]
}) => (
  <div className="grid gap-4 md:grid-cols-2">
    <TextField
      error={form.formState.errors.service?.serviceName}
      label="Service name"
      name="service.serviceName"
      placeholder="Acme Platform"
      register={form.register}
    />
    <TextField
      error={form.formState.errors.service?.serviceUrl}
      label="Service URL"
      name="service.serviceUrl"
      placeholder="https://app.acme.example"
      register={form.register}
    />
    <div className="md:col-span-2">
      <TextField
        error={form.formState.errors.service?.serviceDescription}
        label="Description"
        name="service.serviceDescription"
        placeholder="Briefly describe the product or service"
        register={form.register}
      />
    </div>
    <MultiSelectField
      control={form.control}
      error={form.formState.errors.service?.audiences?.root}
      label="Audiences"
      name="service.audiences"
      options={audienceOptions}
      placeholder="Select audiences"
    />
    <MultiSelectField
      control={form.control}
      error={form.formState.errors.service?.userTypes?.root}
      label="User types"
      name="service.userTypes"
      options={userTypeOptions}
      placeholder="Select user types"
    />
    <MultiSelectField
      control={form.control}
      error={form.formState.errors.service?.customerTypes?.root}
      label="Customer types"
      name="service.customerTypes"
      options={customerTypeOptions}
      placeholder="Select customer types"
    />
    <MultiSelectField
      control={form.control}
      error={form.formState.errors.service?.availabilityRegions?.root}
      label="Availability regions"
      name="service.availabilityRegions"
      options={regionOptions}
      placeholder="Select availability regions"
    />
    <ToggleField
      control={form.control}
      label="Directed to children"
      name="service.childrenDirected"
    />
    <MinimumAgeField form={form} />
  </div>
)

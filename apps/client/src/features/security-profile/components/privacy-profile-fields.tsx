import { type UseFormReturn } from "react-hook-form"

import { MultiSelectField } from "@/components/form/multi-select-field"
import { ToggleField } from "@/components/form/toggle-field"
import { type ProfileDraft } from "@/features/security-profile/types/security-profile"
import { type Option } from "@/features/vocabulary/lib/vocabulary"

const ResponseTimelineField = ({
  form,
}: {
  form: UseFormReturn<ProfileDraft>
}) => (
  <label className="grid gap-2 text-sm font-medium text-slate-800">
    Response timeline days
    <input
      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 transition outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
      inputMode="numeric"
      min={0}
      type="number"
      {...form.register("privacy.responseTimelineDays", {
        valueAsNumber: true,
      })}
    />
    {form.formState.errors.privacy?.responseTimelineDays && (
      <span className="text-xs text-red-700">
        {form.formState.errors.privacy.responseTimelineDays.message}
      </span>
    )}
  </label>
)

export const PrivacyProfileFields = ({
  form,
  requestMethodOptions,
  supportedRightOptions,
}: {
  form: UseFormReturn<ProfileDraft>
  requestMethodOptions: Option[]
  supportedRightOptions: Option[]
}) => (
  <div className="grid gap-4 md:grid-cols-2">
    <MultiSelectField
      control={form.control}
      error={form.formState.errors.privacy?.supportedRights?.root}
      label="Supported rights"
      name="privacy.supportedRights"
      options={supportedRightOptions}
      placeholder="Select supported rights"
    />
    <MultiSelectField
      control={form.control}
      error={form.formState.errors.privacy?.requestMethods?.root}
      label="Request methods"
      name="privacy.requestMethods"
      options={requestMethodOptions}
      placeholder="Select request methods"
    />
    <ResponseTimelineField form={form} />
    <ToggleField
      control={form.control}
      label="Identity verification required"
      name="privacy.identityVerificationRequired"
    />
    <ToggleField
      control={form.control}
      label="Authorized agent supported"
      name="privacy.authorizedAgentSupported"
    />
    <ToggleField
      control={form.control}
      label="Appeal process exists"
      name="privacy.appealProcessExists"
    />
  </div>
)

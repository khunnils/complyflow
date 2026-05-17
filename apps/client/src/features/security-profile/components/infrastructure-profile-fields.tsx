import {
  type OrganizationProvider,
  type Provider,
} from "@complyflow/shared"
import { type UseFormReturn } from "react-hook-form"

import { MultiSelectField } from "@/components/form/multi-select-field"
import { ToggleField } from "@/components/form/toggle-field"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { type ProfileDraft } from "@/features/security-profile/types/security-profile"

const comboboxInputClassName =
  "h-10 w-full rounded-md border-slate-200 bg-white text-sm font-normal text-slate-900 shadow-none focus-within:border-blue-600 focus-within:ring-3 focus-within:ring-blue-100"

const systemLabels: Record<string, string> = {
  auth: "Auth provider",
  source_control: "Source control provider",
  cloud: "Cloud provider",
  password_manager: "Password manager",
}

const infrastructureCategories: string[] = [
  "cloud",
  "source_control",
  "auth",
  "password_manager",
]

const selectedProviderIds = (
  organizationProviders: OrganizationProvider[],
  category: string
) =>
  organizationProviders
    .filter((provider) => provider.category === category)
    .map((provider) => provider.providerId)

const providerOptions = (
  providers: Provider[],
  category: string
) =>
  providers
    .filter((provider) => provider.category === category)
    .map((provider) => ({ value: provider.id, label: provider.name }))

const CloudProviderPicker = ({
  form,
  providers,
}: {
  form: UseFormReturn<ProfileDraft>
  providers: Provider[]
}) => {
  const organizationProviders = form.watch(
    "infrastructure.organizationProviders"
  )
  const selectedIds = selectedProviderIds(organizationProviders, "cloud")
  const options = providerOptions(providers, "cloud")

  return (
    <MultiSelectField
      control={form.control}
      label="Cloud providers"
      name="infrastructure.organizationProviders"
      options={options}
      placeholder="Select cloud providers"
      value={selectedIds}
      onValueChange={(providerIds) => {
        const otherProviders = organizationProviders.filter(
          (provider) => provider.category !== "cloud"
        )

        form.setValue(
          "infrastructure.organizationProviders",
          [
            ...otherProviders,
            ...providerIds.map((providerId) => ({
              category: "cloud" as const,
              providerId,
            })),
          ],
          { shouldDirty: true, shouldValidate: true }
        )
      }}
    />
  )
}

const ProviderPicker = ({
  form,
  providers,
  category,
}: {
  form: UseFormReturn<ProfileDraft>
  providers: Provider[]
  category: string
}) => {
  const organizationProviders = form.watch(
    "infrastructure.organizationProviders"
  )
  const selectedIds = selectedProviderIds(organizationProviders, category)
  const options = [
    { value: "", label: "Not set" },
    ...providerOptions(providers, category),
  ]
  const optionLabelByValue = new Map(
    options.map((option) => [option.value, option.label])
  )
  const fieldId = `provider-${category}`

  const setSystemProvider = (providerId: string) => {
    const otherProviders = organizationProviders.filter(
      (provider) => provider.category !== category
    )

    form.setValue(
      "infrastructure.organizationProviders",
      [...otherProviders, ...(providerId ? [{ category, providerId }] : [])],
      { shouldDirty: true, shouldValidate: true }
    )
  }

  return (
    <label
      className="grid gap-2 text-sm font-medium text-slate-800"
      htmlFor={fieldId}
    >
      {systemLabels[category as keyof typeof systemLabels] ?? category}
      <Combobox
        items={options.map((option) => option.value)}
        value={selectedIds[0] ?? ""}
        autoHighlight
        itemToStringLabel={(value) => optionLabelByValue.get(value) ?? value}
        onValueChange={(value) => setSystemProvider(value ?? "")}
      >
        <ComboboxInput id={fieldId} className={comboboxInputClassName} />
        <ComboboxContent className="rounded-md border border-slate-200 bg-white shadow-lg ring-0">
          <ComboboxEmpty>No providers available</ComboboxEmpty>
          <ComboboxList>
            {options.map((option) => (
              <ComboboxItem
                key={option.value}
                className="rounded-sm text-slate-800 data-highlighted:bg-slate-50 data-highlighted:text-slate-900"
                value={option.value}
              >
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </label>
  )
}

export const InfrastructureProfileFields = ({
  form,
  providers = [],
}: {
  form: UseFormReturn<ProfileDraft>
  providers?: Provider[]
}) => (
  <div className="grid gap-4 md:grid-cols-2">
    <CloudProviderPicker form={form} providers={providers} />
    {infrastructureCategories
      .filter((category) => category !== "cloud")
      .map((category) => (
        <ProviderPicker
          form={form}
          key={category}
          providers={providers}
          category={category}
        />
      ))}
    <ToggleField
      control={form.control}
      label="MFA enabled"
      name="infrastructure.mfaEnabled"
    />
    <ToggleField
      control={form.control}
      label="Encrypted devices required"
      name="infrastructure.encryptedDevicesRequired"
    />
    <ToggleField
      control={form.control}
      label="Backups enabled"
      name="infrastructure.backupsEnabled"
    />
    <ToggleField
      control={form.control}
      label="Centralized logging enabled"
      name="infrastructure.centralizedLoggingEnabled"
    />
  </div>
)

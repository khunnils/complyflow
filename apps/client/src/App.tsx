import {
  useCreateVendor,
  useCreateVendors,
  useCreateOrganizationTemplateFromSystem,
  useDeleteOrganizationTemplate,
  useDeleteVendor,
  useProviders,
  useSaveSecurityProfile,
  useSecurityProfile,
  useTemplates,
  useUpdateOrganizationTemplate,
  useUpdateVendor,
} from "@/hooks/use-security-profile"
import { emptyProfileDraft, profileFromOrganization } from "@/lib/profile"
import { LoadingState } from "@/components/security/loading-state"
import { Onboarding } from "@/components/security/onboarding"
import { Workspace } from "@/components/security/workspace"
import { type MutationState } from "@/types/security-profile"

const mutationState = (
  isPending: boolean,
  isError: boolean,
  isSuccess: boolean
): MutationState => {
  if (isPending) {
    return "loading"
  }

  if (isError) {
    return "error"
  }

  return isSuccess ? "saved" : "idle"
}

const errorMessage = (...errors: Array<Error | null>) =>
  errors.find(Boolean)?.message ?? null

export const App = () => {
  const securityProfile = useSecurityProfile()
  const providers = useProviders()
  const templates = useTemplates()
  const saveProfile = useSaveSecurityProfile()
  const createVendor = useCreateVendor()
  const createVendors = useCreateVendors()
  const updateVendor = useUpdateVendor()
  const deleteVendor = useDeleteVendor()
  const createOrganizationTemplate = useCreateOrganizationTemplateFromSystem()
  const updateOrganizationTemplate = useUpdateOrganizationTemplate()
  const deleteOrganizationTemplate = useDeleteOrganizationTemplate()
  const snapshot = securityProfile.data
  const profile = profileFromOrganization(snapshot?.organization ?? null)
  const vendors = snapshot?.vendors ?? []
  const saveState = mutationState(
    saveProfile.isPending ||
      createVendor.isPending ||
      createVendors.isPending ||
      updateVendor.isPending ||
      deleteVendor.isPending ||
      createOrganizationTemplate.isPending ||
      updateOrganizationTemplate.isPending ||
      deleteOrganizationTemplate.isPending,
    saveProfile.isError ||
      createVendor.isError ||
      createVendors.isError ||
      updateVendor.isError ||
      deleteVendor.isError ||
      createOrganizationTemplate.isError ||
      updateOrganizationTemplate.isError ||
      deleteOrganizationTemplate.isError,
    saveProfile.isSuccess ||
      createVendor.isSuccess ||
      createVendors.isSuccess ||
      updateVendor.isSuccess ||
      deleteVendor.isSuccess ||
      createOrganizationTemplate.isSuccess ||
      updateOrganizationTemplate.isSuccess ||
      deleteOrganizationTemplate.isSuccess
  )
  const error = errorMessage(
    securityProfile.error,
    templates.error,
    saveProfile.error,
    createVendor.error,
    createVendors.error,
    updateVendor.error,
    deleteVendor.error,
    createOrganizationTemplate.error,
    updateOrganizationTemplate.error,
    deleteOrganizationTemplate.error
  )

  if (securityProfile.isLoading) {
    return <LoadingState />
  }

  if (!snapshot?.organization) {
    return (
      <Onboarding
        defaultValues={emptyProfileDraft}
        error={error}
        providers={providers.data ?? []}
        providersError={providers.error?.message ?? null}
        providersLoading={providers.isLoading}
        saveState={saveState}
        onSave={(profileDraft, onboardingVendors) => {
          saveProfile.mutate(profileDraft, {
            onSuccess: () => {
              if (onboardingVendors.length > 0) {
                createVendors.mutate(onboardingVendors)
              }
            },
          })
        }}
      />
    )
  }

  return (
    <Workspace
      defaultValues={profile}
      error={error}
      providers={providers.data ?? []}
      providersError={providers.error?.message ?? null}
      providersLoading={providers.isLoading}
      saveState={saveState}
      templates={
        templates.data ?? { systemTemplates: [], organizationTemplates: [] }
      }
      templatesLoading={templates.isLoading}
      vendors={vendors}
      onAddSystemTemplate={(sourceSystemTemplateSlug) =>
        createOrganizationTemplate.mutate({ sourceSystemTemplateSlug })
      }
      onDeleteOrganizationTemplate={(template) =>
        deleteOrganizationTemplate.mutate(template.id)
      }
      onCreateVendor={(vendor) => createVendor.mutate(vendor)}
      onDeleteVendor={(vendor) => deleteVendor.mutate(vendor.id)}
      onSaveProfile={(profileDraft) => saveProfile.mutate(profileDraft)}
      onUpdateOrganizationTemplate={(id, template) =>
        updateOrganizationTemplate.mutate({ id, template })
      }
      onUpdateVendor={(id, vendor) => updateVendor.mutate({ id, vendor })}
    />
  )
}

export default App

import {
  useAuthState,
  useCreateOrganization,
  useCreateVendor,
  useCreateVendors,
  useCreateDocument,
  useCreateTemplateFromSystem,
  useDeleteTemplate,
  useDeleteVendor,
  useDocument,
  useDocuments,
  useLogout,
  useProviders,
  useSaveSecurityProfile,
  useSecurityProfile,
  useTemplates,
  useUpdateTemplate,
  useUpdateVendor,
} from "@/hooks/use-security-profile"
import { LoginScreen } from "@/components/auth/login-screen"
import { CreateOrganizationScreen } from "@/components/security/create-organization-screen"
import { emptyProfileDraft, profileFromOrganization } from "@/lib/profile"
import { startGoogleLogin } from "@/lib/api"
import { LoadingState } from "@/components/security/loading-state"
import { Onboarding } from "@/components/security/onboarding"
import { Workspace } from "@/components/security/workspace"
import { useSecurityUiStore } from "@/stores/security-ui-store"
import { type MutationState } from "@/types/security-profile"
import { useState } from "react"

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
  const authState = useAuthState()
  const user = authState.data?.user ?? null
  const organizations = authState.data?.organizations ?? []
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<
    string | null
  >(null)
  const [onboardingOrganizationIds, setOnboardingOrganizationIds] = useState(
    () => new Set<string>()
  )
  const selectedOrganization =
    organizations.find(
      (organization) => organization.id === selectedOrganizationId
    ) ??
    organizations[0] ??
    null
  const isAuthenticated = Boolean(user)
  const securityProfile = useSecurityProfile(
    selectedOrganization?.id ?? null,
    isAuthenticated && Boolean(selectedOrganization)
  )
  const providers = useProviders(isAuthenticated)
  const templates = useTemplates(
    selectedOrganization?.id ?? null,
    isAuthenticated
  )
  const documents = useDocuments(
    selectedOrganization?.id ?? null,
    isAuthenticated
  )
  const viewingDocumentId = useSecurityUiStore(
    (state) => state.viewingDocumentId
  )
  const document = useDocument(
    selectedOrganization?.id ?? null,
    viewingDocumentId,
    isAuthenticated
  )
  const logout = useLogout()
  const createOrganization = useCreateOrganization()
  const saveProfile = useSaveSecurityProfile(selectedOrganization?.id ?? null)
  const createVendor = useCreateVendor(selectedOrganization?.id ?? null)
  const createVendors = useCreateVendors(selectedOrganization?.id ?? null)
  const updateVendor = useUpdateVendor(selectedOrganization?.id ?? null)
  const deleteVendor = useDeleteVendor(selectedOrganization?.id ?? null)
  const createTemplate = useCreateTemplateFromSystem(
    selectedOrganization?.id ?? null
  )
  const updateTemplate = useUpdateTemplate(selectedOrganization?.id ?? null)
  const deleteTemplate = useDeleteTemplate(selectedOrganization?.id ?? null)
  const createDocument = useCreateDocument(selectedOrganization?.id ?? null)
  const snapshot = securityProfile.data
  const shouldShowOnboarding =
    !snapshot?.organization ||
    (selectedOrganization
      ? onboardingOrganizationIds.has(selectedOrganization.id)
      : false)
  const profile = profileFromOrganization(snapshot?.organization ?? null)
  const vendors = snapshot?.vendors ?? []
  const saveState = mutationState(
    saveProfile.isPending ||
      createOrganization.isPending ||
      createVendor.isPending ||
      createVendors.isPending ||
      updateVendor.isPending ||
      deleteVendor.isPending ||
      createTemplate.isPending ||
      updateTemplate.isPending ||
      deleteTemplate.isPending ||
      createDocument.isPending,
    saveProfile.isError ||
      createVendor.isError ||
      createVendors.isError ||
      updateVendor.isError ||
      deleteVendor.isError ||
      createTemplate.isError ||
      updateTemplate.isError ||
      deleteTemplate.isError ||
      createDocument.isError ||
      document.isError ||
      createOrganization.isError,
    saveProfile.isSuccess ||
      createVendor.isSuccess ||
      createVendors.isSuccess ||
      updateVendor.isSuccess ||
      deleteVendor.isSuccess ||
      createTemplate.isSuccess ||
      updateTemplate.isSuccess ||
      deleteTemplate.isSuccess ||
      createDocument.isSuccess ||
      createOrganization.isSuccess
  )
  const error = errorMessage(
    securityProfile.error,
    templates.error,
    documents.error,
    saveProfile.error,
    createVendor.error,
    createVendors.error,
    updateVendor.error,
    deleteVendor.error,
    createTemplate.error,
    updateTemplate.error,
    deleteTemplate.error,
    createDocument.error,
    createOrganization.error,
    document.error
  )

  if (
    authState.isLoading ||
    (isAuthenticated &&
      Boolean(selectedOrganization) &&
      securityProfile.isLoading)
  ) {
    return <LoadingState />
  }

  if (!user) {
    return (
      <LoginScreen
        error={authState.error?.message ?? null}
        onLogin={startGoogleLogin}
      />
    )
  }

  if (!selectedOrganization) {
    return (
      <CreateOrganizationScreen
        error={error}
        saveState={saveState}
        user={user}
        onCreate={(name) =>
          createOrganization.mutate(
            { name },
            {
              onSuccess: (organization) => {
                setSelectedOrganizationId(organization.id)
                setOnboardingOrganizationIds((current) =>
                  new Set(current).add(organization.id)
                )
              },
            }
          )
        }
        onLogout={() => logout.mutate()}
      />
    )
  }

  if (shouldShowOnboarding) {
    return (
      <Onboarding
        defaultValues={emptyProfileDraft}
        error={error}
        providers={providers.data ?? []}
        providersError={providers.error?.message ?? null}
        providersLoading={providers.isLoading}
        saveState={saveState}
        user={user}
        onLogout={() => logout.mutate()}
        onSave={(profileDraft, onboardingVendors) => {
          saveProfile.mutate(profileDraft, {
            onSuccess: () => {
              setOnboardingOrganizationIds((current) => {
                const next = new Set(current)
                next.delete(selectedOrganization.id)
                return next
              })
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
      document={document.data ?? null}
      documentLoading={document.isLoading}
      documents={documents.data ?? []}
      documentsLoading={documents.isLoading}
      templates={
        templates.data ?? { systemTemplates: [], organizationTemplates: [] }
      }
      templatesLoading={templates.isLoading}
      vendors={vendors}
      organizations={organizations}
      selectedOrganizationId={selectedOrganization.id}
      onAddSystemTemplate={(sourceSystemTemplateSlug) =>
        createTemplate.mutate({ sourceSystemTemplateSlug })
      }
      onCreateOrganization={() => {
        const name = window.prompt("Organization name")

        if (name?.trim()) {
          createOrganization.mutate(
            { name },
            {
              onSuccess: (organization) => {
                setSelectedOrganizationId(organization.id)
                setOnboardingOrganizationIds((current) =>
                  new Set(current).add(organization.id)
                )
              },
            }
          )
        }
      }}
      onCreateVendor={(vendor) => createVendor.mutate(vendor)}
      onLogout={() => logout.mutate()}
      onDeleteTemplate={(template) => deleteTemplate.mutate(template.id)}
      onDeleteVendor={(vendor) => deleteVendor.mutate(vendor.id)}
      onGenerateDocument={(templateId) => createDocument.mutate({ templateId })}
      onSaveProfile={(profileDraft) => saveProfile.mutate(profileDraft)}
      onSelectOrganization={setSelectedOrganizationId}
      onUpdateTemplate={(id, template) =>
        updateTemplate.mutate({ id, template })
      }
      onUpdateVendor={(id, vendor) => updateVendor.mutate({ id, vendor })}
      user={user}
    />
  )
}

export default App

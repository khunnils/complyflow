import {
  useAuthState,
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
import { emptyProfileDraft, profileFromOrganization } from "@/lib/profile"
import { startGoogleLogin } from "@/lib/api"
import { LoadingState } from "@/components/security/loading-state"
import { Onboarding } from "@/components/security/onboarding"
import { Workspace } from "@/components/security/workspace"
import { useSecurityUiStore } from "@/stores/security-ui-store"
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
  const authState = useAuthState()
  const user = authState.data?.user ?? null
  const isAuthenticated = Boolean(user)
  const securityProfile = useSecurityProfile(isAuthenticated)
  const providers = useProviders(isAuthenticated)
  const templates = useTemplates(isAuthenticated)
  const documents = useDocuments(isAuthenticated)
  const viewingDocumentId = useSecurityUiStore(
    (state) => state.viewingDocumentId
  )
  const document = useDocument(viewingDocumentId, isAuthenticated)
  const logout = useLogout()
  const saveProfile = useSaveSecurityProfile()
  const createVendor = useCreateVendor()
  const createVendors = useCreateVendors()
  const updateVendor = useUpdateVendor()
  const deleteVendor = useDeleteVendor()
  const createTemplate = useCreateTemplateFromSystem()
  const updateTemplate = useUpdateTemplate()
  const deleteTemplate = useDeleteTemplate()
  const createDocument = useCreateDocument()
  const snapshot = securityProfile.data
  const profile = profileFromOrganization(snapshot?.organization ?? null)
  const vendors = snapshot?.vendors ?? []
  const saveState = mutationState(
    saveProfile.isPending ||
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
      document.isError,
    saveProfile.isSuccess ||
      createVendor.isSuccess ||
      createVendors.isSuccess ||
      updateVendor.isSuccess ||
      deleteVendor.isSuccess ||
      createTemplate.isSuccess ||
      updateTemplate.isSuccess ||
      deleteTemplate.isSuccess ||
      createDocument.isSuccess
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
    document.error
  )

  if (authState.isLoading || (isAuthenticated && securityProfile.isLoading)) {
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

  if (!snapshot?.organization) {
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
      onAddSystemTemplate={(sourceSystemTemplateSlug) =>
        createTemplate.mutate({ sourceSystemTemplateSlug })
      }
      onCreateVendor={(vendor) => createVendor.mutate(vendor)}
      onLogout={() => logout.mutate()}
      onDeleteTemplate={(template) => deleteTemplate.mutate(template.id)}
      onDeleteVendor={(vendor) => deleteVendor.mutate(vendor.id)}
      onGenerateDocument={(templateId) => createDocument.mutate({ templateId })}
      onSaveProfile={(profileDraft) => saveProfile.mutate(profileDraft)}
      onUpdateTemplate={(id, template) =>
        updateTemplate.mutate({ id, template })
      }
      onUpdateVendor={(id, vendor) => updateVendor.mutate({ id, vendor })}
      user={user}
    />
  )
}

export default App

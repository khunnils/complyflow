import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  type CreateOrganization,
  type CreateDocument,
  type CreateTemplateFromSystem,
  type Template,
  type TemplateInput,
  type Vendor,
  type VendorInput,
} from "@complyflow/shared"

import {
  createDocument,
  createOrganization,
  createTemplateFromSystem,
  createVendor,
  deleteTemplate,
  deleteVendor,
  getAuthState,
  getDocument,
  getOrganizationDocuments,
  getOrganizationSecurityProfile,
  getOrganizationTemplates,
  getProviders,
  logout,
  saveSecurityProfile,
  updateTemplate,
  updateVendor,
} from "@/lib/api"
import { type ProfileDraft } from "@/types/security-profile"

const authStateQueryKey = ["auth"] as const
const providersQueryKey = ["providers"] as const
const securityProfileQueryKey = (organizationId: string) =>
  ["security-profile", organizationId] as const
const templatesQueryKey = (organizationId: string) =>
  ["templates", organizationId] as const
const documentsQueryKey = (organizationId: string) =>
  ["documents", organizationId] as const

export const useAuthState = () =>
  useQuery({
    queryKey: authStateQueryKey,
    queryFn: getAuthState,
  })

export const useCreateOrganization = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateOrganization) => createOrganization(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authStateQueryKey })
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authStateQueryKey, {
        user: null,
        organizations: [],
      })
      queryClient.removeQueries({ queryKey: ["security-profile"] })
      queryClient.removeQueries({ queryKey: providersQueryKey })
      queryClient.removeQueries({ queryKey: ["templates"] })
      queryClient.removeQueries({ queryKey: ["documents"] })
      queryClient.removeQueries({ queryKey: ["document"] })
    },
  })
}

export const useSecurityProfile = (
  organizationId: string | null,
  enabled = true
) =>
  useQuery({
    enabled: enabled && Boolean(organizationId),
    queryKey: securityProfileQueryKey(organizationId ?? ""),
    queryFn: () => getOrganizationSecurityProfile(organizationId ?? ""),
  })

export const useProviders = (enabled = true) =>
  useQuery({
    enabled,
    queryKey: providersQueryKey,
    queryFn: getProviders,
  })

export const useTemplates = (organizationId: string | null, enabled = true) =>
  useQuery({
    enabled: enabled && Boolean(organizationId),
    queryKey: templatesQueryKey(organizationId ?? ""),
    queryFn: () => getOrganizationTemplates(organizationId ?? ""),
  })

export const useDocuments = (organizationId: string | null, enabled = true) =>
  useQuery({
    enabled: enabled && Boolean(organizationId),
    queryKey: documentsQueryKey(organizationId ?? ""),
    queryFn: () => getOrganizationDocuments(organizationId ?? ""),
  })

export const useDocument = (
  organizationId: string | null,
  id: string | null,
  enabled = true
) =>
  useQuery({
    enabled: enabled && Boolean(organizationId) && Boolean(id),
    queryKey: ["document", organizationId, id] as const,
    queryFn: () => getDocument(organizationId ?? "", id ?? ""),
  })

export const useSaveSecurityProfile = (organizationId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (profile: ProfileDraft) =>
      saveSecurityProfile(organizationId ?? "", profile),
    onSuccess: (snapshot) => {
      queryClient.setQueryData(
        securityProfileQueryKey(organizationId ?? ""),
        snapshot
      )
      void queryClient.invalidateQueries({
        queryKey: ["auth"],
      })
    },
  })
}

export const useCreateVendor = (organizationId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vendor: VendorInput) =>
      createVendor(organizationId ?? "", vendor),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: securityProfileQueryKey(organizationId ?? ""),
      })
    },
  })
}

export const useCreateVendors = (organizationId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vendors: VendorInput[]) =>
      Promise.all(
        vendors.map((vendor) => createVendor(organizationId ?? "", vendor))
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: securityProfileQueryKey(organizationId ?? ""),
      })
    },
  })
}

export const useUpdateVendor = (organizationId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { id: string; vendor: VendorInput }) =>
      updateVendor({ organizationId: organizationId ?? "", ...input }),
    onMutate: async ({ id, vendor }) => {
      const key = securityProfileQueryKey(organizationId ?? "")
      await queryClient.cancelQueries({ queryKey: key })
      const previousSnapshot = queryClient.getQueryData<{
        organization: unknown
        vendors: Vendor[]
      }>(key)

      queryClient.setQueryData(key, (current: unknown) => {
        if (!current || typeof current !== "object") {
          return current
        }

        const snapshot = current as { vendors: Vendor[] }
        return {
          ...snapshot,
          vendors: snapshot.vendors.map((currentVendor) =>
            currentVendor.id === id
              ? { ...currentVendor, ...vendor }
              : currentVendor
          ),
        }
      })

      return { previousSnapshot }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousSnapshot) {
        queryClient.setQueryData(
          securityProfileQueryKey(organizationId ?? ""),
          context.previousSnapshot
        )
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: securityProfileQueryKey(organizationId ?? ""),
      })
    },
  })
}

export const useDeleteVendor = (organizationId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteVendor(organizationId ?? "", id),
    onMutate: async (id) => {
      const key = securityProfileQueryKey(organizationId ?? "")
      await queryClient.cancelQueries({ queryKey: key })
      const previousSnapshot = queryClient.getQueryData<{
        organization: unknown
        vendors: Vendor[]
      }>(key)

      queryClient.setQueryData(key, (current: unknown) => {
        if (!current || typeof current !== "object") {
          return current
        }

        const snapshot = current as { vendors: Vendor[] }
        return {
          ...snapshot,
          vendors: snapshot.vendors.filter((vendor) => vendor.id !== id),
        }
      })

      return { previousSnapshot }
    },
    onError: (_error, _id, context) => {
      if (context?.previousSnapshot) {
        queryClient.setQueryData(
          securityProfileQueryKey(organizationId ?? ""),
          context.previousSnapshot
        )
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: securityProfileQueryKey(organizationId ?? ""),
      })
    },
  })
}

export const useCreateTemplateFromSystem = (organizationId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTemplateFromSystem) =>
      createTemplateFromSystem(organizationId ?? "", input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: templatesQueryKey(organizationId ?? ""),
      })
      void queryClient.invalidateQueries({
        queryKey: documentsQueryKey(organizationId ?? ""),
      })
    },
  })
}

export const useUpdateTemplate = (organizationId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { id: string; template: TemplateInput }) =>
      updateTemplate({ organizationId: organizationId ?? "", ...input }),
    onMutate: async ({ id, template }) => {
      const key = templatesQueryKey(organizationId ?? "")
      await queryClient.cancelQueries({ queryKey: key })
      const previousCatalog = queryClient.getQueryData<{
        systemTemplates: unknown[]
        organizationTemplates: Template[]
      }>(key)

      queryClient.setQueryData(key, (current: unknown) => {
        if (!current || typeof current !== "object") {
          return current
        }

        const catalog = current as {
          organizationTemplates: Template[]
        }
        return {
          ...catalog,
          organizationTemplates: catalog.organizationTemplates.map(
            (currentTemplate) =>
              currentTemplate.id === id
                ? { ...currentTemplate, ...template }
                : currentTemplate
          ),
        }
      })

      return { previousCatalog }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCatalog) {
        queryClient.setQueryData(
          templatesQueryKey(organizationId ?? ""),
          context.previousCatalog
        )
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: templatesQueryKey(organizationId ?? ""),
      })
      void queryClient.invalidateQueries({
        queryKey: documentsQueryKey(organizationId ?? ""),
      })
    },
  })
}

export const useDeleteTemplate = (organizationId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTemplate(organizationId ?? "", id),
    onMutate: async (id) => {
      const key = templatesQueryKey(organizationId ?? "")
      await queryClient.cancelQueries({ queryKey: key })
      const previousCatalog = queryClient.getQueryData<{
        systemTemplates: unknown[]
        organizationTemplates: Template[]
      }>(key)

      queryClient.setQueryData(key, (current: unknown) => {
        if (!current || typeof current !== "object") {
          return current
        }

        const catalog = current as {
          organizationTemplates: Template[]
        }
        return {
          ...catalog,
          organizationTemplates: catalog.organizationTemplates.filter(
            (template) => template.id !== id
          ),
        }
      })

      return { previousCatalog }
    },
    onError: (_error, _id, context) => {
      if (context?.previousCatalog) {
        queryClient.setQueryData(
          templatesQueryKey(organizationId ?? ""),
          context.previousCatalog
        )
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: templatesQueryKey(organizationId ?? ""),
      })
      void queryClient.invalidateQueries({
        queryKey: documentsQueryKey(organizationId ?? ""),
      })
    },
  })
}

export const useCreateDocument = (organizationId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateDocument) =>
      createDocument(organizationId ?? "", input),
    onSuccess: (document) => {
      void queryClient.invalidateQueries({
        queryKey: documentsQueryKey(organizationId ?? ""),
      })
      queryClient.setQueryData(
        ["document", organizationId, document.id],
        document
      )
    },
  })
}

export type SaveProfilePayload = ProfileDraft

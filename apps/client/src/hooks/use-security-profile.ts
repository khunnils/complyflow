import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  type OrganizationTemplate,
  type Vendor,
  type VendorInput,
} from "@complyflow/shared"

import {
  createOrganizationTemplateFromSystem,
  createVendor,
  deleteOrganizationTemplate,
  deleteVendor,
  getProviders,
  getSecurityProfile,
  getTemplates,
  saveSecurityProfile,
  updateOrganizationTemplate,
  updateVendor,
} from "@/lib/api"
import { type ProfileDraft } from "@/types/security-profile"

const securityProfileQueryKey = ["security-profile"] as const
const providersQueryKey = ["providers"] as const
const templatesQueryKey = ["templates"] as const

export const useSecurityProfile = () =>
  useQuery({
    queryKey: securityProfileQueryKey,
    queryFn: getSecurityProfile,
  })

export const useProviders = () =>
  useQuery({
    queryKey: providersQueryKey,
    queryFn: getProviders,
  })

export const useTemplates = () =>
  useQuery({
    queryKey: templatesQueryKey,
    queryFn: getTemplates,
  })

export const useSaveSecurityProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveSecurityProfile,
    onSuccess: (snapshot) => {
      queryClient.setQueryData(securityProfileQueryKey, snapshot)
    },
  })
}

export const useCreateVendor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: securityProfileQueryKey })
    },
  })
}

export const useCreateVendors = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (vendors: VendorInput[]) =>
      Promise.all(vendors.map(createVendor)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: securityProfileQueryKey })
    },
  })
}

export const useUpdateVendor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateVendor,
    onMutate: async ({ id, vendor }) => {
      await queryClient.cancelQueries({ queryKey: securityProfileQueryKey })
      const previousSnapshot = queryClient.getQueryData<{
        organization: unknown
        vendors: Vendor[]
      }>(securityProfileQueryKey)

      queryClient.setQueryData(securityProfileQueryKey, (current: unknown) => {
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
          securityProfileQueryKey,
          context.previousSnapshot
        )
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: securityProfileQueryKey })
    },
  })
}

export const useDeleteVendor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteVendor,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: securityProfileQueryKey })
      const previousSnapshot = queryClient.getQueryData<{
        organization: unknown
        vendors: Vendor[]
      }>(securityProfileQueryKey)

      queryClient.setQueryData(securityProfileQueryKey, (current: unknown) => {
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
          securityProfileQueryKey,
          context.previousSnapshot
        )
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: securityProfileQueryKey })
    },
  })
}

export const useCreateOrganizationTemplateFromSystem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrganizationTemplateFromSystem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: templatesQueryKey })
    },
  })
}

export const useUpdateOrganizationTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateOrganizationTemplate,
    onMutate: async ({ id, template }) => {
      await queryClient.cancelQueries({ queryKey: templatesQueryKey })
      const previousCatalog = queryClient.getQueryData<{
        systemTemplates: unknown[]
        organizationTemplates: OrganizationTemplate[]
      }>(templatesQueryKey)

      queryClient.setQueryData(templatesQueryKey, (current: unknown) => {
        if (!current || typeof current !== "object") {
          return current
        }

        const catalog = current as {
          organizationTemplates: OrganizationTemplate[]
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
        queryClient.setQueryData(templatesQueryKey, context.previousCatalog)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: templatesQueryKey })
    },
  })
}

export const useDeleteOrganizationTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOrganizationTemplate,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: templatesQueryKey })
      const previousCatalog = queryClient.getQueryData<{
        systemTemplates: unknown[]
        organizationTemplates: OrganizationTemplate[]
      }>(templatesQueryKey)

      queryClient.setQueryData(templatesQueryKey, (current: unknown) => {
        if (!current || typeof current !== "object") {
          return current
        }

        const catalog = current as {
          organizationTemplates: OrganizationTemplate[]
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
        queryClient.setQueryData(templatesQueryKey, context.previousCatalog)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: templatesQueryKey })
    },
  })
}

export type SaveProfilePayload = ProfileDraft

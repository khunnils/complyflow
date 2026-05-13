import {
  securityProgramSnapshotSchema,
  structuredErrorSchema,
  providerSchema,
  templateCatalogSchema,
  vendorSchema,
  organizationTemplateSchema,
  type Provider,
  type CreateOrganizationTemplateFromSystem,
  type OrganizationTemplate,
  type OrganizationTemplateInput,
  type SecurityProgramSnapshot,
  type TemplateCatalog,
  type Vendor,
  type VendorInput,
} from "@complyflow/shared"
import { z } from "zod"

import { type ProfileDraft } from "@/types/security-profile"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000"

const parseResponse = async <T>(
  response: Response,
  schema: z.ZodType<T>
): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const parsedError = structuredErrorSchema.safeParse(body)
    throw new Error(
      parsedError.success ? parsedError.data.error.message : "Request failed"
    )
  }

  return schema.parse(await response.json())
}

const apiRequest = async <T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  })

  return parseResponse(response, schema)
}

export const getSecurityProfile = (): Promise<SecurityProgramSnapshot> =>
  apiRequest("/security-profile", securityProgramSnapshotSchema)

export const getProviders = (): Promise<Provider[]> =>
  apiRequest("/providers", z.array(providerSchema))

export const getTemplates = (): Promise<TemplateCatalog> =>
  apiRequest("/templates", templateCatalogSchema)

export const saveSecurityProfile = (
  profile: ProfileDraft
): Promise<SecurityProgramSnapshot> =>
  apiRequest("/security-profile", securityProgramSnapshotSchema, {
    method: "PUT",
    body: JSON.stringify(profile),
  })

export const createVendor = (vendor: VendorInput): Promise<Vendor> =>
  apiRequest("/vendors", vendorSchema, {
    method: "POST",
    body: JSON.stringify(vendor),
  })

export const createOrganizationTemplateFromSystem = (
  input: CreateOrganizationTemplateFromSystem
): Promise<OrganizationTemplate> =>
  apiRequest("/templates/organization", organizationTemplateSchema, {
    method: "POST",
    body: JSON.stringify(input),
  })

export const updateOrganizationTemplate = ({
  id,
  template,
}: {
  id: string
  template: OrganizationTemplateInput
}): Promise<OrganizationTemplate> =>
  apiRequest(`/templates/organization/${id}`, organizationTemplateSchema, {
    method: "PUT",
    body: JSON.stringify(template),
  })

export const updateVendor = ({
  id,
  vendor,
}: {
  id: string
  vendor: VendorInput
}): Promise<Vendor> =>
  apiRequest(`/vendors/${id}`, vendorSchema, {
    method: "PUT",
    body: JSON.stringify(vendor),
  })

export const deleteVendor = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/vendors/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const parsedError = structuredErrorSchema.safeParse(body)
    throw new Error(
      parsedError.success ? parsedError.data.error.message : "Request failed"
    )
  }
}

export const deleteOrganizationTemplate = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/templates/organization/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const parsedError = structuredErrorSchema.safeParse(body)
    throw new Error(
      parsedError.success ? parsedError.data.error.message : "Request failed"
    )
  }
}

import {
  type OrganizationSecurityProfile,
  type Provider,
} from "@plyco/shared"

export type SecurityProfileInput = Pick<
  OrganizationSecurityProfile,
  "company" | "service" | "infrastructure" | "dataHandling" | "access"
>

export interface OrganizationRepository {
  getOrganization(
    organizationId: string,
  ): Promise<OrganizationSecurityProfile | null>
  upsertProfile(
    organizationId: string,
    input: SecurityProfileInput,
    providerCatalog: Provider[],
  ): Promise<OrganizationSecurityProfile>
  listDataTypeNames(organizationId: string): Promise<string[]>
}

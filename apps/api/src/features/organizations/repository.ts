import { type OrganizationSecurityProfile } from "@complyflow/shared"

export type SecurityProfileInput = Pick<
  OrganizationSecurityProfile,
  "company" | "infrastructure" | "dataHandling" | "access"
>

export interface OrganizationRepository {
  getOrganization(
    organizationId: string,
  ): Promise<OrganizationSecurityProfile | null>
  upsertProfile(
    organizationId: string,
    input: SecurityProfileInput,
  ): Promise<OrganizationSecurityProfile>
  listDataTypeNames(organizationId: string): Promise<string[]>
}

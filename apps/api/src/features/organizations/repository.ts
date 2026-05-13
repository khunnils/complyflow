import { type OrganizationSecurityProfile } from "@complyflow/shared"

export type SecurityProfileInput = Pick<
  OrganizationSecurityProfile,
  "company" | "infrastructure" | "dataHandling" | "access"
>

export interface OrganizationRepository {
  getOrganization(): Promise<OrganizationSecurityProfile | null>
  upsertProfile(
    input: SecurityProfileInput,
  ): Promise<OrganizationSecurityProfile>
  getOrCreateOrganizationId(): Promise<string>
  listDataTypeNames(): Promise<string[]>
}

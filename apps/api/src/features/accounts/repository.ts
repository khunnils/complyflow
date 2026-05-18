import {
  type AuthUser,
  type CreateOrganization,
  type OrganizationMember,
  type OrganizationMembershipRole,
  type OrganizationSummary,
} from "@plyco/shared"

export type AccountUserInput = {
  googleSubject: string
  email: string
  name: string
  picture?: string
}

export interface AccountRepository {
  getUser(userId: string): Promise<AuthUser | null>
  upsertUser(input: AccountUserInput): Promise<AuthUser>
  listOrganizations(userId: string): Promise<OrganizationSummary[]>
  listOrganizationMembers(organizationId: string): Promise<OrganizationMember[]>
  createOrganization(
    userId: string,
    input: CreateOrganization,
  ): Promise<OrganizationSummary>
  getMembershipRole(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMembershipRole | null>
}

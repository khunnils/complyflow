import {
  authUserSchema,
  organizationSummarySchema,
  type AuthUser,
  type CreateOrganization,
  type OrganizationMembershipRole,
  type OrganizationSummary,
} from "@complyflow/shared"

import {
  type AccountRepository,
  type AccountUserInput,
} from "./repository.js"

const now = () => new Date().toISOString()
const newId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`

export class InMemoryAccountRepository implements AccountRepository {
  private users = new Map<string, AuthUser>()
  private googleSubjectUserIds = new Map<string, string>()
  private organizations = new Map<string, OrganizationSummary>()
  private memberships = new Map<string, OrganizationMembershipRole>()

  async getUser(userId: string): Promise<AuthUser | null> {
    return this.users.get(userId) ?? null
  }

  async upsertUser(input: AccountUserInput): Promise<AuthUser> {
    const id = this.googleSubjectUserIds.get(input.googleSubject) ?? newId("user")
    const user = authUserSchema.parse({
      id,
      email: input.email,
      name: input.name,
      picture: input.picture,
    })

    this.googleSubjectUserIds.set(input.googleSubject, id)
    this.users.set(id, user)

    return user
  }

  async listOrganizations(userId: string): Promise<OrganizationSummary[]> {
    return Array.from(this.organizations.values()).filter((organization) =>
      this.memberships.has(this.membershipKey(userId, organization.id)),
    )
  }

  async createOrganization(
    userId: string,
    input: CreateOrganization,
  ): Promise<OrganizationSummary> {
    const timestamp = now()
    const organization = organizationSummarySchema.parse({
      id: newId("org"),
      name: input.name,
      role: "owner",
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    this.organizations.set(organization.id, organization)
    this.memberships.set(this.membershipKey(userId, organization.id), "owner")

    return organization
  }

  async getMembershipRole(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMembershipRole | null> {
    return this.memberships.get(this.membershipKey(userId, organizationId)) ?? null
  }

  addMembership(
    userId: string,
    organization: OrganizationSummary,
    role: OrganizationMembershipRole = "member",
  ) {
    this.organizations.set(organization.id, { ...organization, role })
    this.memberships.set(this.membershipKey(userId, organization.id), role)
  }

  private membershipKey(userId: string, organizationId: string) {
    return `${userId}:${organizationId}`
  }
}

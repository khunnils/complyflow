import { type OrganizationSecurityProfile } from "@complyflow/shared"

import {
  type OrganizationRepository,
  type SecurityProfileInput,
} from "./repository.js"

function now() {
  return new Date().toISOString()
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private organization: OrganizationSecurityProfile | null = null

  async getOrganization(): Promise<OrganizationSecurityProfile | null> {
    return this.organization
  }

  async upsertProfile(
    input: SecurityProfileInput,
  ): Promise<OrganizationSecurityProfile> {
    const timestamp = now()
    const organization: OrganizationSecurityProfile = {
      id: this.organization?.id ?? newId("org"),
      ...input,
      createdAt: this.organization?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }

    this.organization = organization
    return organization
  }

  async getOrCreateOrganizationId(): Promise<string> {
    if (!this.organization) {
      const timestamp = now()

      this.organization = {
        id: newId("org"),
        company: {
          companyName: "Untitled company",
          employeeCount: 1,
          industries: [],
          regions: [],
          handlesPii: false,
          handlesSensitiveData: false,
          complianceGoals: [],
        },
        infrastructure: {
          cloudProviders: [],
          sourceControlProvider: "",
          authProvider: "",
          passwordManager: "",
          mfaEnabled: false,
          encryptedDevicesRequired: false,
          backupsEnabled: false,
          centralizedLoggingEnabled: false,
        },
        dataHandling: {
          dataTypesStored: [],
          storesPii: false,
          storesHealthcareData: false,
          encryptionAtRest: false,
          encryptionInTransit: false,
          productionDataInDevelopment: false,
          retentionPolicyExists: false,
        },
        access: {
          mfaRequired: false,
          ssoEnabled: false,
          sharedAccountsExist: false,
          offboardingProcessExists: false,
          accessReviewsPerformed: false,
          privilegedAccessRestricted: false,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      }
    }

    return this.organization.id
  }

  async listDataTypeNames(): Promise<string[]> {
    return (
      this.organization?.dataHandling.dataTypesStored.map(
        (dataType) => dataType.name,
      ) ?? []
    )
  }
}

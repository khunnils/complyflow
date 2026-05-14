import { mapOrganizationRecord, prisma, type PrismaClient } from "@complyflow/db"
import {
  type AccessProfile,
  type CompanyProfile,
  type DataHandlingProfile,
  type InfrastructureProfile,
  type OrganizationSecurityProfile,
} from "@complyflow/shared"

import {
  type OrganizationRepository,
  type SecurityProfileInput,
} from "./repository.js"

export const ORGANIZATION_INCLUDE = {
  accessProfile: true,
  dataHandlingProfile: true,
  dataTypes: { orderBy: { createdAt: "asc" } },
  infrastructureProfile: true,
} as const

export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly client: PrismaClient = prisma) {}

  async getOrganization(
    organizationId: string,
  ): Promise<OrganizationSecurityProfile | null> {
    const organization = await this.client.organization.findUnique({
      where: { id: organizationId },
      include: ORGANIZATION_INCLUDE,
    })

    return organization ? mapOrganizationRecord(organization) : null
  }

  async upsertProfile(
    organizationId: string,
    input: SecurityProfileInput,
  ): Promise<OrganizationSecurityProfile> {
    const organizationData = this.organizationData(input.company)
    const infrastructureData = this.infrastructureData(input.infrastructure)
    const dataHandlingData = this.dataHandlingData(input.dataHandling)
    const accessData = this.accessData(input.access)

    const organization = await this.client.organization.update({
      where: { id: organizationId },
      data: {
        ...organizationData,
        accessProfile: {
          upsert: {
            create: accessData,
            update: accessData,
          },
        },
        dataHandlingProfile: {
          upsert: {
            create: dataHandlingData,
            update: dataHandlingData,
          },
        },
        infrastructureProfile: {
          upsert: {
            create: infrastructureData,
            update: infrastructureData,
          },
        },
      },
      include: ORGANIZATION_INCLUDE,
    })

    await this.syncOrganizationDataTypes(organization.id, input.dataHandling)

    return mapOrganizationRecord(
      await this.client.organization.findUniqueOrThrow({
        where: { id: organization.id },
        include: ORGANIZATION_INCLUDE,
      }),
    )
  }

  async listDataTypeNames(organizationId: string): Promise<string[]> {
    const dataTypes = await this.client.organizationDataType.findMany({
      where: { organizationId },
      select: { name: true },
    })

    return dataTypes.map((dataType) => dataType.name)
  }

  private organizationData(input: CompanyProfile) {
    return {
      companyName: input.companyName,
      employeeCount: input.employeeCount,
      industries: input.industries,
      regions: input.regions,
      handlesPii: input.handlesPii,
      handlesSensitiveData: input.handlesSensitiveData,
      complianceGoals: input.complianceGoals,
    }
  }

  private infrastructureData(input: InfrastructureProfile) {
    return {
      cloudProviders: input.cloudProviders,
      sourceControlProvider: input.sourceControlProvider || null,
      authProvider: input.authProvider || null,
      passwordManager: input.passwordManager || null,
      mfaEnabled: input.mfaEnabled,
      encryptedDevicesRequired: input.encryptedDevicesRequired,
      backupsEnabled: input.backupsEnabled,
      centralizedLoggingEnabled: input.centralizedLoggingEnabled,
    }
  }

  private dataHandlingData(input: DataHandlingProfile) {
    return {
      storesPii: input.storesPii,
      storesHealthcareData: input.storesHealthcareData,
      encryptionAtRest: input.encryptionAtRest,
      encryptionInTransit: input.encryptionInTransit,
      productionDataInDevelopment: input.productionDataInDevelopment,
      retentionPolicyExists: input.retentionPolicyExists,
    }
  }

  private organizationDataTypes(input: DataHandlingProfile) {
    return input.dataTypesStored.map((dataType) => ({
      name: dataType.name,
      isSensitive: dataType.isSensitive,
      description: dataType.description,
    }))
  }

  private async syncOrganizationDataTypes(
    organizationId: string,
    input: DataHandlingProfile,
  ) {
    const dataTypes = this.organizationDataTypes(input)
    const names = dataTypes.map((dataType) => dataType.name)

    await this.client.organizationDataType.deleteMany({
      where: {
        organizationId,
        name: { notIn: names },
      },
    })

    await Promise.all(
      dataTypes.map((dataType) =>
        this.client.organizationDataType.upsert({
          where: {
            organizationId_name: {
              organizationId,
              name: dataType.name,
            },
          },
          create: {
            organizationId,
            ...dataType,
          },
          update: {
            isSensitive: dataType.isSensitive,
            description: dataType.description,
          },
        }),
      ),
    )
  }

  private accessData(input: AccessProfile) {
    return {
      mfaRequired: input.mfaRequired,
      ssoEnabled: input.ssoEnabled,
      sharedAccountsExist: input.sharedAccountsExist,
      offboardingProcessExists: input.offboardingProcessExists,
      accessReviewsPerformed: input.accessReviewsPerformed,
      privilegedAccessRestricted: input.privilegedAccessRestricted,
    }
  }
}

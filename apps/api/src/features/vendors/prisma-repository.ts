import { mapVendorRecord, prisma, type PrismaClient } from "@complyflow/db"
import { type Vendor, type VendorInput } from "@complyflow/shared"

import { ApiError } from "../../errors.js"
import { type OrganizationRepository } from "../organizations/repository.js"
import { type VendorRepository } from "./repository.js"

const VENDOR_INCLUDE = {
  dataTypes: {
    include: { organizationDataType: true },
    orderBy: { createdAt: "asc" },
  },
} as const

export class PrismaVendorRepository implements VendorRepository {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly client: PrismaClient = prisma,
  ) {}

  async listVendors(): Promise<Vendor[]> {
    const organization = await this.organizationRepository.getOrganization()

    if (!organization) {
      return []
    }

    const vendors = await this.client.vendor.findMany({
      where: { organizationId: organization.id },
      include: VENDOR_INCLUDE,
      orderBy: { createdAt: "asc" },
    })

    return vendors.map(mapVendorRecord)
  }

  async createVendor(input: VendorInput): Promise<Vendor> {
    const organizationId =
      await this.organizationRepository.getOrCreateOrganizationId()
    const dataProcessed = await this.validVendorDataTypeNames(input)
    const vendor = await this.client.vendor.create({
      data: {
        organizationId,
        ...this.vendorData(input),
        dataTypes: {
          create: dataProcessed.map((name) => ({
            organizationDataType: this.connectDataType(organizationId, name),
          })),
        },
      },
      include: VENDOR_INCLUDE,
    })

    return mapVendorRecord(vendor)
  }

  async updateVendor(id: string, input: VendorInput): Promise<Vendor | null> {
    const organizationId =
      await this.organizationRepository.getOrCreateOrganizationId()
    const existing = await this.client.vendor.findFirst({
      where: { id, organizationId },
    })

    if (!existing) {
      return null
    }

    const dataProcessed = await this.validVendorDataTypeNames(input)
    const vendor = await this.client.vendor.update({
      where: { id },
      data: {
        ...this.vendorData(input),
        dataTypes: {
          deleteMany: {},
          create: dataProcessed.map((name) => ({
            organizationDataType: this.connectDataType(organizationId, name),
          })),
        },
      },
      include: VENDOR_INCLUDE,
    })

    return mapVendorRecord(vendor)
  }

  async deleteVendor(id: string): Promise<boolean> {
    const organizationId =
      await this.organizationRepository.getOrCreateOrganizationId()
    const existing = await this.client.vendor.findFirst({
      where: { id, organizationId },
    })

    if (!existing) {
      return false
    }

    await this.client.vendor.delete({ where: { id } })
    return true
  }

  private async validVendorDataTypeNames(input: VendorInput) {
    if (input.dataProcessingLevel === "none") {
      return []
    }

    const requestedNames = Array.from(new Set(input.dataProcessed))

    if (requestedNames.length === 0) {
      return []
    }

    const existingNames = new Set(
      await this.organizationRepository.listDataTypeNames(),
    )
    const missingNames = requestedNames.filter(
      (name) => !existingNames.has(name),
    )

    if (missingNames.length > 0) {
      throw new ApiError(
        "VENDOR_DATA_TYPE_NOT_FOUND",
        "Vendor data processed must reference data types stored on the organization.",
        400,
        { dataProcessed: missingNames },
      )
    }

    return requestedNames
  }

  private connectDataType(organizationId: string, name: string) {
    return {
      connect: {
        organizationId_name: {
          organizationId,
          name,
        },
      },
    }
  }

  private vendorData(input: VendorInput) {
    return {
      name: input.name,
      category: input.category,
      purpose: input.purpose,
      hasSubprocessors: input.hasSubprocessors,
      dataProcessingLevel: input.dataProcessingLevel,
      dpaStatus: input.dpaStatus,
      dataRegions: input.dataRegions,
      criticality: input.criticality,
      owner: input.owner || null,
      notes: input.notes || null,
    }
  }
}

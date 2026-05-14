import { type Vendor, type VendorInput } from "@complyflow/shared"

import { ApiError } from "../../errors.js"
import { type OrganizationRepository } from "../organizations/repository.js"
import { type VendorRepository } from "./repository.js"

function now() {
  return new Date().toISOString()
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

export class InMemoryVendorRepository implements VendorRepository {
  private vendors = new Map<string, Vendor & { organizationId: string }>()

  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async listVendors(organizationId: string): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).filter(
      (vendor) => vendor.organizationId === organizationId,
    )
  }

  async createVendor(organizationId: string, input: VendorInput): Promise<Vendor> {
    const timestamp = now()
    const dataProcessed = await this.validVendorDataTypeNames(
      organizationId,
      input,
    )
    const vendor: Vendor & { organizationId: string } = {
      id: newId("vendor"),
      organizationId,
      ...input,
      dataProcessed,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    this.vendors.set(vendor.id, vendor)
    return vendor
  }

  async updateVendor(
    organizationId: string,
    id: string,
    input: VendorInput,
  ): Promise<Vendor | null> {
    const currentVendor = this.vendors.get(id)

    if (!currentVendor || currentVendor.organizationId !== organizationId) {
      return null
    }

    const dataProcessed = await this.validVendorDataTypeNames(
      organizationId,
      input,
    )
    const vendor: Vendor & { organizationId: string } = {
      id,
      organizationId,
      ...input,
      dataProcessed,
      createdAt: currentVendor.createdAt,
      updatedAt: now(),
    }

    this.vendors.set(id, vendor)
    return vendor
  }

  async deleteVendor(organizationId: string, id: string): Promise<boolean> {
    const currentVendor = this.vendors.get(id)

    if (!currentVendor || currentVendor.organizationId !== organizationId) {
      return false
    }

    return this.vendors.delete(id)
  }

  private async validVendorDataTypeNames(
    organizationId: string,
    input: VendorInput,
  ) {
    if (input.dataProcessingLevel === "none") {
      return []
    }

    const requestedNames = Array.from(new Set(input.dataProcessed))

    if (requestedNames.length === 0) {
      return []
    }

    const organizationDataTypeNames = new Set(
      await this.organizationRepository.listDataTypeNames(organizationId),
    )
    const missingNames = requestedNames.filter(
      (name) => !organizationDataTypeNames.has(name),
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
}

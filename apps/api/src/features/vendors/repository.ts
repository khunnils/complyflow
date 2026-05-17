import { type Vendor, type VendorInput } from "@plyco/shared"

export interface VendorRepository {
  listVendors(organizationId: string): Promise<Vendor[]>
  createVendor(organizationId: string, input: VendorInput): Promise<Vendor>
  updateVendor(
    organizationId: string,
    id: string,
    input: VendorInput,
  ): Promise<Vendor | null>
  deleteVendor(organizationId: string, id: string): Promise<boolean>
}

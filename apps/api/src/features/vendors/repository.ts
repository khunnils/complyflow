import { type Vendor, type VendorInput } from "@complyflow/shared"

export interface VendorRepository {
  listVendors(): Promise<Vendor[]>
  createVendor(input: VendorInput): Promise<Vendor>
  updateVendor(id: string, input: VendorInput): Promise<Vendor | null>
  deleteVendor(id: string): Promise<boolean>
}

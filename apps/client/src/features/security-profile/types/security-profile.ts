import {
  type AccessProfile,
  type CompanyProfile,
  type DataHandlingProfile,
  type InfrastructureProfile,
  type ServiceProfile,
} from "@plyco/shared"

export type ProfileDraft = {
  company: CompanyProfile
  service: ServiceProfile
  infrastructure: InfrastructureProfile
  dataHandling: DataHandlingProfile
  access: AccessProfile
}

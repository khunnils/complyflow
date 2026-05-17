import {
  type AccessProfile,
  type CompanyProfile,
  type DataHandlingProfile,
  type InfrastructureProfile,
} from "@plyco/shared"

export type ProfileDraft = {
  company: CompanyProfile
  infrastructure: InfrastructureProfile
  dataHandling: DataHandlingProfile
  access: AccessProfile
}

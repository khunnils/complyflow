import {
  type AccessProfile,
  type CompanyProfile,
  type DataHandlingProfile,
  type InfrastructureProfile,
  type PrivacyProfile,
  type ServiceProfile,
} from "@plyco/shared"

export type ProfileDraft = {
  company: CompanyProfile
  service: ServiceProfile
  privacy: PrivacyProfile
  infrastructure: InfrastructureProfile
  dataHandling: DataHandlingProfile
  access: AccessProfile
}

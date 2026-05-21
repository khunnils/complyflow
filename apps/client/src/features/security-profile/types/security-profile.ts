import {
  type AccessProfile,
  type CompanyProfile,
  type DataHandlingProfile,
  type InfrastructureProfile,
  type PrivacyProfile,
  type ServiceProfileInput,
} from "@plyco/shared"

export type ProfileDraft = {
  company: CompanyProfile
  services: ServiceProfileInput[]
  privacy: PrivacyProfile
  infrastructure: InfrastructureProfile
  dataHandling: DataHandlingProfile
  access: AccessProfile
}

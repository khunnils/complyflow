import { zodResolver } from "@hookform/resolvers/zod"
import {
  accessProfileSchema,
  companyProfileSchema,
  dataHandlingProfileSchema,
  infrastructureProfileSchema,
} from "@complyflow/shared"
import { type ReactNode } from "react"
import {
  type FieldErrors,
  type Resolver,
  type UseFormReturn,
  useForm,
} from "react-hook-form"
import { z } from "zod"

import { AccessProfileFields } from "@/components/security/access-profile-fields"
import { CompanyProfileFields } from "@/components/security/company-profile-fields"
import { DataHandlingProfileFields } from "@/components/security/data-handling-profile-fields"
import { InfrastructureProfileFields } from "@/components/security/infrastructure-profile-fields"
import { type ProfileDraft } from "@/types/security-profile"

const profileDraftSchema = z.object({
  company: companyProfileSchema,
  infrastructure: infrastructureProfileSchema,
  dataHandling: dataHandlingProfileSchema,
  access: accessProfileSchema,
})

export type ProfileFormReturn = UseFormReturn<ProfileDraft>

export const ProfileForm = ({
  defaultValues,
  children,
  onInvalid,
  onSubmit,
}: {
  defaultValues: ProfileDraft
  children: (form: ProfileFormReturn) => ReactNode
  onInvalid?: (errors: FieldErrors<ProfileDraft>) => void
  onSubmit: (profile: ProfileDraft) => void
}) => {
  const form = useForm<ProfileDraft>({
    defaultValues,
    mode: "onBlur",
    resolver: zodResolver(profileDraftSchema) as Resolver<ProfileDraft>,
    values: defaultValues,
  })

  return (
    <form
      className="grid gap-5"
      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
    >
      {children(form)}
    </form>
  )
}

export const ProfileCompanyFields = CompanyProfileFields
export const ProfileInfrastructureFields = InfrastructureProfileFields
export const ProfileDataHandlingFields = DataHandlingProfileFields
export const ProfileAccessFields = AccessProfileFields

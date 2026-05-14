import { Building2, Plus } from "lucide-react"
import { type OrganizationSummary } from "@complyflow/shared"

import { Button } from "@/components/ui/button"

export const OrganizationSwitcher = ({
  organizations,
  selectedOrganizationId,
  onCreateOrganization,
  onSelectOrganization,
}: {
  organizations: OrganizationSummary[]
  selectedOrganizationId: string
  onCreateOrganization: () => void
  onSelectOrganization: (organizationId: string) => void
}) => (
  <div className="grid gap-2">
    <label className="grid gap-1">
      <span className="text-xs font-medium text-slate-500">Organization</span>
      <span className="relative">
        <Building2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <select
          className="h-10 w-full rounded-md border border-slate-200 bg-white pr-3 pl-9 text-sm font-medium text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          value={selectedOrganizationId}
          onChange={(event) => onSelectOrganization(event.target.value)}
        >
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </span>
    </label>
    <Button type="button" variant="outline" onClick={onCreateOrganization}>
      <Plus />
      New organization
    </Button>
  </div>
)

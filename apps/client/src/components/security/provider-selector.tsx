import { ExternalLink } from "lucide-react"
import { type Provider } from "@complyflow/shared"

import { Button } from "@/components/ui/button"

export const ProviderSelector = ({
  providers,
  error,
  isLoading,
  onChooseProvider,
  onChooseOther,
}: {
  providers: Provider[]
  error?: string | null
  isLoading: boolean
  onChooseProvider: (provider: Provider) => void
  onChooseOther: () => void
}) => (
  <div className="grid gap-3">
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {providers.map((provider) => (
        <button
          className="rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40"
          key={provider.id}
          type="button"
          onClick={() => onChooseProvider(provider)}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-950">{provider.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {provider.category ?? "Provider"}
              </p>
            </div>
            {provider.logoUrl ? (
              <img
                alt=""
                className="size-8 rounded-md object-contain"
                src={provider.logoUrl}
              />
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {provider.securityCriticality ? (
              <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
                {provider.securityCriticality}
              </span>
            ) : null}
            {provider.handlesCustomerData ? (
              <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                Customer data
              </span>
            ) : null}
          </div>
          {provider.url ? (
            <p className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500">
              <ExternalLink className="size-3" />
              {provider.url}
            </p>
          ) : null}
        </button>
      ))}
    </div>
    {isLoading ? (
      <p className="text-sm text-slate-500">Loading provider catalog...</p>
    ) : null}
    {error ? (
      <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Provider catalog unavailable. Use Other to add a custom vendor.
      </p>
    ) : null}
    <Button
      className="w-fit"
      type="button"
      variant="outline"
      onClick={onChooseOther}
    >
      Other
    </Button>
  </div>
)

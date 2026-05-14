import { Building2, Loader2, LogOut, Plus } from "lucide-react"
import { type AuthUser } from "@complyflow/shared"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { type MutationState } from "@/types/security-profile"

export const CreateOrganizationScreen = ({
  error,
  saveState,
  user,
  onCreate,
  onLogout,
}: {
  error: string | null
  saveState: MutationState
  user: AuthUser
  onCreate: (name: string) => void
  onLogout: () => void
}) => {
  const [name, setName] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onCreate(name)
  }

  return (
    <main className="min-h-svh bg-slate-50 px-4 py-6 text-slate-900 md:px-8">
      <div className="mx-auto grid min-h-[calc(100svh-3rem)] max-w-xl content-center">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                <Building2 className="size-5" />
              </div>
              <p className="text-sm font-semibold text-blue-700">ComplyFlow</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-950">
                Create an organization
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Start a workspace for the company whose security snapshot you
                want to manage.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={onLogout}>
              <LogOut />
              Logout
            </Button>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">
                Organization name
              </span>
              <input
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-slate-500">
                Signed in as {user.email}
              </div>
              <Button disabled={saveState === "loading"} type="submit">
                {saveState === "loading" ? <Loader2 /> : <Plus />}
                Create organization
              </Button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

import { Pencil, Plus, Save, Trash2, X } from "lucide-react"
import { useState } from "react"
import { type Vocabulary, type VocabularyCodeInput } from "@plyco/shared"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const VocabularyManager = ({
  isSaving,
  vocabulary,
  onCreateCode,
  onDeleteCode,
  onUpdateCode,
}: {
  isSaving: boolean
  vocabulary: Vocabulary | undefined
  onCreateCode: (codeSetId: string, code: VocabularyCodeInput) => void
  onDeleteCode: (codeSetId: string, codeId: string) => void
  onUpdateCode: (
    codeSetId: string,
    codeId: string,
    code: VocabularyCodeInput,
  ) => void
}) => {
  const [drafts, setDrafts] = useState<Record<string, VocabularyCodeInput>>({})
  const [selectedCodeSetId, setSelectedCodeSetId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  const codeSets =
    vocabulary?.codeSets.filter((codeSet) => !codeSet.isSystem) ?? []

  if (!vocabulary) {
    return <p className="text-sm text-slate-500">Loading vocabulary...</p>
  }

  if (codeSets.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        No organization vocabularies are available.
      </p>
    )
  }

  // Default to the first code set if none is selected, or if the selected one is no longer available
  let selectedCodeSet = codeSets.find(cs => cs.codeSetId === selectedCodeSetId)
  if (!selectedCodeSet) {
    selectedCodeSet = codeSets[0]
  }

  const draft = drafts[selectedCodeSet.codeSetId] ?? {
    codeId: "",
    name: "",
    active: true,
  }

  return (
    <div className="grid gap-6">
      {/* Pills Navigation */}
      <div className="flex flex-wrap gap-2">
        {codeSets.map((codeSet) => {
          const isSelected = codeSet.codeSetId === selectedCodeSetId
          return (
            <Badge
              key={codeSet.id}
              variant={isSelected ? "secondary" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setSelectedCodeSetId(codeSet.codeSetId)
                setIsEditing(false)
              }}
            >
              {codeSet.name}
            </Badge>
          )
        })}
      </div>

      {/* Selected Code Set Detail */}
      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">{selectedCodeSet.name}</h3>
            {selectedCodeSet.description ? (
              <p className="mt-1 text-sm text-slate-500">
                {selectedCodeSet.description}
              </p>
            ) : null}
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <X className="mr-2 h-4 w-4" /> Done
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </>
            )}
          </Button>
        </div>

        {isEditing ? (
          <div className="grid gap-3 pt-2">
            {selectedCodeSet.codes.map((code) => (
              <div
                className="grid gap-2 rounded-md bg-slate-50 p-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]"
                key={code.id}
              >
                <input
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={code.codeId}
                  onChange={(event) =>
                    onUpdateCode(selectedCodeSet.codeSetId, code.codeId, {
                      codeId: event.target.value,
                      name: code.name,
                      active: code.active,
                    })
                  }
                />
                <input
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={code.name}
                  onChange={(event) =>
                    onUpdateCode(selectedCodeSet.codeSetId, code.codeId, {
                      codeId: code.codeId,
                      name: event.target.value,
                      active: code.active,
                    })
                  }
                />
                <Button
                  disabled={isSaving}
                  type="button"
                  variant="outline"
                  onClick={() =>
                    onUpdateCode(selectedCodeSet.codeSetId, code.codeId, {
                      codeId: code.codeId,
                      name: code.name,
                      active: !code.active,
                    })
                  }
                >
                  {code.active ? "Active" : "Inactive"}
                </Button>
                <Button
                  disabled={isSaving}
                  type="button"
                  variant="outline"
                  onClick={() => onDeleteCode(selectedCodeSet.codeSetId, code.codeId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="mt-2 grid gap-2 rounded-md border border-dashed border-slate-300 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <input
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                placeholder="code_id"
                value={draft.codeId}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [selectedCodeSet.codeSetId]: {
                      ...draft,
                      codeId: event.target.value,
                    },
                  }))
                }
              />
              <input
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                placeholder="Display name"
                value={draft.name}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [selectedCodeSet.codeSetId]: {
                      ...draft,
                      name: event.target.value,
                    },
                  }))
                }
              />
              <Button
                disabled={isSaving || !draft.codeId.trim() || !draft.name.trim()}
                type="button"
                onClick={() => {
                  onCreateCode(selectedCodeSet.codeSetId, draft)
                  setDrafts((current) => ({
                    ...current,
                    [selectedCodeSet.codeSetId]: {
                      codeId: "",
                      name: "",
                      active: true,
                    },
                  }))
                }}
              >
                {isSaving ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                Add code
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-2 pt-2">
            {selectedCodeSet.codes.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No codes in this set.</p>
            ) : (
              <div className="rounded-md border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">Code ID</th>
                      <th className="px-4 py-2 font-medium">Display Name</th>
                      <th className="px-4 py-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedCodeSet.codes.map((code) => (
                      <tr key={code.id} className="bg-white">
                        <td className="px-4 py-2 font-mono text-slate-600">{code.codeId}</td>
                        <td className="px-4 py-2 text-slate-900">{code.name}</td>
                        <td className="px-4 py-2 text-right">
                          <Badge variant={code.active ? "outline" : "secondary"}>
                            {code.active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

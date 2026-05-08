import { useQuery, useMutation } from "@tanstack/react-query"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { apiService } from "../../services/apiService"
import type { StackItem, Size } from "../../types"

const AddSize = () => {
  const [stack, setStack] = useState<StackItem[]>([])
  const [showAddSize, setShowAddSize] = useState(false)
  const currentId = stack.length > 0 ? stack[stack.length - 1].id : null

  // Charge les catégories racines (Femme, Homme, Enfant...)
  const { data: tree, isLoading } = useQuery({
    queryKey: ["categories-tree"],
    queryFn: apiService.getFullTree,
    staleTime: Infinity,
  })
  const rootCategories = tree ?? []

  // Charge les enfants + tailles de la catégorie courante
  const { data: currentNode } = useQuery({
    queryKey: ["vinted-category", currentId],
    queryFn: () => apiService.getCategorySizes(currentId!),
    enabled: currentId !== null,
  })

  const { register: regSize, handleSubmit: handleSize, reset: resetSize } = useForm<Omit<Size, "category_id">>()

  const createSizeMutation = useMutation({
    mutationFn: (data: { id: number; name: string; category_id: number }) => apiService.createSize(data),
    onSuccess: () => {
      setShowAddSize(false)
      resetSize()
    },
  })

  const navigateTo = (item: StackItem): void => {
    setStack((prev) => [...prev, item])
  }

  const onSubmitSize = (values: Omit<Size, "category_id">): void => {
    if (!currentId) return
    createSizeMutation.mutate({
      id: Number(values.id),
      name: values.name,
      category_id: currentId,
    })
  }

  const displayedCategories = currentId === null ? (rootCategories ?? []) : []
  const currentSizes = currentNode ?? []

  return (
    <div className="bg-secondary border-ring flex flex-col gap-2 rounded-lg border p-4">
      <p className="text-lg font-bold text-white">Ajouter une taille</p>

      {/* Breadcrumb */}
      {stack.length > 0 && (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setStack((prev) => prev.slice(0, -1))}>
            <ArrowLeft className="text-white" />
          </button>
          <span className="text-sm text-gray-400">{stack[stack.length - 1].name}</span>
        </div>
      )}

      {/* Liste des catégories */}
      <div className="space-y-2">
        {isLoading ? (
          <p className="text-white">Chargement...</p>
        ) : currentId === null ? (
          // Niveau racine — affiche les catégories
          displayedCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex cursor-pointer items-center justify-between rounded bg-gray-700 p-3"
              onClick={() => navigateTo({ id: cat.id, name: cat.name })}
            >
              <span className="text-white">{cat.name}</span>
              <ChevronRight className="text-white" />
            </div>
          ))
        ) : // Dans une catégorie — affiche les tailles liées
        currentSizes.length === 0 ? (
          <p className="text-white">Aucune taille</p>
        ) : (
          currentSizes.map((size) => (
            <div key={size.id} className="flex items-center justify-between rounded bg-gray-700/50 p-3">
              <span className="text-white">{size.name}</span>
              <div className="h-fit w-fit rounded-full border-2 border-gray-500 p-0.5">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions — uniquement si on est dans une catégorie */}
      {currentId !== null && (
        <div className="flex gap-2">
          {!showAddSize ? (
            <button
              onClick={() => setShowAddSize(true)}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/10 px-6 py-3 font-bold text-white transition-colors hover:bg-white/20"
            >
              Ajouter une taille
            </button>
          ) : (
            <form onSubmit={handleSize(onSubmitSize)} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
              <input
                {...regSize("id", { required: true, valueAsNumber: true })}
                type="number"
                placeholder="ID Vinted (ex: 206)"
                className="flex-1 bg-transparent text-sm text-white placeholder-[#92adc9] outline-none"
                autoFocus
              />
              <input
                {...regSize("name", { required: true })}
                placeholder="Nom (ex: XS)"
                className="flex-1 bg-transparent text-sm text-white placeholder-[#92adc9] outline-none"
              />
              <button
                type="submit"
                disabled={createSizeMutation.isPending}
                className="bg-primary cursor-pointer rounded-lg px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {createSizeMutation.isPending ? "..." : "Lier"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddSize(false)
                  resetSize()
                }}
                className="text-sm text-[#92adc9] transition-colors hover:text-white"
              >
                Annuler
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default AddSize

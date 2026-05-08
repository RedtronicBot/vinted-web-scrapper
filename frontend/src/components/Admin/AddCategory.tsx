import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { findNode } from "../../helpers/findnode"
import { apiService } from "../../services/apiService"
import type { StackItem, Category, VintedFormValues } from "../../types"

const AddCategory = () => {
  const queryClient = useQueryClient()
  const [stack, setStack] = useState<StackItem[]>([])
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddVinted, setShowAddVinted] = useState(false)
  const currentId = stack.length > 0 ? stack[stack.length - 1].id : null

  const { data: tree, isLoading } = useQuery<Category[]>({
    queryKey: ["categories-tree"],
    queryFn: apiService.getFullTree,
    staleTime: Infinity,
  })
  const currentNode: Pick<Category, "children"> | Category | null =
    stack.length === 0 ? { children: tree ?? [] } : findNode(tree ?? [], stack[stack.length - 1].id)

  const { register: regCategory, handleSubmit: handleCategory, reset: resetCategory } = useForm<Pick<Category, "name">>()
  const { register: regVinted, handleSubmit: handleVinted, reset: resetVinted } = useForm<VintedFormValues>()
  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; parent_id: number | null; position: number }) => apiService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories-tree"] })
      setShowAddCategory(false)
      resetCategory()
    },
  })

  const createVintedMutation = useMutation({
    mutationFn: (data: { id: number; category_id: number }) => apiService.createVintedCategory(data),
    onSuccess: () => {
      setShowAddVinted(false)
      resetVinted()
    },
  })
  const navigateTo = (item: StackItem): void => {
    setStack((prev) => [...prev, item])
  }

  const onSubmitCategory = (values: Pick<Category, "name">): void => {
    createCategoryMutation.mutate({
      name: values.name,
      parent_id: currentId,
      position: currentNode?.children.length ?? 0,
    })
  }

  const onSubmitVinted = (values: VintedFormValues): void => {
    if (!currentId) return
    createVintedMutation.mutate({
      id: Number(values.vinted_id),
      category_id: currentId,
    })
  }
  return (
    <div className="bg-secondary border-ring flex flex-col gap-2 rounded-lg border p-4">
      <p className="text-lg font-bold text-white">Ajouter une catégorie</p>
      {/* Breadcrumb */}
      {stack.length > 0 && (
        <div className="flex items-center gap-2">
          <button onClick={() => setStack((prev) => prev.slice(0, -1))}>
            <ArrowLeft className="text-white" />
          </button>
          <span className="text-sm text-gray-400">{stack[stack.length - 1].name}</span>
        </div>
      )}
      {/* List */}
      <div className="space-y-2">
        {isLoading ? (
          <p className="text-white">Chargement...</p>
        ) : !currentNode || currentNode.children.length === 0 ? (
          <p className="text-white">Aucune sous-catégorie</p>
        ) : (
          currentNode.children.map((cat: Category) => {
            const isLeaf = !!cat.vinted
            return (
              <div
                key={cat.id}
                className="flex cursor-pointer items-center justify-between rounded bg-gray-700 p-3"
                onClick={() => {
                  if (!isLeaf) navigateTo({ id: cat.id, name: cat.name })
                }}
              >
                <span className="text-white">{cat.name}</span>
                {!isLeaf && cat.children.length > 0 ? (
                  <span>
                    <ChevronRight className="text-white" />
                  </span>
                ) : (
                  <div className="h-fit w-fit rounded-full border-2 border-gray-500 p-0.5">
                    <div className={`${isLeaf ? "bg-green-500" : "bg-gray-700"} h-2.5 w-2.5 rounded-full`}></div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {/* Ajouter une catégorie */}
        {!showAddCategory ? (
          <button
            onClick={() => {
              setShowAddCategory(true)
              setShowAddVinted(false)
            }}
            className="bg-primary cursor-pointer rounded-lg px-6 py-3 font-bold text-white"
          >
            Ajouter une catégorie
          </button>
        ) : (
          <form
            onSubmit={handleCategory(onSubmitCategory)}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4"
          >
            <input
              {...regCategory("name", { required: true })}
              placeholder="Nom de la catégorie"
              className="flex-1 bg-transparent text-sm text-white placeholder-[#92adc9] outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="bg-primary cursor-pointer rounded-lg px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {createCategoryMutation.isPending ? "..." : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddCategory(false)
                resetCategory()
              }}
              className="text-sm text-[#92adc9] transition-colors hover:text-white"
            >
              Annuler
            </button>
          </form>
        )}

        {/* Ajouter un ID Vinted — uniquement si on est dans un nœud */}
        {currentId !== null && (
          <>
            {!showAddVinted ? (
              <button
                onClick={() => {
                  setShowAddVinted(true)
                  setShowAddCategory(false)
                }}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/10 px-6 py-3 font-bold text-white transition-colors hover:bg-white/20"
              >
                Ajouter un type de produit Vinted
              </button>
            ) : (
              <form
                onSubmit={handleVinted(onSubmitVinted)}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4"
              >
                <input
                  {...regVinted("vinted_id", { required: true, min: 1 })}
                  type="number"
                  placeholder="ID Vinted (ex: 1842)"
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#92adc9] outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={createVintedMutation.isPending}
                  className="bg-primary cursor-pointer rounded-lg px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {createVintedMutation.isPending ? "..." : "Lier"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddVinted(false)
                    resetVinted()
                  }}
                  className="text-sm text-[#92adc9] transition-colors hover:text-white"
                >
                  Annuler
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AddCategory

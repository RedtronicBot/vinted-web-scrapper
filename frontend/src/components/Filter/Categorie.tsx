import { useRef, useState } from "react"
import type { Category, FilterDTO, StackItem } from "../../types"
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"
import { useClickOutside } from "../../hooks/useClickOutside"
import { useQuery } from "@tanstack/react-query"
import { apiService } from "../../services/apiService"
import { findNode } from "../../helpers/findnode"
import type { UseFormSetValue } from "react-hook-form"

type CategorieProps = {
  setValue: UseFormSetValue<FilterDTO>
  setSelectedCategoryId: (id: number) => void
}
const Categorie = ({ setValue, setSelectedCategoryId }: CategorieProps) => {
  const [stack, setStack] = useState<StackItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [openCategory, setOpenCategory] = useState(false)
  const categoryRef = useRef(null)
  const categoryModalRef = useRef(null)
  useClickOutside(categoryModalRef, () => setOpenCategory(false), categoryRef)
  const { data: tree, isLoading: IsCategoryLoading } = useQuery<Category[]>({
    queryKey: ["categories-tree"],
    queryFn: apiService.getFullTree,
    staleTime: Infinity,
  })
  const currentNode: Pick<Category, "children"> | Category | null =
    stack.length === 0 ? { children: tree ?? [] } : findNode(tree ?? [], stack[stack.length - 1].id)
  const navigateTo = (item: StackItem): void => {
    setStack((prev) => [...prev, item])
  }
  return (
    <div className="bg-form border-ring relative flex h-13 items-center rounded-lg border p-2 text-lg text-[#92adc9]">
      <div className="flex cursor-pointer items-center gap-2 select-none" onClick={() => setOpenCategory(!openCategory)} ref={categoryRef}>
        <p>Catégorie</p>
        <ChevronDown />
      </div>
      <div
        className={`${openCategory ? "" : "hidden"} bg-form border-ring absolute top-13 left-0 z-10 flex max-h-64 w-40 flex-col overflow-scroll rounded-lg border text-lg text-[#92adc9]`}
        ref={categoryModalRef}
      >
        {stack.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={() => setStack((prev) => prev.slice(0, -1))}>
              <ArrowLeft />
            </button>
            <span className="text-lg text-gray-400">{stack[stack.length - 1].name}</span>
            <div className="w-6"></div>
          </div>
        )}
        <div className="flex w-full flex-col">
          {IsCategoryLoading ? (
            <p className="text-white">Chargement...</p>
          ) : !currentNode || currentNode.children.length === 0 ? (
            <p className="text-white">Aucune sous-catégorie</p>
          ) : (
            currentNode.children.map((cat: Category) => {
              const isLeaf = cat.vinted
              return (
                <div
                  key={cat.id}
                  className="border-t-ring flex w-full cursor-pointer items-center justify-between border-t first:rounded-t-lg first:border-t-0 last:rounded-b-lg hover:bg-[#2D353C]"
                  onClick={() => {
                    if (isLeaf) {
                      const vintedId = cat.vinted?.id ?? 0
                      const parentId = stack[0].id ?? cat.id
                      setValue("category_id", vintedId)
                      setSelectedCategory(vintedId)
                      setSelectedCategoryId(parentId)
                      setOpenCategory(!openCategory)
                      return
                    }
                    if (!isLeaf) navigateTo({ id: cat.id, name: cat.name })
                  }}
                >
                  <span className="pl-1 text-white">{cat.name}</span>
                  {!isLeaf && cat.children.length > 0 ? (
                    <span>
                      <ChevronRight className="text-lg text-white" />
                    </span>
                  ) : cat.vinted?.id ? (
                    <div className="mr-1 h-fit w-fit rounded-full border-2 border-gray-500 p-0.5">
                      <div className={`${selectedCategory === cat.vinted.id ? "bg-green-500" : "bg-form"} h-2.5 w-2.5 rounded-full`}></div>
                    </div>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default Categorie

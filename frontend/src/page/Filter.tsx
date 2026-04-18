import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Heart, Search, Trash } from "lucide-react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../services/apiService"
import error_fallback from "../assets/image_fallback.png"
import type { Category, FilterDTO, RootNode, StackItem } from "../types"
import { Link } from "react-router"
import { useRef, useState } from "react"
import { findNode } from "../helpers/findnode"
import { useClickOutside } from "../hooks/useClickOutside"
import { formatNumber } from "../utils/formatNumber"

const Filter = () => {
  const [stack, setStack] = useState<StackItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState(0)
  const categoryRef = useRef(null)
  const categoryModalRef = useRef(null)
  const [openCategory, setOpenCategory] = useState(false)
  useClickOutside(categoryModalRef, () => setOpenCategory(false), categoryRef)
  const priceRef = useRef(null)
  const priceModalRef = useRef(null)
  const [openPrice, setOpenPrice] = useState(false)
  useClickOutside(priceModalRef, () => setOpenPrice(false), priceRef)
  const brandRef = useRef(null)
  const brandModalRef = useRef(null)
  const [openBrand, setOpenBrand] = useState(false)
  useClickOutside(brandModalRef, () => setOpenBrand(false), brandRef)
  const stateRef = useRef(null)
  const stateModalRef = useRef(null)
  const [openState, setOpenState] = useState(false)
  useClickOutside(stateModalRef, () => setOpenState(false), stateRef)
  const colorRef = useRef(null)
  const colorModalRef = useRef(null)
  const [openColor, setOpenColor] = useState(false)
  useClickOutside(colorModalRef, () => setOpenColor(false), colorRef)
  const { data: tree, isLoading: IsCategoryLoading } = useQuery<Category[]>({
    queryKey: ["categories-tree"],
    queryFn: apiService.getFullTree,
    staleTime: Infinity,
  })
  const currentNode: RootNode | Category | null = stack.length === 0 ? { children: tree ?? [] } : findNode(tree ?? [], stack[stack.length - 1].id)
  const queryClient = useQueryClient()

  const { data: filters, isLoading } = useQuery({
    queryKey: ["filters"],
    queryFn: apiService.getFilters,
    refetchInterval: 10 * 1000,
  })
  const { data: state } = useQuery({
    queryKey: ["state"],
    queryFn: apiService.getStates,
  })
  const { data: brand } = useQuery({
    queryKey: ["brand"],
    queryFn: apiService.getBrands,
  })
  const { data: color } = useQuery({
    queryKey: ["color"],
    queryFn: apiService.getColors,
  })
  const createFilterMutation = useMutation({
    mutationFn: (data: Omit<FilterDTO, "id">) =>
      apiService.createFilter({
        search: data.search,
        min_cost: data.max_cost,
        max_cost: data.max_cost,
        brand_id: data.brand_id,
        state_id: data.state_id,
        category_id: data.category_id,
        color_id: data.color_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filters"] })
    },
  })

  const { register, handleSubmit, reset, setValue, watch } = useForm<FilterDTO>()
  const selectedBrand = watch("brand_id")
  const selectedState = (watch("state_id") as number[] | undefined) ?? []
  const selectedColors = (watch("color_id") as number[] | undefined) ?? []
  const onSubmit: SubmitHandler<FilterDTO> = async (data) => {
    await createFilterMutation.mutateAsync(data)
    reset()
  }
  const navigateTo = (item: StackItem): void => {
    setStack((prev) => [...prev, item])
  }

  const deleteFilterMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteFilter(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["filters"] }),
  })
  const ITEMS_PER_PAGE = 56

  const [currentPages, setCurrentPages] = useState<Record<number, number>>({})

  const getCurrentPage = (filterId: number) => currentPages[filterId] ?? 1

  const setPage = (filterId: number, page: number) => {
    setCurrentPages((prev) => ({ ...prev, [filterId]: page }))
  }
  return (
    <div className="bg-background flex min-h-dvh w-full flex-col items-center px-6 py-10 md:px-10">
      <div className="max-w-8xl w-full">
        {/* HEADER */}
        <div className="flex w-full items-center justify-between">
          <div className="mb-10 space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-white">Filtre Vinted</h1>
            <p className="text-lg text-[#92adc9]">Recherche les dernières nouveautés</p>
          </div>
          <Link to={"/admin"}>
            <button className="bg-primary cursor-pointer rounded-lg px-8 py-3 font-bold text-white">Admin</button>
          </Link>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-secondary border-ring mb-6 flex items-end justify-between rounded-lg border p-4">
          <div className="flex flex-wrap gap-4">
            {/* SEARCH */}
            <div className="relative flex h-fit items-center">
              <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-[#92adc9]" />
              <input
                type="text"
                {...register("search")}
                className="bg-form border-ring h-13 rounded-lg border py-3.5 pr-4 pl-12 text-lg text-[#92adc9]"
                placeholder="Rechercher"
              />
            </div>

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
                      const isLeaf = !!cat.vinted
                      return (
                        <div
                          key={cat.id}
                          className="border-t-ring flex w-full cursor-pointer items-center justify-between border-t first:rounded-t-lg first:border-t-0 last:rounded-b-lg hover:bg-[#2D353C]"
                          onClick={() => {
                            if (isLeaf) {
                              console.log("Produit sélectionné", cat)
                              setValue("category_id", cat.vinted.id)
                              setSelectedCategory(cat.vinted.id)
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

            {/* Prix */}
            <div className="bg-form border-ring relative flex h-13 items-center rounded-lg border p-2 text-lg text-[#92adc9]">
              <div className="flex cursor-pointer items-center gap-2 select-none" onClick={() => setOpenPrice(!openPrice)} ref={priceRef}>
                <p>Prix</p>
                <ChevronDown />
              </div>
              <div
                className={`${openPrice ? "" : "hidden"} bg-form border-ring absolute top-13 left-0 z-10 flex w-fit gap-4 rounded-lg border p-4 text-lg text-[#92adc9]`}
                ref={priceModalRef}
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[#92adc9]">De</label>
                  <div className="border-ring/50 focus-within:border-ring relative flex items-center border-b">
                    <input
                      type="number"
                      {...register("min_cost", { valueAsNumber: true })}
                      className="bg-form h-6 w-12 pr-4 text-lg text-[#92adc9] outline-none"
                    />
                    <span className="absolute right-0 text-sm text-[#92adc9] select-none">€</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[#92adc9]">À</label>
                  <div className="border-ring/50 focus-within:border-ring relative flex items-center border-b">
                    <input
                      type="number"
                      {...register("max_cost", { valueAsNumber: true })}
                      className="bg-form h-6 w-12 pr-4 text-lg text-[#92adc9] outline-none"
                    />
                    <span className="absolute right-0 text-sm text-[#92adc9] select-none">€</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BRAND */}
            <div className="bg-form border-ring relative flex h-13 items-center rounded-lg border p-2 text-lg text-[#92adc9]">
              <div className="flex cursor-pointer items-center gap-2 select-none" onClick={() => setOpenBrand(!openBrand)} ref={brandRef}>
                <p>Marque</p>
                <ChevronDown />
              </div>
              <div
                className={`${openBrand ? "" : "hidden"} bg-form border-ring absolute top-13 left-0 z-10 flex max-h-64 w-max flex-col overflow-scroll rounded-lg border text-lg text-[#92adc9]`}
                ref={brandModalRef}
              >
                {brand?.map((brands, index) => (
                  <div
                    key={index}
                    className={`hover:bg-secondary ${selectedBrand === brands.id && "bg-secondary"} user-none w-full cursor-pointer p-2 first:rounded-t-lg last:rounded-b-lg`}
                    onClick={() => {
                      setValue("brand_id", brands.id)
                      setOpenBrand(!openBrand)
                      return
                    }}
                  >
                    {brands.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Couleur */}
            <div className="bg-form border-ring relative flex h-13 items-center rounded-lg border p-2 text-lg text-[#92adc9]">
              <div className="flex cursor-pointer items-center gap-2 select-none" onClick={() => setOpenColor(!openColor)} ref={colorRef}>
                <p>Couleur</p>
                <ChevronDown />
              </div>
              <div
                className={`${openColor ? "" : "hidden"} bg-form border-ring absolute top-13 left-0 z-10 flex max-h-64 w-max flex-col overflow-scroll rounded-lg border text-lg text-[#92adc9]`}
                ref={colorModalRef}
              >
                {color?.map((colors, index) => {
                  const isSelected = selectedColors.includes(colors.id)
                  return (
                    <div
                      key={index}
                      className={`hover:bg-secondary ${isSelected && "bg-secondary"} user-none w-full cursor-pointer p-2 first:rounded-t-lg last:rounded-b-lg`}
                      onClick={() => {
                        const updated = isSelected ? selectedColors.filter((id) => id !== colors.id) : [...selectedColors, colors.id]
                        setValue("color_id", updated)
                      }}
                    >
                      {colors.name}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Etat */}
            <div className="bg-form border-ring relative flex h-13 items-center rounded-lg border p-2 text-lg text-[#92adc9]">
              <div className="flex cursor-pointer items-center gap-2 select-none" onClick={() => setOpenState(!openState)} ref={stateRef}>
                <p>État</p>
                <ChevronDown />
              </div>
              <div
                className={`${openState ? "" : "hidden"} bg-form border-ring absolute top-13 left-0 z-10 flex max-h-64 w-max flex-col overflow-scroll rounded-lg border text-lg text-[#92adc9]`}
                ref={stateModalRef}
              >
                {state?.map((states, index) => {
                  const isSelected = selectedState.includes(states.id)
                  return (
                    <div
                      key={index}
                      className={`hover:bg-secondary ${isSelected && "bg-secondary"} user-none w-full cursor-pointer p-2 first:rounded-t-lg last:rounded-b-lg`}
                      onClick={() => {
                        const updated = isSelected ? selectedState.filter((id) => id !== states.id) : [...selectedState, states.id]
                        setValue("state_id", updated)
                      }}
                    >
                      {states.name}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <button className="bg-primary cursor-pointer rounded-lg px-8 py-3 font-bold text-white">Appliquer</button>
        </form>

        {/* LISTE DES FILTRES */}
        <div className="flex flex-col gap-6">{isLoading && <p className="text-[#92adc9]">Chargement...</p>}</div>
        {filters?.map((filter) => {
          const currentPage = getCurrentPage(filter.id)
          const totalPages = Math.ceil(filter.products.length / ITEMS_PER_PAGE)
          const paginatedProducts = filter.products.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

          return (
            <div key={filter.id} className="bg-secondary border-ring mb-6 flex flex-col rounded-lg border p-4">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  {filter.search !== "" && <p className="text-lg text-white">{filter.search}</p>}
                  <p className="text-lg text-white">
                    prix : entre {filter.min_cost} € et {filter.max_cost} €
                  </p>
                  {filter.brand?.name && <p className="text-lg text-white">Marque : {filter.brand?.name}</p>}
                  {filter.category?.category.name && <p className="text-lg text-white">Catégorie : {filter.category?.category.name}</p>}
                </div>
                <Trash className="user-none cursor-pointer text-white" onClick={() => deleteFilterMutation.mutate(filter.id)} />
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                {paginatedProducts.map((product) => (
                  <Link to={product.url} target="_blank" key={product.id} className="border-ring relative overflow-hidden rounded-lg border">
                    <img
                      src={product.img ?? error_fallback}
                      className="h-40 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = error_fallback
                        e.currentTarget.onerror = null
                      }}
                    />
                    <div className="mx-1 my-2 flex justify-between">
                      <p className="text-white">{formatNumber(Number(product.price), 2)} €</p>
                      <p className="flex gap-1 text-white">
                        {product.likes}
                        <Heart />
                      </p>
                    </div>
                    <div className="mx-1 my-2 flex flex-col justify-between gap-1">
                      <p className="text-white">{product.size}</p>
                      <p className="text-white">{product.state}</p>
                    </div>
                    {product.status !== "ACTIVE" && (
                      <div className="absolute top-0 flex h-full w-full items-center justify-center bg-slate-900/50">
                        <h2 className="text-center text-xl font-bold text-white">
                          {product.status === "SOLD"
                            ? `Vendu en ${Math.floor((new Date(product.sell_at).getTime() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24))} jour(s)`
                            : "Supprimé"}
                        </h2>
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setPage(filter.id, currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-white transition-colors hover:text-[#92adc9] disabled:opacity-30"
                  >
                    <ChevronLeft />
                  </button>
                  <span className="text-sm text-white">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(filter.id, currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="text-white transition-colors hover:text-[#92adc9] disabled:opacity-30"
                  >
                    <ChevronRight />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Filter

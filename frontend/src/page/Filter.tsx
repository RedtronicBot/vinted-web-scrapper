import { ChevronLeft, ChevronRight, Heart, Search, Trash } from "lucide-react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../services/apiService"
import error_fallback from "../assets/image_fallback.png"
import type { FilterDTO } from "../types"
import { Link } from "react-router"
import { useState } from "react"
import { formatNumber } from "../utils/formatNumber"
import Categorie from "../components/Filter/Categorie"
import Taille from "../components/Filter/Taille"
import Prix from "../components/Filter/Prix"
import Marque from "../components/Filter/Marque"
import Couleur from "../components/Filter/Couleur"
import Etat from "../components/Filter/Etat"

const Filter = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(0)
  const queryClient = useQueryClient()

  const { data: filters, isLoading } = useQuery({
    queryKey: ["filters"],
    queryFn: apiService.getFilters,
    refetchInterval: 10 * 1000,
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
        size_id: data.size_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filters"] })
    },
  })

  const { register, handleSubmit, reset, setValue, watch } = useForm<FilterDTO>()
  const selectedBrand = watch("brand_id")
  const selectedState = (watch("state_id") as number[] | undefined) ?? []
  const selectedColors = (watch("color_id") as number[] | undefined) ?? []
  const selectedSizes = (watch("size_id") as number[] | undefined) ?? []
  const onSubmit: SubmitHandler<FilterDTO> = async (data) => {
    await createFilterMutation.mutateAsync(data)
    reset()
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

            {/* Catégorie*/}
            <Categorie setValue={setValue} setSelectedCategoryId={setSelectedCategoryId} />

            {/* Taille */}
            <Taille setValue={setValue} selectedCategoryId={selectedCategoryId} selectedSizes={selectedSizes} />

            {/* Prix */}
            <Prix register={register} />

            {/* Marque */}
            <Marque selectedBrand={selectedBrand} setValue={setValue} />

            {/* Couleur */}
            <Couleur selectedColors={selectedColors} setValue={setValue} />

            {/* Etat */}
            <Etat selectedStates={selectedState} setValue={setValue} />
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
                {paginatedProducts
                  .filter((product) => product.status !== "ARCHIVED")
                  .map((product) => (
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
                      {product.boosted && <p className="text-white">boostée</p>}
                      <div className="mx-1 my-2 flex flex-col justify-between gap-1">
                        <p className="text-white">{product.size}</p>
                        <p className="text-white">{product.state}</p>
                      </div>
                      {product.status !== "ACTIVE" && (
                        <div className="absolute top-0 flex h-full w-full items-center justify-center bg-slate-900/50">
                          <h2 className="text-center text-xl font-bold text-white">
                            {product.status === "SOLD" &&
                              `Vendu en ${Math.floor((new Date(product.sell_at).getTime() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24))} jour(s)`}
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

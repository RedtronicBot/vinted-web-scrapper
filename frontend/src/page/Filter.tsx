import { Heart, Search } from "lucide-react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../services/apiService"
import error_fallback from "../assets/image_fallback.png"
export interface QueryInterface {
	query: string
	minPrice: number
	maxPrice: number
	brand: number
	condition: number
}

export interface FilterDTO {
	id: number
	search: string
	min_cost: number
	max_cost: number
	brand_id: number
	condition_id: number
}
export interface BrandInterface {
	id: number
	name: string
}
const Filter = () => {
	const queryClient = useQueryClient()

	const { data: filters, isLoading } = useQuery({
		queryKey: ["filters"],
		queryFn: apiService.getFilters,
		refetchInterval: 60 * 1000,
	})
	const { data: condition } = useQuery({
		queryKey: ["condition"],
		queryFn: apiService.getConditions,
	})
	const { data: brand } = useQuery({
		queryKey: ["brand"],
		queryFn: apiService.getBrands,
	})
	const createFilterMutation = useMutation({
		mutationFn: (data: QueryInterface) =>
			apiService.createFilter({
				search: data.query,
				min_cost: data.minPrice,
				max_cost: data.maxPrice,
				brand_id: data.brand,
				condition_id: data.condition,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["filters"] })
		},
	})
	const createBrandMutation = useMutation({
		mutationFn: apiService.createBrand,
	})
	const { register, handleSubmit, reset } = useForm<QueryInterface>()
	const { register: registerBrand, handleSubmit: handleSubmitBrand, reset: resetBrand } = useForm<BrandInterface>()

	const onSubmit: SubmitHandler<QueryInterface> = async (data) => {
		await createFilterMutation.mutateAsync(data)
		reset()
	}
	const onSubmitBrand: SubmitHandler<BrandInterface> = async (data) => {
		await createBrandMutation.mutateAsync(data)
		resetBrand()
	}

	return (
		<div className="w-full min-h-dvh bg-background flex flex-col items-center py-10 px-6 md:px-10">
			<div className="w-full max-w-6xl">
				{/* HEADER */}
				<div className="w-full flex justify-between mb-10">
					<div className="mb-10 space-y-2">
						<h1 className="text-4xl font-black text-white tracking-tight">Filtre Vinted</h1>
						<p className="text-[#92adc9] text-lg">Recherche les dernières nouveautés</p>
					</div>
					<div className="flex flex-col bg-secondary rounded-lg border border-ring p-4">
						<p className="text-white text-lg font-bold">Ajouter une marque</p>
						<form onSubmit={handleSubmitBrand(onSubmitBrand)} className="flex items-end gap-2">
							<div className="flex flex-col gap-2">
								<label className="text-white">Id</label>
								<input
									type="number"
									{...registerBrand("id", { valueAsNumber: true })}
									className="bg-form h-13 pl-2 w-30 pr-4 py-3.5 rounded-lg border text-[#92adc9] border-ring text-lg"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-white">Nom</label>
								<input
									type="text"
									{...registerBrand("name")}
									className="bg-form h-13 pl-2 pr-4 py-3.5 rounded-lg border text-[#92adc9] border-ring text-lg"
								/>
							</div>
							<button className="text-white h-fit font-bold rounded-lg px-8 py-3 bg-primary">Ajouter</button>
						</form>
					</div>
				</div>

				{/* FORM */}
				<form onSubmit={handleSubmit(onSubmit)} className="flex justify-between items-end bg-secondary rounded-lg border border-ring p-4 mb-6">
					<div className="flex gap-4 flex-wrap">
						{/* SEARCH */}
						<div className="flex flex-col gap-2">
							<label className="text-white text-md">Produit</label>
							<div className="relative">
								<Search className="text-[#92adc9] absolute top-1/2 left-4 -translate-y-1/2" />
								<input
									type="text"
									{...register("query")}
									className="bg-form h-13 pl-12 pr-4 py-3.5 rounded-lg border text-[#92adc9] border-ring text-lg"
									placeholder="Rechercher"
								/>
							</div>
						</div>

						{/* MIN */}
						<div className="flex flex-col gap-2">
							<label className="text-white">Min</label>
							<input
								type="number"
								{...register("minPrice", { valueAsNumber: true })}
								className="bg-form h-13 px-2 border text-[#92adc9] border-ring text-lg rounded-lg w-24"
							/>
						</div>

						{/* MAX */}
						<div className="flex flex-col gap-2">
							<label className="text-white">Max</label>
							<input
								type="number"
								{...register("maxPrice", { valueAsNumber: true })}
								className="bg-form h-13 px-2 border text-[#92adc9] border-ring text-lg rounded-lg w-24"
							/>
						</div>

						{/* BRAND */}
						<div className="flex flex-col gap-2">
							<label className="text-white">Marque</label>
							<select
								{...register("brand", { valueAsNumber: true })}
								className="bg-form h-13 px-2 border text-[#92adc9] border-ring text-lg rounded-lg"
							>
								{brand?.map((brands) => (
									<option key={brands.id} value={brands.id}>
										{brands.name}
									</option>
								))}
							</select>
						</div>

						{/* CONDITION */}
						<div className="flex flex-col gap-2">
							<label className="text-white">Condition</label>
							<select
								{...register("condition", { valueAsNumber: true })}
								className="bg-form h-13 px-2 border text-[#92adc9] border-ring text-lg rounded-lg"
							>
								{condition?.map((conditions) => (
									<option key={conditions.id} value={conditions.id}>
										{conditions.name}
									</option>
								))}
							</select>
						</div>
					</div>

					<button className="text-white font-bold rounded-lg px-8 py-3 bg-primary">Appliquer</button>
				</form>

				{/* LISTE DES FILTRES */}
				<div className="flex flex-col gap-6">{isLoading && <p className="text-[#92adc9]">Chargement...</p>}</div>
				{filters?.map((filter) => (
					<div key={filter.id} className="flex flex-col bg-secondary rounded-lg border border-ring p-4 mb-6">
						<div className="flex gap-2">
							<p className="text-white text-lg">{filter.search}</p>
							<p className="text-white text-lg">
								prix : entre {filter.min_cost} € et {filter.max_cost}
							</p>
							<p className="text-white text-lg">Marque : {filter.brand.name}</p>
						</div>
						<div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
							{filter.products.map((product) => (
								<div key={product.id} className="rounded-lg border border-ring overflow-hidden">
									<img
										src={product.img ?? error_fallback}
										className="w-full h-40 object-cover"
										onError={(e) => {
											e.currentTarget.src = error_fallback
											e.currentTarget.onerror = null
										}}
									/>
									<div className="flex justify-between mx-1 my-2">
										<p className="text-white">{product.price} €</p>
										<p className="text-white flex gap-1">
											{product.likes}
											<Heart />
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default Filter

import { ArrowLeft, ChevronDown, ChevronRight, Heart, Search, Trash } from "lucide-react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../services/apiService"
import error_fallback from "../assets/image_fallback.png"
import type { Category, QueryInterface, RootNode, StackItem } from "../types"
import { Link } from "react-router"
import { useRef, useState } from "react"
import { findNode } from "../helpers/findnode"
import { useClickOutside } from "../hooks/useClickOutside"

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
				category_id: data.category,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["filters"] })
		},
	})

	const { register, handleSubmit, reset, setValue } = useForm<QueryInterface>()

	const onSubmit: SubmitHandler<QueryInterface> = async (data) => {
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
	return (
		<div className="w-full min-h-dvh bg-background flex flex-col items-center py-10 px-6 md:px-10">
			<div className="w-full max-w-8xl">
				{/* HEADER */}
				<div className="w-full flex justify-between items-center">
					<div className="mb-10 space-y-2">
						<h1 className="text-4xl font-black text-white tracking-tight">Filtre Vinted</h1>
						<p className="text-[#92adc9] text-lg">Recherche les dernières nouveautés</p>
					</div>
					<Link to={"/admin"}>
						<button className="text-white font-bold rounded-lg px-8 py-3 bg-primary cursor-pointer">Admin</button>
					</Link>
				</div>

				{/* FORM */}
				<form onSubmit={handleSubmit(onSubmit)} className="flex justify-between items-end bg-secondary rounded-lg border border-ring p-4 mb-6">
					<div className="flex gap-4 flex-wrap">
						{/* SEARCH */}
						<div className="relative flex items-center h-fit">
							<Search className="text-[#92adc9] absolute top-1/2 left-4 -translate-y-1/2" />
							<input
								type="text"
								{...register("query")}
								className="bg-form h-13 pl-12 pr-4 py-3.5 rounded-lg border text-[#92adc9] border-ring text-lg"
								placeholder="Rechercher"
							/>
						</div>

						<div className="bg-form h-13 p-2 rounded-lg border text-[#92adc9] border-ring text-lg flex items-center relative">
							<div className="flex gap-2 items-center select-none cursor-pointer" onClick={() => setOpenCategory(!openCategory)} ref={categoryRef}>
								<p>Catégorie</p>
								<ChevronDown />
							</div>
							<div
								className={`${openCategory ? "" : "hidden"} bg-form w-40 absolute z-10 top-13 left-0 rounded-lg border text-[#92adc9] border-ring text-lg flex flex-col`}
								ref={categoryModalRef}
							>
								{stack.length > 0 && (
									<div className="flex items-center justify-between gap-2">
										<button onClick={() => setStack((prev) => prev.slice(0, -1))}>
											<ArrowLeft />
										</button>
										<span className="text-gray-400 text-lg">{stack[stack.length - 1].name}</span>
										<div className="w-6"></div>
									</div>
								)}
								<div className="flex flex-col w-full">
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
													className="flex justify-between w-full cursor-pointer hover:bg-[#2D353C] items-center border-t border-t-ring first:border-t-0 first:rounded-t-lg last:rounded-b-lg"
													onClick={() => {
														if (isLeaf) {
															console.log("Produit sélectionné", cat)
															setValue("category", cat.vinted.id)
															setSelectedCategory(cat.vinted.id)
															setOpenCategory(!openCategory)
															return
														}
														if (!isLeaf) navigateTo({ id: cat.id, name: cat.name })
													}}
												>
													<span className="text-white pl-1">{cat.name}</span>
													{!isLeaf && cat.children.length > 0 ? (
														<span>
															<ChevronRight className="text-white text-lg" />
														</span>
													) : cat.vinted?.id ? (
														<div className="w-fit h-fit rounded-full p-0.5 border-2 border-gray-500 mr-1">
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
						<div className="bg-form h-13 p-2 rounded-lg border text-[#92adc9] border-ring text-lg flex items-center relative">
							<div className="flex gap-2 items-center select-none cursor-pointer" onClick={() => setOpenPrice(!openPrice)} ref={priceRef}>
								<p>Prix</p>
								<ChevronDown />
							</div>
							<div
								className={`${openPrice ? "" : "hidden"} bg-form w-fit absolute z-10 top-13 left-0 rounded-lg border text-[#92adc9] border-ring text-lg flex p-4 gap-4`}
								ref={priceModalRef}
							>
								<div className="flex flex-col gap-1">
									<label className="text-[#92adc9]">De</label>
									<div className="relative flex items-center border-b border-ring/50 focus-within:border-ring">
										<input
											type="number"
											{...register("minPrice", { valueAsNumber: true })}
											className="bg-form h-6 text-[#92adc9] text-lg w-12 outline-none pr-4"
										/>
										<span className="absolute right-0 text-[#92adc9] text-sm select-none">€</span>
									</div>
								</div>

								<div className="flex flex-col gap-1">
									<label className="text-[#92adc9]">À</label>
									<div className="relative flex items-center border-b border-ring/50 focus-within:border-ring">
										<input
											type="number"
											{...register("maxPrice", { valueAsNumber: true })}
											className="bg-form h-6 text-[#92adc9] text-lg w-12 outline-none pr-4"
										/>
										<span className="absolute right-0 text-[#92adc9] text-sm select-none">€</span>
									</div>
								</div>
							</div>
						</div>

						{/* BRAND */}
						<div className="bg-form h-13 p-2 rounded-lg border text-[#92adc9] border-ring text-lg flex items-center relative">
							<div className="flex gap-2 items-center select-none cursor-pointer" onClick={() => setOpenBrand(!openBrand)} ref={brandRef}>
								<p>Marque</p>
								<ChevronDown />
							</div>
							<div
								className={`${openBrand ? "" : "hidden"} bg-form w-max absolute z-10 top-13 left-0 rounded-lg border text-[#92adc9] border-ring text-lg flex flex-col`}
								ref={brandModalRef}
							>
								{brand?.map((brands) => (
									<div
										className="hover:bg-secondary w-full p-2 user-none cursor-pointer first:rounded-t-lg last:rounded-b-lg"
										onClick={() => {
											setValue("brand", brands.id)
											setOpenBrand(!openBrand)
											return
										}}
									>
										{brands.name}
									</div>
								))}
							</div>
						</div>

						{/* Etat */}
						<div className="bg-form h-13 p-2 rounded-lg border text-[#92adc9] border-ring text-lg flex items-center relative">
							<div className="flex gap-2 items-center select-none cursor-pointer" onClick={() => setOpenState(!openState)} ref={stateRef}>
								<p>État</p>
								<ChevronDown />
							</div>
							<div
								className={`${openState ? "" : "hidden"} bg-form w-max absolute z-10 top-13 left-0 rounded-lg border text-[#92adc9] border-ring text-lg flex flex-col`}
								ref={stateModalRef}
							>
								{condition?.map((conditions) => (
									<div
										className="hover:bg-secondary w-full p-2 user-none cursor-pointer first:rounded-t-lg last:rounded-b-lg"
										onClick={() => {
											setValue("condition", conditions.id)
											setOpenState(!openState)
											return
										}}
									>
										{conditions.name}
									</div>
								))}
							</div>
						</div>
					</div>

					<button className="text-white font-bold rounded-lg px-8 py-3 bg-primary cursor-pointer">Appliquer</button>
				</form>

				{/* LISTE DES FILTRES */}
				<div className="flex flex-col gap-6">{isLoading && <p className="text-[#92adc9]">Chargement...</p>}</div>
				{filters?.map((filter) => (
					<div key={filter.id} className="flex flex-col bg-secondary rounded-lg border border-ring p-4 mb-6">
						<div className="flex justify-between">
							<div className="flex gap-2">
								{filter.search !== "" && <p className="text-white text-lg">{filter.search}</p>}
								<p className="text-white text-lg">
									prix : entre {filter.min_cost} € et {filter.max_cost} €
								</p>
								{filter.brand?.name && <p className="text-white text-lg">Marque : {filter.brand?.name}</p>}
								{filter.category?.category.name && <p className="text-white text-lg">Catégorie : {filter.category?.category.name}</p>}
							</div>
							<Trash className="text-white user-none cursor-pointer" onClick={() => deleteFilterMutation.mutate(filter.id)} />
						</div>
						<div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
							{filter.products.map((product) => (
								<Link to={product.url} target="_blank" key={product.id} className="rounded-lg border border-ring overflow-hidden relative">
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
									{product.status !== "ACTIVE" && (
										<div className="absolute top-0 h-full w-full bg-slate-900/50 flex justify-center items-center">
											<h2 className="text-xl font-bold text-white">{product.status === "SOLD" ? "Vendu" : "Supprimé"}</h2>
										</div>
									)}
								</Link>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default Filter

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, type SubmitHandler } from "react-hook-form"
import { apiService } from "../services/apiService"
import type { Brand, Condition } from "../types"
import { useState } from "react"
interface Category {
	id: number
	name: string
	position: number
	_count: { children: number; vinted: number }
}

interface BreadcrumbItem {
	id: number
	name: string
}

interface AddCategoryForm {
	name: string
}

interface AddVintedForm {
	vinted_id: number
}

const Admin = () => {
	const queryClient = useQueryClient()
	const createBrandMutation = useMutation({
		mutationFn: apiService.createBrand,
	})
	const { register: registerBrand, handleSubmit: handleSubmitBrand, reset: resetBrand } = useForm<Brand>()
	const onSubmitBrand: SubmitHandler<Brand> = async (data) => {
		await createBrandMutation.mutateAsync(data)
		resetBrand()
	}
	const createConditionMutation = useMutation({
		mutationFn: apiService.createCondition,
	})
	const { register: registerCondition, handleSubmit: handleSubmitCondition, reset: resetCondition } = useForm<Condition>()
	const onSubmitCondition: SubmitHandler<Condition> = async (data) => {
		await createConditionMutation.mutateAsync(data)
		resetCondition()
	}
	const [stack, setStack] = useState<BreadcrumbItem[]>([])
	console.log("🚀 ~ Admin ~ stack:", stack)
	const currentId = stack.length > 0 ? stack[stack.length - 1].id : null

	const [showAddCategory, setShowAddCategory] = useState(false)
	const [showAddVinted, setShowAddVinted] = useState(false)

	// Récupère les enfants du nœud courant
	const { data: categories, isLoading } = useQuery<Category[]>({
		queryKey: ["categories", currentId],
		queryFn: () => apiService.getCategories(currentId),
	})
	console.log("🚀 ~ Admin ~ categories:", categories)

	const { register: regCat, handleSubmit: handleCat, reset: resetCat } = useForm<AddCategoryForm>()
	const { register: regVinted, handleSubmit: handleVinted, reset: resetVinted } = useForm<AddVintedForm>()

	const createCategoryMutation = useMutation({
		mutationFn: (data: AddCategoryForm) =>
			apiService.createCategory({
				name: data.name,
				parent_id: currentId,
				position: categories?.length ?? 0,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories", currentId] })
			setShowAddCategory(false)
			resetCat()
		},
	})

	const createVintedMutation = useMutation({
		mutationFn: (data: AddVintedForm) =>
			apiService.createVintedCategory({
				id: Number(data.vinted_id),
				category_id: currentId!,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories", currentId] })
			setShowAddVinted(false)
			resetVinted()
		},
	})
	const onSubmitCategory: SubmitHandler<AddCategoryForm> = async (data) => {
		await createCategoryMutation.mutateAsync(data)
	}

	const onSubmitVinted: SubmitHandler<AddVintedForm> = async (data) => {
		await createVintedMutation.mutateAsync(data)
	}

	const navigateTo = (item: BreadcrumbItem) => {
		setStack((prev) => [...prev, item])
		setShowAddCategory(false)
		setShowAddVinted(false)
	}

	const navigateToBreadcrumb = (index: number) => {
		setStack((prev) => prev.slice(0, index))
		setShowAddCategory(false)
		setShowAddVinted(false)
	}
	return (
		<div className="w-full min-h-dvh bg-background flex flex-col items-center py-10 px-6 md:px-10">
			<h1 className="text-4xl font-black text-white tracking-tight mb-10">Admin</h1>
			<div className="flex flex-col gap-4">
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
				<div className="flex flex-col bg-secondary rounded-lg border border-ring p-4">
					<p className="text-white text-lg font-bold">Ajouter un état</p>
					<form onSubmit={handleSubmitCondition(onSubmitCondition)} className="flex items-end gap-2">
						<div className="flex flex-col gap-2">
							<label className="text-white">Id</label>
							<input
								type="number"
								{...registerCondition("id", { valueAsNumber: true })}
								className="bg-form h-13 pl-2 w-30 pr-4 py-3.5 rounded-lg border text-[#92adc9] border-ring text-lg"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<label className="text-white">Nom</label>
							<input
								type="text"
								{...registerCondition("name")}
								className="bg-form h-13 pl-2 pr-4 py-3.5 rounded-lg border text-[#92adc9] border-ring text-lg"
							/>
						</div>
						<button className="text-white h-fit font-bold rounded-lg px-8 py-3 bg-primary">Ajouter</button>
					</form>
				</div>
				<div className="flex flex-col gap-2 bg-secondary rounded-lg border border-ring p-4">
					<p className="text-white text-lg font-bold">Ajouter une catégorie</p>

					{/* BREADCRUMB */}
					<div className="flex items-center gap-2 flex-wrap">
						<button onClick={() => navigateToBreadcrumb(0)} className="text-[#92adc9] hover:text-white transition-colors text-sm">
							Racine
						</button>
						{stack.map((item, i) => (
							<span key={item.id} className="flex items-center gap-2">
								<span className="text-[#92adc9]">/</span>
								<button
									onClick={() => navigateToBreadcrumb(i + 1)}
									className={`text-sm transition-colors ${i === stack.length - 1 ? "text-white font-semibold" : "text-[#92adc9] hover:text-white"}`}
								>
									{item.name}
								</button>
							</span>
						))}
					</div>

					{/* LISTE DES ENFANTS */}
					<div className="space-y-2">
						{isLoading ? (
							<p className="text-[#92adc9]">Chargement...</p>
						) : categories?.length === 0 ? (
							<p className="text-[#92adc9] text-sm">Aucune sous-catégorie.</p>
						) : (
							categories?.map((cat) => (
								<button
									key={cat.id}
									onClick={() => navigateTo({ id: cat.id, name: cat.name })}
									className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-5 py-4 transition-colors group"
								>
									<div className="flex items-center gap-3">
										<span className="text-white font-semibold">{cat.name}</span>
										{cat._count.vinted > 0 && (
											<span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{cat._count.vinted} Vinted ID</span>
										)}
									</div>
									<div className="flex items-center gap-3">
										{cat._count.children > 0 && (
											<span className="text-xs text-[#92adc9]">
												{cat._count.children} sous-catégorie{cat._count.children > 1 ? "s" : ""}
											</span>
										)}
										<span className="text-[#92adc9] group-hover:text-white transition-colors">›</span>
									</div>
								</button>
							))
						)}
					</div>

					{/* ACTIONS */}
					{/* Ajouter une catégorie — toujours disponible */}
					<div className="space-y-3">
						{!showAddCategory ? (
							<button
								onClick={() => {
									setShowAddCategory(true)
									setShowAddVinted(false)
								}}
								className="text-white font-bold rounded-lg px-6 py-3 bg-primary cursor-pointer"
							>
								+ Ajouter une catégorie
							</button>
						) : (
							<form onSubmit={handleCat(onSubmitCategory)} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4">
								<input
									{...regCat("name", { required: true })}
									placeholder="Nom de la catégorie"
									className="flex-1 bg-transparent text-white placeholder-[#92adc9] outline-none text-sm"
									autoFocus
								/>
								<button
									type="submit"
									disabled={createCategoryMutation.isPending}
									className="text-white font-bold rounded-lg px-5 py-2 bg-primary cursor-pointer disabled:opacity-50 text-sm"
								>
									{createCategoryMutation.isPending ? "..." : "Ajouter"}
								</button>
								<button
									type="button"
									onClick={() => {
										setShowAddCategory(false)
										resetCat()
									}}
									className="text-[#92adc9] hover:text-white text-sm transition-colors"
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
										className="text-white font-bold rounded-lg px-6 py-3 bg-white/10 border border-white/10 cursor-pointer hover:bg-white/20 transition-colors"
									>
										+ Ajouter un type de produit Vinted
									</button>
								) : (
									<form
										onSubmit={handleVinted(onSubmitVinted)}
										className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4"
									>
										<input
											{...regVinted("vinted_id", { required: true, min: 1 })}
											type="number"
											placeholder="ID Vinted (ex: 1842)"
											className="flex-1 bg-transparent text-white placeholder-[#92adc9] outline-none text-sm"
											autoFocus
										/>
										<button
											type="submit"
											disabled={createVintedMutation.isPending}
											className="text-white font-bold rounded-lg px-5 py-2 bg-primary cursor-pointer disabled:opacity-50 text-sm"
										>
											{createVintedMutation.isPending ? "..." : "Lier"}
										</button>
										<button
											type="button"
											onClick={() => {
												setShowAddVinted(false)
												resetVinted()
											}}
											className="text-[#92adc9] hover:text-white text-sm transition-colors"
										>
											Annuler
										</button>
									</form>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default Admin

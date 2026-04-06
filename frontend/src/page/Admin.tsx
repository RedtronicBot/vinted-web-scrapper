import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm, type SubmitHandler } from "react-hook-form"
import { apiService } from "../services/apiService"
import type { Brand, Condition } from "../types"

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
	const { data: status } = useQuery({
		queryKey: ["check-status"],
		queryFn: apiService.getCheckStatus,
		refetchInterval: (query) => (query.state.data?.isRunning ? 5000 : false),
	})
	const { mutate: triggerCheck, isPending } = useMutation({
		mutationFn: apiService.triggerCheck,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["check-status"] })
		},
	})
	console.log(status)
	return (
		<div className="w-full min-h-dvh bg-background flex flex-col items-center py-10 px-6 md:px-10">
			<h1 className="text-4xl font-black text-white tracking-tight mb-10">Admin</h1>
			<div className="flex flex-col gap-4">
				<div className="flex gap-2">
					<button
						onClick={() => triggerCheck()}
						className="text-white font-bold rounded-lg px-8 py-3 bg-primary cursor-pointer"
						disabled={isPending || status?.isRunning}
					>
						{status?.isRunning ? "Check en cours..." : "Lancer le check"}
					</button>
					{status?.lastRun && <p className="text-white">Dernier check : {new Date(status.lastRun.finishedAt).toLocaleString()}</p>}
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
			</div>
		</div>
	)
}

export default Admin

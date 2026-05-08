import { useForm, type SubmitHandler } from "react-hook-form"
import type { Brand } from "../../types"
import { useMutation } from "@tanstack/react-query"
import { apiService } from "../../services/apiService"

const AddBrand = () => {
  const { register: registerBrand, handleSubmit: handleSubmitBrand, reset: resetBrand } = useForm<Brand>()

  const createBrandMutation = useMutation({
    mutationFn: apiService.createBrand,
  })
  const onSubmitBrand: SubmitHandler<Brand> = async (data) => {
    await createBrandMutation.mutateAsync(data)
    resetBrand()
  }
  return (
    <div className="bg-secondary border-ring flex flex-col rounded-lg border p-4">
      <p className="text-lg font-bold text-white">Ajouter une marque</p>
      <form onSubmit={handleSubmitBrand(onSubmitBrand)} className="flex items-end gap-2">
        <div className="flex flex-col gap-2">
          <label className="text-white">Id</label>
          <input
            type="number"
            {...registerBrand("id", { valueAsNumber: true })}
            className="bg-form border-ring h-13 w-30 rounded-lg border py-3.5 pr-4 pl-2 text-lg text-[#92adc9]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-white">Nom</label>
          <input
            type="text"
            {...registerBrand("name")}
            className="bg-form border-ring h-13 rounded-lg border py-3.5 pr-4 pl-2 text-lg text-[#92adc9]"
          />
        </div>
        <button className="bg-primary h-fit rounded-lg px-8 py-3 font-bold text-white">Ajouter</button>
      </form>
    </div>
  )
}

export default AddBrand

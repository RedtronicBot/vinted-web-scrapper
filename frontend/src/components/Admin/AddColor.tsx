import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { apiService } from "../../services/apiService"
import type { Color } from "../../types"

const AddColor = () => {
  const { register: registerColor, handleSubmit: handleColor, reset: resetColor } = useForm<Color>()

  const createColorMutation = useMutation({
    mutationFn: (data: Color) => apiService.createColor(data),
    onSuccess: () => {
      resetColor()
    },
  })

  const onSubmitColor = (values: Color): void => {
    createColorMutation.mutate({
      id: Number(values.id),
      name: values.name,
    })
  }
  return (
    <div className="bg-secondary border-ring flex flex-col rounded-lg border p-4">
      <p className="text-lg font-bold text-white">Ajouter une couleur</p>
      <form onSubmit={handleColor(onSubmitColor)} className="flex items-end gap-2">
        <div className="flex flex-col gap-2">
          <label className="text-white">Id</label>
          <input
            type="number"
            {...registerColor("id", { valueAsNumber: true })}
            className="bg-form border-ring h-13 w-30 rounded-lg border py-3.5 pr-4 pl-2 text-lg text-[#92adc9]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-white">Nom</label>
          <input
            type="text"
            {...registerColor("name")}
            className="bg-form border-ring h-13 rounded-lg border py-3.5 pr-4 pl-2 text-lg text-[#92adc9]"
          />
        </div>
        <button className="bg-primary h-fit rounded-lg px-8 py-3 font-bold text-white">Ajouter</button>
      </form>
    </div>
  )
}

export default AddColor

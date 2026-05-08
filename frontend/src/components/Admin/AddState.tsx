import { useForm, type SubmitHandler } from "react-hook-form"
import type { State } from "../../types"
import { useMutation } from "@tanstack/react-query"
import { apiService } from "../../services/apiService"

const AddState = () => {
  const { register: registerState, handleSubmit: handleSubmitState, reset: resetState } = useForm<State>()

  const createStateMutation = useMutation({
    mutationFn: apiService.createState,
  })

  const onSubmitState: SubmitHandler<State> = async (data) => {
    await createStateMutation.mutateAsync(data)
    resetState()
  }
  return (
    <div className="bg-secondary border-ring flex flex-col rounded-lg border p-4">
      <p className="text-lg font-bold text-white">Ajouter un état</p>
      <form onSubmit={handleSubmitState(onSubmitState)} className="flex items-end gap-2">
        <div className="flex flex-col gap-2">
          <label className="text-white">Id</label>
          <input
            type="number"
            {...registerState("id", { valueAsNumber: true })}
            className="bg-form border-ring h-13 w-30 rounded-lg border py-3.5 pr-4 pl-2 text-lg text-[#92adc9]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-white">Nom</label>
          <input
            type="text"
            {...registerState("name")}
            className="bg-form border-ring h-13 rounded-lg border py-3.5 pr-4 pl-2 text-lg text-[#92adc9]"
          />
        </div>
        <button className="bg-primary h-fit rounded-lg px-8 py-3 font-bold text-white">Ajouter</button>
      </form>
    </div>
  )
}

export default AddState

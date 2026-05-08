import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../services/apiService"
import AddBrand from "../components/Admin/AddBrand"
import AddState from "../components/Admin/AddState"
import AddColor from "../components/Admin/AddColor"
import AddCategory from "../components/Admin/AddCategory"
import AddSize from "../components/Admin/AddSize"

const Admin = () => {
  const queryClient = useQueryClient()

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

  return (
    <div className="bg-background flex min-h-dvh w-full flex-col items-center px-6 py-10 md:px-10">
      <h1 className="mb-10 text-4xl font-black tracking-tight text-white">Admin</h1>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => triggerCheck()}
            className="bg-primary cursor-pointer rounded-lg px-8 py-3 font-bold text-white"
            disabled={isPending || status?.isRunning}
          >
            {status?.isRunning ? "Check en cours..." : "Lancer le check"}
          </button>
          {status?.lastRun && <p className="text-white">Dernier check : {new Date(status.lastRun.finishedAt).toLocaleString()}</p>}
        </div>
        <AddBrand />
        <AddState />
        <AddColor />
        <AddCategory />
        <AddSize />
      </div>
    </div>
  )
}

export default Admin

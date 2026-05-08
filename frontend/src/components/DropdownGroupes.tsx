import { useQuery } from "@tanstack/react-query"
import { apiService } from "../services/apiService"
import { ChevronRight } from "lucide-react"
import type { Category } from "../types"

const DropdownGroupes = ({ onSelect }: { onSelect: (id: number) => void }) => {
  const { data: tree } = useQuery<Category[]>({
    queryKey: ["categories-tree"],
    queryFn: apiService.getFullTree,
    staleTime: Infinity,
  })
  const roots = tree ?? []
  return (
    <>
      {roots?.map((cat) => (
        <div
          key={cat.id}
          className="border-t-ring flex w-full cursor-pointer items-center justify-between border-t first:border-t-0 hover:bg-[#2D353C]"
          onClick={() => onSelect(cat.id)}
        >
          <span className="pl-1 text-white">{cat.name}</span>
          <ChevronRight className="text-white" />
        </div>
      ))}
    </>
  )
}
export default DropdownGroupes

import { ArrowLeft } from "lucide-react"
import type { Size } from "../types"

const DropdownTailles = ({
  sizes,
  selectedSizes,
  onToggle,
  onBack,
}: {
  sizes: Size[]
  selectedSizes: number[]
  onToggle: (id: number) => void
  onBack?: () => void
}) => {
  return (
    <>
      {onBack && (
        <div className="flex items-center gap-2 p-1">
          <button type="button" onClick={onBack}>
            <ArrowLeft className="text-white" />
          </button>
        </div>
      )}
      {sizes?.map((size) => {
        const isSelected = selectedSizes.includes(size.id)
        return (
          <div
            key={size.id}
            className={`hover:bg-secondary ${isSelected && "bg-secondary"} w-full cursor-pointer p-2 first:rounded-t-lg last:rounded-b-lg`}
            onClick={() => onToggle(size.id)}
          >
            {size.name}
          </div>
        )
      })}
    </>
  )
}

export default DropdownTailles

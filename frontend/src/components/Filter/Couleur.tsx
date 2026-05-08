import { useQuery } from "@tanstack/react-query"
import { ChevronDown } from "lucide-react"
import { apiService } from "../../services/apiService"
import { useRef, useState } from "react"
import { useClickOutside } from "../../hooks/useClickOutside"
import type { UseFormSetValue } from "react-hook-form"
import type { FilterDTO } from "../../types"

interface CouleurProps {
  setValue: UseFormSetValue<FilterDTO>
  selectedColors: number[]
}
const Couleur = ({ selectedColors, setValue }: CouleurProps) => {
  const colorRef = useRef(null)
  const colorModalRef = useRef(null)
  const [openColor, setOpenColor] = useState(false)
  useClickOutside(colorModalRef, () => setOpenColor(false), colorRef)
  const { data: color } = useQuery({
    queryKey: ["color"],
    queryFn: apiService.getColors,
  })
  return (
    <div className="bg-form border-ring relative flex h-13 items-center rounded-lg border p-2 text-lg text-[#92adc9]">
      <div className="flex cursor-pointer items-center gap-2 select-none" onClick={() => setOpenColor(!openColor)} ref={colorRef}>
        <p>Couleur</p>
        <ChevronDown />
      </div>
      <div
        className={`${openColor ? "" : "hidden"} bg-form border-ring absolute top-13 left-0 z-10 flex max-h-64 w-max flex-col overflow-scroll rounded-lg border text-lg text-[#92adc9]`}
        ref={colorModalRef}
      >
        {color?.map((colors, index) => {
          const isSelected = selectedColors.includes(colors.id)
          return (
            <div
              key={index}
              className={`hover:bg-secondary ${isSelected && "bg-secondary"} user-none w-full cursor-pointer p-2 first:rounded-t-lg last:rounded-b-lg`}
              onClick={() => {
                const updated = isSelected ? selectedColors.filter((id) => id !== colors.id) : [...selectedColors, colors.id]
                setValue("color_id", updated)
              }}
            >
              {colors.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Couleur

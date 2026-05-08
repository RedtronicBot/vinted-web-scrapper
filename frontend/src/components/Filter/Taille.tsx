import { ChevronDown } from "lucide-react"
import DropdownGroupes from "../DropdownGroupes"
import DropdownTailles from "../DropdownTailles"
import { useQuery } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { useClickOutside } from "../../hooks/useClickOutside"
import { apiService } from "../../services/apiService"
import type { UseFormSetValue } from "react-hook-form"
import type { FilterDTO } from "../../types"

type TailleProps = {
  setValue: UseFormSetValue<FilterDTO>
  selectedCategoryId: number
  selectedSizes: number[]
}
const Taille = ({ setValue, selectedCategoryId, selectedSizes }: TailleProps) => {
  const [selectedSizeGroup, setSelectedSizeGroup] = useState(0)
  const sizeRef = useRef(null)
  const sizeModalRef = useRef(null)
  const [openSize, setOpenSize] = useState(false)
  useClickOutside(sizeModalRef, () => setOpenSize(false), sizeRef)
  const { data: sizes } = useQuery({
    queryKey: ["sizes", selectedCategoryId, selectedSizeGroup],
    queryFn: () =>
      selectedCategoryId !== 0
        ? apiService.getCategorySizes(selectedCategoryId) // catégorie précise
        : apiService.getCategorySizes(selectedSizeGroup), // fallback par groupe
    enabled: selectedCategoryId !== 0 || selectedSizeGroup !== 0,
  })
  return (
    <div className="bg-form border-ring relative flex h-13 items-center rounded-lg border p-2 text-lg text-[#92adc9]">
      <div className="flex cursor-pointer items-center gap-2 select-none" onClick={() => setOpenSize(!openSize)} ref={sizeRef}>
        <p>Taille</p>
        <ChevronDown />
      </div>
      <div
        className={`${openSize ? "" : "hidden"} bg-form border-ring absolute top-13 left-0 z-10 flex w-max flex-col rounded-lg border text-lg text-[#92adc9]`}
        ref={sizeModalRef}
      >
        {selectedCategoryId !== 0 ? (
          // Catégorie choisie → tailles directes, pas de retour
          <DropdownTailles
            sizes={sizes ?? []}
            selectedSizes={selectedSizes}
            onToggle={(id) => {
              const updated = selectedSizes.includes(id) ? selectedSizes.filter((s) => s !== id) : [...selectedSizes, id]
              setValue("size_id", updated)
            }}
          />
        ) : selectedSizeGroup === 0 ? (
          // Pas de catégorie, pas de groupe → choix du groupe
          <DropdownGroupes onSelect={(id) => setSelectedSizeGroup(id)} />
        ) : (
          // Groupe choisi → tailles avec bouton retour
          <DropdownTailles
            sizes={sizes ?? []}
            selectedSizes={selectedSizes}
            onToggle={(id) => {
              const updated = selectedSizes.includes(id) ? selectedSizes.filter((s) => s !== id) : [...selectedSizes, id]
              setValue("size_id", updated)
            }}
            onBack={() => setSelectedSizeGroup(0)}
          />
        )}
      </div>
    </div>
  )
}

export default Taille

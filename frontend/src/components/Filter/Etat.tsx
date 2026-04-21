import { ChevronDown } from "lucide-react"
import type { UseFormSetValue } from "react-hook-form"
import type { FilterDTO } from "../../types"
import { useQuery } from "@tanstack/react-query"
import { apiService } from "../../services/apiService"
import { useRef, useState } from "react"
import { useClickOutside } from "../../hooks/useClickOutside"

interface EtatProps {
  setValue: UseFormSetValue<FilterDTO>
  selectedStates: number[]
}
const Etat = ({ setValue, selectedStates }: EtatProps) => {
  const stateRef = useRef(null)
  const stateModalRef = useRef(null)
  const [openState, setOpenState] = useState(false)
  useClickOutside(stateModalRef, () => setOpenState(false), stateRef)
  const { data: state } = useQuery({
    queryKey: ["state"],
    queryFn: apiService.getStates,
  })
  return (
    <div className="bg-form border-ring relative flex h-13 items-center rounded-lg border p-2 text-lg text-[#92adc9]">
      <div className="flex cursor-pointer items-center gap-2 select-none" onClick={() => setOpenState(!openState)} ref={stateRef}>
        <p>État</p>
        <ChevronDown />
      </div>
      <div
        className={`${openState ? "" : "hidden"} bg-form border-ring absolute top-13 left-0 z-10 flex max-h-64 w-max flex-col overflow-scroll rounded-lg border text-lg text-[#92adc9]`}
        ref={stateModalRef}
      >
        {state?.map((states, index) => {
          const isSelected = selectedStates.includes(states.id)
          return (
            <div
              key={index}
              className={`hover:bg-secondary ${isSelected && "bg-secondary"} user-none w-full cursor-pointer p-2 first:rounded-t-lg last:rounded-b-lg`}
              onClick={() => {
                const updated = isSelected ? selectedStates.filter((id) => id !== states.id) : [...selectedStates, states.id]
                setValue("state_id", updated)
              }}
            >
              {states.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Etat

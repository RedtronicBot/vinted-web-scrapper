import { ChevronDown } from "lucide-react"
import { useRef, useState } from "react"
import { useClickOutside } from "../../hooks/useClickOutside"
import type { FilterDTO } from "../../types"
import type { UseFormRegister } from "react-hook-form"

type PrixProps = {
  register: UseFormRegister<FilterDTO>
}
const Prix = ({ register }: PrixProps) => {
  const priceRef = useRef(null)
  const priceModalRef = useRef(null)
  const [openPrice, setOpenPrice] = useState(false)
  useClickOutside(priceModalRef, () => setOpenPrice(false), priceRef)
  return (
    <div className="bg-form border-ring relative flex h-13 items-center rounded-lg border p-2 text-lg text-[#92adc9]">
      <div className="flex cursor-pointer items-center gap-2 select-none" onClick={() => setOpenPrice(!openPrice)} ref={priceRef}>
        <p>Prix</p>
        <ChevronDown />
      </div>
      <div
        className={`${openPrice ? "" : "hidden"} bg-form border-ring absolute top-13 left-0 z-10 flex w-fit gap-4 rounded-lg border p-4 text-lg text-[#92adc9]`}
        ref={priceModalRef}
      >
        <div className="flex flex-col gap-1">
          <label className="text-[#92adc9]">De</label>
          <div className="border-ring/50 focus-within:border-ring relative flex items-center border-b">
            <input
              type="number"
              {...register("min_cost", { valueAsNumber: true })}
              className="bg-form h-6 w-12 pr-4 text-lg text-[#92adc9] outline-none"
            />
            <span className="absolute right-0 text-sm text-[#92adc9] select-none">€</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[#92adc9]">À</label>
          <div className="border-ring/50 focus-within:border-ring relative flex items-center border-b">
            <input
              type="number"
              {...register("max_cost", { valueAsNumber: true })}
              className="bg-form h-6 w-12 pr-4 text-lg text-[#92adc9] outline-none"
            />
            <span className="absolute right-0 text-sm text-[#92adc9] select-none">€</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Prix

import { ChevronDown } from "lucide-react"
import type { FilterDTO } from "../../types"
import type { UseFormSetValue } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { apiService } from "../../services/apiService"
import { useRef, useState } from "react"
import { useClickOutside } from "../../hooks/useClickOutside"

type MarqueProps = {
  setValue: UseFormSetValue<FilterDTO>
  selectedBrand: number
}
const Marque = ({ setValue, selectedBrand }: MarqueProps) => {
  const brandRef = useRef(null)
  const brandModalRef = useRef(null)
  const [openBrand, setOpenBrand] = useState(false)
  useClickOutside(brandModalRef, () => setOpenBrand(false), brandRef)
  const { data: brand } = useQuery({
    queryKey: ["brand"],
    queryFn: apiService.getBrands,
  })
  return (
    <div className="bg-form border-ring relative flex h-13 items-center rounded-lg border p-2 text-lg text-[#92adc9]">
      <div className="flex cursor-pointer items-center gap-2 select-none" onClick={() => setOpenBrand(!openBrand)} ref={brandRef}>
        <p>Marque</p>
        <ChevronDown />
      </div>
      <div
        className={`${openBrand ? "" : "hidden"} bg-form border-ring absolute top-13 left-0 z-10 flex max-h-64 w-max flex-col overflow-scroll rounded-lg border text-lg text-[#92adc9]`}
        ref={brandModalRef}
      >
        {brand?.map((brands, index) => (
          <div
            key={index}
            className={`hover:bg-secondary ${selectedBrand === brands.id && "bg-secondary"} user-none w-full cursor-pointer p-2 first:rounded-t-lg last:rounded-b-lg`}
            onClick={() => {
              setValue("brand_id", brands.id)
              setOpenBrand(!openBrand)
              return
            }}
          >
            {brands.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Marque

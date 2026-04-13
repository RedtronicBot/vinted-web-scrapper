export const formatNumber = (number: number, decimals: number) => {
  if (Number.isInteger(number)) {
    return number.toString()
  } else {
    return number.toFixed(decimals)
  }
}

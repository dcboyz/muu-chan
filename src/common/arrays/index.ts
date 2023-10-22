export function chooseRandom<T>(array: T[]) {
  const floatIndex = Math.random() * array.length

  const flooredIndex = Math.floor(floatIndex)

  return array[flooredIndex]
}

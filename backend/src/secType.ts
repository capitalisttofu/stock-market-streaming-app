export enum SecType {
  "E" = "E",
  "I" = "I",
}

export const validateSecType = (value: string) => {
  if (value in SecType) {
    return SecType[value as keyof typeof SecType]
  }
  return undefined
}

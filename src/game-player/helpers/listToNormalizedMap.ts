export const listToNormalizedMap = <Type extends Record<string, any>>(
  list: Type[],
  propertyName: string
): { [key: string]: Type } => {
  return list.reduce((normalizedMap: { [key: string]: Type }, item: Type) => {
    const key = item[propertyName]

    if (typeof key === 'string') {
      normalizedMap[key] = item
      return normalizedMap
    } else {
      throw new Error(
        `listToNormalizedMap: propertyName ${propertyName} is not a valid normalization key`
      )
    }
  }, {})
}

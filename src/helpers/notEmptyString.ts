export const notEmptyString = (candidate: unknown): candidate is string => {
  return typeof candidate === 'string' && candidate.length > 0
}
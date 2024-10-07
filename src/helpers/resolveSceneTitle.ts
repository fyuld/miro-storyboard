import { notEmptyString } from "./notEmptyString"

export const resolveSceneTitle = (frameTitle: string): string => {
  const sceneTitle = frameTitle.split('_').pop()?.trim()

  if (notEmptyString(sceneTitle)) {
    return sceneTitle
  } else {
    throw new Error(`resolveSceneTitle: Unable to resolve scene title from frame title: ${frameTitle}`)
  }
}
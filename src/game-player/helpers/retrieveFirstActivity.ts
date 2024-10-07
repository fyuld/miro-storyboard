import { Dialogue, Scene } from "../../datamodel"


export const retrieveFirstActivity = (scene: Scene): Dialogue => {
  const firstDialogue = scene.dialogues.find((dialogue) => dialogue.isFirstDialogue === true)

  if (firstDialogue !== undefined) {
    return firstDialogue
  } else {
    throw new Error(
      `retrieveFirstDialogue: Unable to find the first dialogue in Scene ${scene.title} ${scene.identifier}`
    )
  }
}

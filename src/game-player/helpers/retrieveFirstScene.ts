import { Game, Scene } from "../../datamodel"

export const retrieveFirstScene = (game: Game): Scene => {
  const firstScene: Scene | undefined = game.scenes.find((scene: Scene) => scene.isFirstScene)

  if (firstScene === undefined) {
    throw new Error(
      `retrieveFirstScene: Unable to find first scene in Game`
    )
  }

  return firstScene
}

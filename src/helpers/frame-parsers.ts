import { Connector, ContainableItem, Frame, Shape } from "@mirohq/websdk-types"
import { Character, DialogueConnection, Identifier, MultipleChoiceDialogue, RelevantChild, Scene, SimpleDialogue } from "../datamodel"
import { connectorsToConnections, shapeIsChoice, shapeIsMultipleChoiceDialogue, shapeRepresentsCharacter, shapeRepresentsSimpleDialogue, shapeToCharacter, shapeToChoice, shapeToMultipleChoiceDialogue, shapeToSimpleDialogue } from "./shape-parsers"


const resolveSceneTitle = (sceneFrame: Frame): string => {
  try {
    const dirtyTitle = sceneFrame.title.split('__').pop() as string
    const title = dirtyTitle.trim()
    return title
  } catch (error) {
    console.error(error)
    throw new Error(`parseFrameToScene: Unable to parse title for sceneFrame:\n${JSON.stringify(sceneFrame)}`)
  }
}

const resolveIfFirstScene = (sceneFrame: Frame): boolean => {
  console.log('resolveIfFirstScene:', sceneFrame.title.indexOf('[FirstScene]'))

  return  sceneFrame.title.indexOf('[FirstScene]') > 0
}

export const parseFrameToScene = (sceneFrame: Frame, characters: Character[], children: RelevantChild[], connections: DialogueConnection[]): Scene => {
  const title = resolveSceneTitle(sceneFrame)
  const identifier: Identifier = title.split(' ').join('-').toLowerCase()
  const isFirstScene = resolveIfFirstScene(sceneFrame)

  const frameChildren = children.filter((child) => child.parentId === sceneFrame.id)
  const shapes = frameChildren
    .filter((child: RelevantChild): child is Shape => child.type === 'shape')

  const simpleDialogues: SimpleDialogue[] = shapes
    .filter(shapeRepresentsSimpleDialogue)
    .map((shape: Shape) => shapeToSimpleDialogue(shape, characters, connections))

  const choices: any[] = shapes
    .filter(shapeIsChoice)
    .map((shape: Shape) => shapeToChoice(shape, connections))

  const multipleChoiceDialogues: MultipleChoiceDialogue[] = shapes
    .filter(shapeIsMultipleChoiceDialogue)
    .map((shape: Shape) => shapeToMultipleChoiceDialogue(shape, characters, connections, choices))

  const dialogues = [
    ...simpleDialogues,
    ...multipleChoiceDialogues
  ]

  return {
    identifier,
    title,
    dialogues,
    isFirstScene,
  }
}

export const parseFramesToScenes = (frames: Frame[], characters: Character[], children: RelevantChild[]): Scene[] => {
  const sceneFrames: Frame[] = frames.filter((frame: Frame) => {
      return frame.title.indexOf('[Scene-Ready]') === 0
    })

  const connections = children
    .filter((child): child is Connector => child.type === 'connector')
    .map((connector) => connectorsToConnections(connector, children))

  const scenes: Scene[] = sceneFrames.map((sceneFrame: Frame) => parseFrameToScene(sceneFrame, characters, children, connections))

  return scenes
}

export const parseFrameToCharacters = (frames: Frame[], children: RelevantChild[]): Character[] => {
  const characterFrame = frames.find((frame: Frame) => {
    return frame.title === '[Characters-Ready]'
  })

  if (characterFrame === undefined) {
    throw new Error(`parseFrameToCharacters: Unable to locate Character Frame, make sure you have ready character frame ready.`)
  }

  const characterShapes = children
    .filter((child: ContainableItem): child is Shape => child.type === 'shape')
    .filter((shape: Shape) => shape.parentId === characterFrame.id)
    .filter(shapeRepresentsCharacter)

  const characters: Character[] = characterShapes
    .map(shapeToCharacter)

  return characters
}
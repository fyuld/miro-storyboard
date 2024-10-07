import { NextDialogueConnection } from "./parser"

export type Identifier = string

export type Game = {
  // info: {
  //   title: string
  //   description: string
  // }
  scenes: Scene[]
  characters: Character[]
}

export type Identifiable = {
  identifier: Identifier
}

export type Scene = Identifiable& {
  isFirstScene: boolean
  title: string
  dialogues: Dialogue[]
}

export enum CharacterKind {
  PlayerCharacter = 'PlayerCharacter',
  NonPlayerCharacter = 'NonPlayerCharacter',
  Narrator = 'Narrator'
}

export type Character = Identifiable & {
  kind: CharacterKind
  firstName: string
  lastName: string

}
export enum DialogueKind {
  SimpleDialogue = 'SimpleDialogue',
  MultipleChoiceDialogue = 'MultipleChoiceDialogue',
}

export type DialogueBase = Identifiable & {
  kind: DialogueKind
  character: Character
  isFirstDialogue: boolean
  isLastDialogue: boolean
}

export type SimpleDialogue = DialogueBase & {
  kind: DialogueKind.SimpleDialogue
  next: NextDialogueConnection
  content: string
}

export type DialogueChoice = Identifiable & {
  content: string
  next: NextDialogueConnection
}

export type MultipleChoiceDialogue = DialogueBase & {
  kind: DialogueKind.MultipleChoiceDialogue
  choices: DialogueChoice[]
  content: string
}

export type Dialogue = SimpleDialogue | MultipleChoiceDialogue
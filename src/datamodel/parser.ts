import { Connector, Shape } from "@mirohq/websdk-types"
import { Identifier } from "./game"

export type NextDialogueConnection = {
  kind: DialogueConnectionKind.NextDialogueConnection
  next: Identifier,
  previous: Identifier
}

export type RequirementConnection = {
  kind: DialogueConnectionKind.RequirementConnection
  dialogue: Identifier
}

export type EffectConnection = {
  kind: DialogueConnectionKind.EffectConnection
  dialogue: Identifier
}

export type ChoiceConnection = {
  kind: DialogueConnectionKind.ChoiceConnection
  dialogue: Identifier
  choice: Identifier
}

export enum DialogueConnectionKind {
  NextDialogueConnection = 'NextDialogueConnection',
  ChoiceConnection = 'ChoiceConnection',
  RequirementConnection = 'RequirementConnection',
  EffectConnection = 'EffectConnection'
}

export type DialogueConnection = NextDialogueConnection | RequirementConnection | EffectConnection | ChoiceConnection

export type RelevantChild = Shape | Connector
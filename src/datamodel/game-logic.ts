import { Dialogue, Identifier } from "./game"

export type OnAdvanceEvent = {
  history: GameAction[]
}

export type OnAdvanceListener = (event: OnAdvanceEvent) => void

export type OnSelectEvent = {
  choice: Identifier
}

export type OnChoiceSelect = (event: OnSelectEvent) => void

export type GameAdvanceParams = {
  choice?: Identifier
}

export type GameAction = {
  dialogue: Dialogue
  choice?: Identifier
}
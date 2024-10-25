import { DialogueKind } from "../../datamodel";
import { GameAdvanceParams } from "../../datamodel/game-logic";
import { notEmptyString } from "../../helpers/notEmptyString";
import { GameLogic } from "./GameLogic";

export const verifyGameAdvanceParams = (gameLogic: GameLogic, params: GameAdvanceParams | undefined): boolean => {
  const currentDialogueKind = gameLogic.currentDialogue?.kind

  if (currentDialogueKind === DialogueKind.SimpleDialogue) {
    return true;
  } else if (currentDialogueKind === DialogueKind.MultipleChoiceDialogue) {
    const isChoiceSelected = notEmptyString(params?.choice)

    if (isChoiceSelected) {
      console.log('verifyGameAdvanceParams:', 'proceeding', 'currentDialogueKind:', currentDialogueKind, 'isChoiceSelected:', isChoiceSelected)
      return isChoiceSelected
    } else {
      console.warn('verifyGameAdvanceParams:', 'unable to proceed', 'currentDialogueKind:', currentDialogueKind, 'isChoiceSelected:', isChoiceSelected)
      return false
    }
  }

  return true
}
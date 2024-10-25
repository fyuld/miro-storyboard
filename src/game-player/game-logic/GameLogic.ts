import { Dialogue, DialogueChoice, DialogueKind, Game, Identifier } from '../../datamodel'
import { GameAdvanceParams, OnAdvanceListener } from '../../datamodel/game-logic'
import { notEmptyString } from '../../helpers/notEmptyString'
import { retrieveFirstActivity, retrieveFirstScene } from '../helpers'

const delay = (): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined)
    }, 2)
  })
}

const resolveNextDialogue = (dialogue: Dialogue, selectedChoice?: Identifier): Identifier => {
  if (dialogue.kind === DialogueKind.SimpleDialogue) {
    try {
      return dialogue.next.next
    } catch (error) {
      console.error('resolveNextDialogue:', dialogue)
      console.error('resolveNextDialogue:', dialogue.next)
    }
  } else if (dialogue.kind === DialogueKind.MultipleChoiceDialogue) {
    const choice: DialogueChoice | undefined = dialogue.choices.find((availableChoice) => availableChoice.identifier === selectedChoice)

    if (choice === undefined) {
      throw new Error(`resolveNextDialogue: Unable to located choice: ${selectedChoice} for dialogue: ${dialogue}`)
    }

    return choice.next.next
  } else {
    throw new Error(`resolveNextDialogue: Unknown DialogueKind: ${dialogue.identifier} ${dialogue.kind}`)
  }
}

export class GameLogic {
  public game: Game
  private _currentDialogue?: Dialogue
  private _isLocked: boolean
  private _onAdvanceListeners: OnAdvanceListener[] = []
  public _history: any[] = []
  private _dialogues: Dialogue[] = []

  constructor(game: Game) {
    this.game = game
    this._isLocked = false

    this._dialogues = game.scenes.reduce((combinedDialogues: Dialogue[], scene) => combinedDialogues.concat(scene.dialogues), [])
  }

  public addAdvanceListener(listener: OnAdvanceListener): void {
    const isListenerAlreadyAdded = this._onAdvanceListeners.some(
      (candidate) => candidate === listener
    )

    if (isListenerAlreadyAdded) {
      throw new Error(`GameLogic.addAdvanceListener listener ${listener} already added`)
    }

    this._onAdvanceListeners.push(listener)
  }

  public lock(): void {
    this._isLocked = true
  }

  public unlock(): void {
    this._isLocked = false
  }

  public async advance(params?: GameAdvanceParams): Promise<void> {
    if (this._isLocked) {
      console.log('GameLogic:Locked')
      return
    }

    this.lock()

    await delay()

    if (this._currentDialogue === undefined) {
      this._currentDialogue = retrieveFirstActivity(retrieveFirstScene(this.game))
    } else {
      const isAdvanceDisallowed = this._currentDialogue.kind === DialogueKind.MultipleChoiceDialogue && !notEmptyString(params?.choice)

      if (isAdvanceDisallowed) {
        this.unlock()
        return
      } else { 
        const nextDialogueId: Identifier = resolveNextDialogue(this._currentDialogue, params?.choice)
        const nextDialogue = this._dialogues.find((dialogue: Dialogue) => dialogue.identifier === nextDialogueId)
        this._currentDialogue = nextDialogue
      }
    }

    this._history.push({ dialogue: this._currentDialogue })

    this._onAdvanceListeners.forEach((listener: OnAdvanceListener) =>
      listener({ history: this._history })
    )

    this.unlock()
  }

  public get isLocked(): boolean {
    return this._isLocked
  }
}

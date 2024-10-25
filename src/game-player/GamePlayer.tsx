import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { GameLogic } from './game-logic';
import { Game, GameAction, Identifier } from '../datamodel'
import { GameActionDisplay } from './GameActionDisplay';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { useKeyboardShortcut } from '../ui';
import { AdvanceParams, GameAdvanceParams, OnAdvanceEvent } from '../datamodel/game-logic';
import { notEmptyString } from '../helpers/notEmptyString';

type GamePlayerProps = {
  game: Game
}

let _gameLogic: GameLogic

const createGameLogic = (game: Game): GameLogic => {
  if (_gameLogic) {
    return _gameLogic
  } else {
    _gameLogic = new GameLogic(game)
    return _gameLogic
  }
}

const getGameLogic = (): GameLogic => {
  return _gameLogic
}

type GameSimulatorState = {
  selectedChoice: Identifier | undefined
  history: GameAction[]
}

const initialState: GameSimulatorState = {
  selectedChoice: undefined,
  history: []
}

enum GameSimulatorActionTypes {
  AdvanceGame = 'AdvanceGame',
  GameAdvanced = 'GameAdvanced',
  DialogueChoiceSelected = 'DialogueChoiceSelected'
}

type GameSimulatorAction = GameSimulatorAdvanceAction | GameSimulatorChoiceAction

type GameSimulatorAdvanceAction = GameSimulatorAction & {
  type: GameSimulatorActionTypes.GameAdvanced,
  payload: {
    history: GameAction[]
  }
}

type GameSimulatorChoiceAction = GameSimulatorAction & {
  type: GameSimulatorActionTypes.DialogueChoiceSelected,
  payload: {
    choice: Identifier
  }
}

type GameSimulatorReducer = (state: GameSimulatorState, action:GameLogicAction) => GameSimulatorState

const gameSimulatorReducer: GameSimulatorReducer = (state, action): GameSimulatorState => {
  switch (action.type) {
    case GameSimulatorActionTypes.GameAdvanced:
      return {...state, history: action.payload.history }
    case GameSimulatorActionTypes.DialogueChoiceSelected:
      return { ...state, selectedChoice: action.payload.choice }
    case GameSimulatorActionTypes.AdvanceGame:
      const params: AdvanceParams = {}

      if (notEmptyString(state.selectedChoice)) {
        params.choice = state.selectedChoice
      }

      getGameLogic().advance(params)

      return { ...state, selectedChoice: undefined}
    default:
      return state
  }
}


const GamePlayer = (props: GamePlayerProps) => {
  const { game } = props
  const gameLogic = createGameLogic(game)
  const [state, dispatch] = useReducer(gameSimulatorReducer, initialState)
  const { history, selectedChoice } = state
 
  const advanceGameLogic = useCallback(async () => {
    dispatch({ type: GameSimulatorActionTypes.AdvanceGame })
  }, [selectedChoice, history, history.length, gameLogic])

  const handleGameLogicAdvance = useCallback((event: OnAdvanceEvent) => {
    dispatch({type: GameSimulatorActionTypes.GameAdvanced, payload: { history: event.history}})
  }, [])

  const handleChoiceSelect = (event) => {
    dispatch({type: GameSimulatorActionTypes.DialogueChoiceSelected, payload: { choice: event.choice} })
  }

  useKeyboardShortcut({
    Space: 'advance',
    KeyA: 'advance'
  }, (intent: string) => {
    switch (intent) {
      case 'advance':
        return advanceGameLogic()
      default:
        throw new Error(`useKeyboardShortcut: Unknown intent ${intent}`)
    }
  }, [])

  useEffect(() => {
    gameLogic.addAdvanceListener(handleGameLogicAdvance)
  }, [gameLogic])

  const historyItems = history.map((action: GameAction, index: number, list: GameAction[]) => {
    return (
      <GameActionDisplay action={action} key={index} isLast={index === list.length - 1} onChoiceSelect={handleChoiceSelect} />
    )
  })

  const advanceButtonLabel = notEmptyString(selectedChoice) ? `Advance (${selectedChoice})` : 'Advance'

  return (
    <Paper elevation={2}>
      <Button onClick={advanceGameLogic}>{advanceButtonLabel}</Button>
      <Typography variant='h6'>Game Player</Typography>
      <Stack spacing={2} sx={{overflow: 'scroll', height: '80vh'}}>
        {historyItems}
      </Stack>
    </Paper>
  );
}

export { GamePlayer }
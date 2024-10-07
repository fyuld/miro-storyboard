import * as he from 'he';
import React, { useCallback, useState } from 'react';
import {createRoot} from 'react-dom/client';

import '../src/assets/style.css';
import { ContainableItem, Frame } from '@mirohq/websdk-types';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { Character, Game, RelevantChild, Scene } from './datamodel';
import { When } from './ui';
import { CharactersDisplay } from './views';
import { parseFramesToScenes, parseFrameToCharacters } from './helpers';
import { ScenesDisplay } from './views/ScenesDisplay';
import { GamePlayer } from './game-player';

type GameState = {
  characters: Character[]
  scenes: Scene[]
}

const parseBoardToGameState = (frames: Frame[], children: RelevantChild[]): GameState => {
  const characters: Character[] = parseFrameToCharacters(frames, children)
  const scenes: Scene[] = parseFramesToScenes(frames, characters, children)

   return { characters, scenes }
}

const preloadFramesAndChildren = async (): Promise<[Frame[], RelevantChild[]]> => {
  const frames: Frame[] = await miro.board.get({type: ['frame']})
  const readyFrames: Frame[] = frames.filter((frame) => {
    const readyRe = /\[[a-zA-Z0-9\ \-]+\]/gi
    const isFrameReady = readyRe.test(frame.title)

    return isFrameReady
  })

  const frameChildren = await Promise.all(readyFrames.map(async (frame: Frame) => {
    const children = await frame.getChildren()

    return children
  }))

  const children = frameChildren
    .reduce((combined, frameChildren) => combined.concat(frameChildren), [])
    .filter((child: ContainableItem): child is RelevantChild => {
      return child.type === 'connector' || child.type === 'shape'
    })
    .map((child) => {
      if (child.type === 'shape') {
        return {...child, content: he.decode(child.content)} as RelevantChild
      } else {
        return child
      }
    })

  return [readyFrames, children]
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({ characters: [], scenes: [] })
  const [error, setError] = useState<Error>()

  const { characters, scenes } = gameState
  const hasCharacters = characters.length > 0
  const hasSenes = scenes.length > 0
  const hasErrors = error !== undefined
  const errorMessage = error === undefined ? '' : error.message
  const errorStack = error === undefined ? '' : error.stack

  const handleExportGameClick = useCallback(async () => {
    setError(undefined)
    const [frames, children] = await preloadFramesAndChildren()

    try {
      const gameState = parseBoardToGameState(frames, children)
      setGameState(gameState)
    } catch (error) {
      setError(error as Error)
    }

  }, [gameState, error])

  const game: Game | undefined = hasSenes && hasCharacters ? {
    characters: gameState.characters,
    scenes: gameState.scenes
  } : undefined

  const hasGame = game !== undefined


  return (
    <>
    <Stack spacing={2}>
      <Paper>
        <Button onClick={handleExportGameClick}>Export Game</Button>
        <Button disabled>Play Dialog</Button>
      </Paper>
      <When guard={hasGame}>
        <GamePlayer game={game as Game} />
      </When>
      <When guard={hasErrors}>
        <Paper elevation={10} sx={{padding: '10px'}}>
          <Typography variant='subtitle1'>Error</Typography>
          <Typography variant='body1'>{errorMessage}</Typography>
          <Typography variant='body2'>{errorStack}</Typography>
        </Paper>
      </When>
    </Stack>
    </>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

import React, { useEffect, useRef } from 'react';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { Character, Dialogue, DialogueKind, GameAction } from '../datamodel';
import { OnChoiceSelect, OnSelectEvent } from '../datamodel/game-logic';


type CharacterDisplayProps = {
  character: Character
}

const CharacterDisplay = (props: CharacterDisplayProps) => {
  return <h4 style={{textAlign: 'end'}}>{props.character.firstName}</h4>
}

type DialogueDisplayProps = {
  dialogue: Dialogue
  className: string
  onChoiceSelect: OnChoiceSelect
  isEnabled: boolean
  forwardRef?: React.RefObject<HTMLDivElement>;
}

const DialogueDisplay = (props: DialogueDisplayProps) => {
  const { dialogue, className, onChoiceSelect, isEnabled, forwardRef } = props

  console.log('DialogueDisplay:', dialogue.content, dialogue.kind)

  if (dialogue.kind === DialogueKind.MultipleChoiceDialogue) {
    const { content, character, choices } = dialogue

    const choiceItems = choices.map((choice, index) => {
      const handleClick = () => onChoiceSelect({choice: choice.identifier})
      return (
        <Button variant='outlined' onClick={handleClick} size='large' key={index} disabled={!isEnabled}>{choice.content}</Button>
      )
    })

    return (
      <Paper elevation={6} className={className} ref={forwardRef}>
        <CharacterDisplay character={dialogue.character} />
        <div dangerouslySetInnerHTML={{ __html: content }} />
        <Stack spacing='1'>
          {choiceItems}
        </Stack>
      </Paper>
    )


  } else if (dialogue.kind === DialogueKind.SimpleDialogue) {
    const { content, character} = dialogue

    return (
      <Paper elevation={4} className={className} ref={forwardRef}>
        <CharacterDisplay character={dialogue.character} />
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </Paper>
    )
  } else {
    return (
      <Paper elevation={10} className={className} ref={forwardRef}>
        Unsupported Kind
      </Paper>
    )
  }
}

type GameActionDisplayProps = {
  action: GameAction ;
  onChoiceSelect: OnChoiceSelect
  isLast: boolean;
}

const GameActionDisplay = (props: GameActionDisplayProps) => {
  const { action: { dialogue }, onChoiceSelect, isLast } = props
  const className = isLast ? 'activity-view is-last-activity' : 'activity-view'

  const isEnabled = isLast

  const handleChoiceSelect = (event: OnSelectEvent) => {
    if (isEnabled) {
      onChoiceSelect(event)
    } else {
      console.info('GameActionDisplay.handleChoiceSelect', dialogue.identifier, 'is not enabled')
    }
  }

  const articleElementRef = useRef(null)

  useEffect(() => {
    if (isLast) {
      const element = articleElementRef.current as unknown as HTMLDivElement
      element.scrollIntoView({behavior: 'smooth'})

    }
  }, [articleElementRef, isLast])

  return <DialogueDisplay dialogue={dialogue} className={className} onChoiceSelect={handleChoiceSelect} forwardRef={articleElementRef} isEnabled={isEnabled}/>
}



export { GameActionDisplay };

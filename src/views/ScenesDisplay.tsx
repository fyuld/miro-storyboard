import React, { useCallback, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Paper, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Dialogue, DialogueKind, Scene } from '../datamodel';

type ScenesDisplayProps = {
  scenes: Scene[]
}

type DialogueDisplayProps = {
  dialog: Dialogue
}

const DialogueDisplay = (props: DialogueDisplayProps) => {
  const { dialog } = props

  if (dialog.kind === DialogueKind.SimpleDialogue) {
    return (
      <Paper elevation={15}>
        <Typography variant='h6'>{dialog.character.firstName}</Typography>
        <Typography variant='body1'>{dialog.content}</Typography>
      </Paper>
    )
  } else {
    <Paper elevation={15}>
      <Typography variant='body1'>Unsupported Dialog Kind:</Typography>
      <Typography variant='body1'>{dialog.kind}</Typography>
    </Paper>
  }
}

const ScenesDisplay = (props: ScenesDisplayProps) => {
  const { scenes } = props

  const sceneDisplays = scenes.map((scene: Scene) => {
    const dialogueDisplays = scene.dialogues.map((dialogue: Dialogue) => <DialogueDisplay dialog={dialogue} key={dialogue.identifier} />)

    return (
      <Accordion key={scene.identifier}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography gutterBottom>Scene: {scene.title} ({scene.identifier})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {dialogueDisplays}
          </Stack>
        </AccordionDetails>
    </Accordion>
    )
  })

  return (
    <>
      {sceneDisplays}
    </>
  );
};

export { ScenesDisplay }

import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Paper, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Character } from '../datamodel';

type CharactersDisplayProps = {
  characters: Character[]
}

const CharactersDisplay = (props: CharactersDisplayProps) => {
  const {characters} = props
  const characterViews = characters.map((character: Character) => {
    return (
      <Paper elevation={10} sx={{padding: '15px'}} key={character.identifier} >
        <Typography variant='h6'>{character.firstName}</Typography>
        <Typography variant='body1'>{`Kind: ${character.kind}`}</Typography>
      </Paper>
    )
  })

  return (
    <Accordion>
      <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography gutterBottom>Characters</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {characterViews}
      </AccordionDetails>
    </Accordion>
      
  );
};

export { CharactersDisplay }

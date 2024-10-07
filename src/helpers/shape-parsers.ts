import { Connector, Shape } from "@mirohq/websdk-types"
import { Character, CharacterKind, ChoiceConnection, DialogueChoice, DialogueConnection, DialogueConnectionKind, DialogueKind, Identifiable, Identifier, MultipleChoiceDialogue, NextDialogue, NextDialogueConnection, RelevantChild, SimpleDialogue } from "../datamodel"
import { notEmptyString } from "./notEmptyString"
import { extractCharacterIdFromContent, extractIdentifierFromContent } from "./content-field-extractors"
import { cleanShapeContent } from "./cleanShapeContent"


const firstNameRe = /firstname: ([\<\>\/A-Za-z0-9\ \-\–]+)<\/p>/gi
const lastNameRe = /lastname: ([\<\>\/A-Za-z0-9\ \-\–]+)<\/p>/gi
const characterKindRe = /kind: ([\<\>\/A-Za-z0-9\ \-\–]+)<\/p>/gi

export const findItemByIdentifier = <ItemType extends Identifiable>(list: ItemType[], identifier: Identifier): ItemType => {
  const cleanId = identifier.split(':').pop()?.trim()
  const maybeItem = list.filter((item: ItemType) => item.identifier === cleanId).pop()

  if (maybeItem) {
    return maybeItem
  } else {
    throw new Error(`findItemByIdentifier: Unable to find item by identifier: ${cleanId}`)
  }
}

export const shapeRepresentsDialogue = (shape: Shape): boolean => {
  const isDialogue = shapeRepresentsSimpleDialogue(shape) || shapeIsMultipleChoiceDialogue(shape)

  if (isDialogue) {
    return isDialogue
  } else {
    console.log(JSON.stringify(shape))
  }
}

export const shapeIsMultipleChoiceDialogue = (shape: Shape): boolean => {
  const { style: {fillColor, borderColor}} = shape

  const isChoiceDialogue = fillColor === '#1a1a1a' && borderColor === '#e6e6e6'

  return isChoiceDialogue
}

export const shapeIsChoice = (shape: Shape): boolean => {
  const { style: {fillColor, borderColor}} = shape

  const isChoice = fillColor === '#808080' && borderColor === '#e6e6e6'

  return isChoice
}

export const shapeRepresentsSimpleDialogue = (shape: Shape): boolean => {
  const { style: {fillColor, borderColor}} = shape

  const isSimpleDialogue = fillColor === '#1a1a1a' && borderColor === '#1a1a1a'

  return isSimpleDialogue
}

export const shapeRepresentsCharacter = (shape: Shape): boolean => {
  const { style: {fillColor, borderColor}} = shape

  const isCharacter = fillColor === '#ffffff' && borderColor === '#1a1a1a'

  return isCharacter
}

export const computeIsFirstAndIsLast = (identifier: Identifier, connections: DialogueConnection[]): [boolean, boolean] => {
  const isFirstDialogue = connections
    .filter((connection): connection is NextDialogueConnection => connection.kind === DialogueConnectionKind.NextDialogueConnection)
    .filter((connection) => connection.next === identifier)
    .length === 0

  const isLastDialogue = connections
    .filter((connection): connection is NextDialogueConnection => connection.kind === DialogueConnectionKind.NextDialogueConnection)
    .filter((connection) => connection.previous === identifier)
    .length === 0

  return [isFirstDialogue, isLastDialogue]
}

const resolveNextDialogueConnection = (identifier: Identifier, connections: DialogueConnection[]): NextDialogueConnection=> {
  const nextDialogueConnections = connections
    .filter((connection): connection is NextDialogueConnection => connection.kind === DialogueConnectionKind.NextDialogueConnection)
    .filter((connection) => connection.previous === identifier)

  if (nextDialogueConnections.length > 1) {
    throw new Error(`resolveNextDialogueConnection: Dialogue shape should have only one outgoing connection to another dialogue.
      Instead Dialogue (${identifier}) is connected to ${nextDialogueConnections.length} ${JSON.stringify(nextDialogueConnections)}`)
  }

  const nextDialogueConnection = nextDialogueConnections.pop() as NextDialogueConnection

  return nextDialogueConnection
}

export const shapeToSimpleDialogue = (shape: Shape, characters: Character[], connections: DialogueConnection[] ): SimpleDialogue => {
  const shapeContent: string = shape.content
  const identifier = extractIdentifierFromContent(shapeContent)
  const characterId = extractCharacterIdFromContent(shapeContent)
  const character = findItemByIdentifier(characters, characterId)
  const content = cleanShapeContent(shapeContent)

  const [isFirstDialogue, isLastDialogue] = computeIsFirstAndIsLast(identifier, connections)

  const nextDialogueConnection = resolveNextDialogueConnection(identifier, connections)

  if (!character) {
    throw new Error(`shapeToSimpleDialogue: Unable to find character with identifier ${characterId}.`)
  }

  if (!identifier) {
    throw new Error(`shapeToSimpleDialogue: Unable to parse identifier ${identifier} for shape with content:\n${shapeContent}.`)
  }
 
  return {
    kind: DialogueKind.SimpleDialogue,
    identifier,
    content,
    character,
    next: nextDialogueConnection,
    isFirstDialogue,
    isLastDialogue,
  }
}

export const shapeToChoice = (shape: Shape, connections: DialogueConnection[]): DialogueChoice => {
  const shapeContent: string = shape.content
  const identifier = extractIdentifierFromContent(shapeContent)
  const nextDialogueConnection = resolveNextDialogueConnection(identifier, connections)
  const content = cleanShapeContent(shapeContent, true)

  return {
    identifier,
    content,
    next: nextDialogueConnection
  }
}

export const shapeToMultipleChoiceDialogue =  (shape: Shape, characters: Character[], connections: DialogueConnection[], choices: DialogueChoice[] ): MultipleChoiceDialogue => {
  const shapeContent: string = shape.content
  const identifier = extractIdentifierFromContent(shapeContent)
  const characterId = extractCharacterIdFromContent(shapeContent)
  const character = findItemByIdentifier(characters, characterId)
  const content = cleanShapeContent(shapeContent)

  const [isFirstDialogue, isLastDialogue] = computeIsFirstAndIsLast(identifier, connections)

  const dialogueChoices: DialogueChoice[] = connections
    .filter((connection): connection is ChoiceConnection => connection.kind === DialogueConnectionKind.ChoiceConnection)
    .filter((connection) => connection.dialogue === identifier)
    .map((connection) => {
      const maybeChoice: DialogueChoice = choices.find((choice) => choice.identifier === connection.choice)

      if (maybeChoice !== undefined) {
        return maybeChoice as DialogueChoice
      } else {
        throw new Error(`shapeToMultipleChoiceDialogue: Unable to find Choice with identifier: ${connection.choice}`)
      }
    })

  return {
    kind: DialogueKind.MultipleChoiceDialogue,
    identifier,
    content,
    character,
    choices: dialogueChoices,
    isFirstDialogue,
    isLastDialogue,
  }
}

const cleanUpCharacterName = (dirtyName: string): string => dirtyName
  .split('<p>').join('').split('</p>').join('').split('firstname:').join('').trim()

const resolveCharacterKind = (dirtyCharacterKind: string): CharacterKind => {
  const kindString = dirtyCharacterKind.split('kind:').join('').split('</p>').join('').trim()

  switch (kindString.toLowerCase()) {
    case 'narrator':
      return CharacterKind.Narrator
    case 'non player character':
    case 'nonplayercharacter':
    case 'npc':
      return CharacterKind.NonPlayerCharacter
    case 'player':
    case 'playercharacter':
    case 'pc':
      return CharacterKind.PlayerCharacter
    default:
      throw new Error(`resolveCharacterKind: Unable to resolve kind ${kindString}, from line: ${dirtyCharacterKind}`)
  }
}

export const shapeToCharacter = (shape: Shape): Character => {
  const shapeContent = shape.content
  const dirtyFirstName = shapeContent.match(firstNameRe)?.pop()
  const dirtyLastName = shapeContent.match(lastNameRe)?.pop()
  const dirtyCharacterKind = shapeContent.match(characterKindRe)?.pop()


  if (!notEmptyString(dirtyCharacterKind)) {
    throw new Error(`shapeToCharacter: Missing Character Kind on Shape with content: ${shapeContent}`)
  }

  if (!notEmptyString(dirtyFirstName) && !notEmptyString(dirtyLastName)) {
    throw new Error(`shapeToCharacter: At least one name should be provided, first or last on Shape with content: ${shapeContent}`)
  }

  const identifier: Identifier = extractIdentifierFromContent(shapeContent)
  const kind = resolveCharacterKind(dirtyCharacterKind)
  const firstName = notEmptyString(dirtyFirstName) ? cleanUpCharacterName(dirtyFirstName) : ''
  const lastName = notEmptyString(dirtyLastName) ? cleanUpCharacterName(dirtyLastName) : ''

  const character: Character = {
    kind,
    identifier,
    firstName,
    lastName,
  }

  return character
}

export const connectorsToConnections = (connector: Connector, children: RelevantChild[]): DialogueConnection => {
  const {start, end} = connector

  const startItem = children.find((child) => child.id === start?.item)
  const endItem = children.find((child) => child.id === end?.item)

  const isStartItemDialogue = startItem !== undefined &&
    startItem.type === 'shape' &&
    shapeRepresentsDialogue(startItem as Shape)

  const isEndItemDialogue = endItem !== undefined &&
    endItem.type === 'shape' &&
    shapeRepresentsDialogue(endItem as Shape)

  const isStartItemChoice = startItem !== undefined &&
    startItem.type === 'shape' &&
    shapeIsChoice(startItem as Shape)

  const isEndItemChoice = endItem !== undefined &&
    endItem.type === 'shape' &&
    shapeIsChoice(endItem as Shape)

  const isDialogueConnector = (isStartItemDialogue && isEndItemDialogue) || (isStartItemChoice && isEndItemDialogue)
  const isChoiceConnector = isStartItemDialogue && isEndItemChoice

  if (isDialogueConnector) {
    const startIdentifier = extractIdentifierFromContent((startItem as Shape).content)
    const endIdentifier = extractIdentifierFromContent((endItem as Shape).content)

    return {
      kind: DialogueConnectionKind.NextDialogueConnection,
      next: endIdentifier,
      previous: startIdentifier
    }
  } else if (isChoiceConnector) {
    const startIdentifier = extractIdentifierFromContent((startItem as Shape).content)
    const endIdentifier = extractIdentifierFromContent((endItem as Shape).content)

    return {
      kind: DialogueConnectionKind.ChoiceConnection,
      dialogue: startIdentifier,
      choice: endIdentifier
    }
  } else {
    throw new Error(`connectorsToConnections: Unsuported connector type`)
  }
}

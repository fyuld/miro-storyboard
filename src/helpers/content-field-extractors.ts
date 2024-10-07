import { Identifier } from "../datamodel"

const identifierRe = /==([0-9a-z\-]+)/gi
const characterLinkIdRe = /(##char:[0-9a-zA-Z]+)/gi

export const extractIdentifierFromContent = (content: string): Identifier => {
  try {
    const dirtyIdentifier: string = content.match(identifierRe)?.pop() as unknown as string
    const identifier: Identifier = (dirtyIdentifier.match(/[a-zA-Z0-9\-]/g) as string[]).join('')
    return identifier
  } catch (error) {
    throw new Error(`extractIdentifierFromContent: Unable to extract identifier from content: \n${content}`)
  }
}

export const extractCharacterIdFromContent = (content: string): Identifier => {
  try {
    const dirtyCharacterId: string = content.match(characterLinkIdRe)?.pop() as unknown as string
    const characterId: Identifier = dirtyCharacterId.match(/[a-zA-Z0-9:]+/g)?.join('') as Identifier

    return characterId
  } catch (error) {
    throw new Error(`extractCharacterIdFromContent: Unable to extract identifier from content: \n${content}`)
  }
}
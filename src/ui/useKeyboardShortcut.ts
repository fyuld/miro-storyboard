import { DependencyList, useEffect } from 'react'

type AllowedKeys = 'Space' | 'Tab' | 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD' | 'KeyC'
type IntentKeyMap = { [Key in AllowedKeys]?: string }
type OnIntentDetected = (intent: string) => void

export const useKeyboardShortcut = (
  intentKeyMap: IntentKeyMap,
  onIntentDetected: OnIntentDetected,
  dependencies: DependencyList
) => {
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      const maybeIntent = intentKeyMap[event.code as AllowedKeys]
      if (typeof maybeIntent === 'string') {
        console.info('keyDownHandler:intent', maybeIntent)
        onIntentDetected(maybeIntent)

        event.preventDefault()
      }
    }

    document.addEventListener('keydown', keyDownHandler)

    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, dependencies)
}

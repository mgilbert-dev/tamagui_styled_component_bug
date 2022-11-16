import { useIsomorphicLayoutEffect } from '@tamagui/constants'
import { MutableRefObject, useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { getConfig } from '../config'
import { createProxy } from '../helpers/createProxy'
import { matchMedia } from '../helpers/matchMedia'
import {
  MediaQueries,
  MediaQueryKey,
  MediaQueryObject,
  MediaQueryState,
  TamaguiInternalConfig,
} from '../types'
import { useSafeRef } from './useSafeRef'

export const mediaState: MediaQueryState =
  // development time safeguard
  process.env.NODE_ENV === 'development'
    ? createProxy(
        {},
        {
          get(target, key) {
            if (
              typeof key === 'string' &&
              key[0] === '$' &&
              // dont error on $$typeof
              key[1] !== '$'
            ) {
              throw new Error(`Access mediaState should not use "$": ${key}`)
            }
            return Reflect.get(target, key)
          },
        }
      )
    : ({} as any)

type MediaListener = (next: boolean) => void

const listeners: { [key: string]: Set<MediaListener> } = {}

export function addMediaQueryListener(key: MediaQueryKey, cb: MediaListener) {
  if (process.env.NODE_ENV === 'development' && key[0] === '$') {
    // eslint-disable-next-line no-console
    console.warn(`Warning, listening to media queries shouldn't use the "$" prefix`)
  }
  listeners[key] = listeners[key] || new Set()
  listeners[key].add(cb)
  return () => removeMediaQueryListener(key, cb)
}

export function removeMediaQueryListener(key: MediaQueryKey, cb: MediaListener) {
  listeners[key]?.delete(cb)
}

export const mediaQueryConfig: MediaQueries = {}

export const getMedia = () => mediaState

// for SSR capture it at time of startup
let initState: MediaQueryState
export const getInitialMediaState = () => {
  return (getConfig().disableSSR ? mediaState : initState) || {}
}

let mediaKeysOrdered: string[]
export const getMediaKeyImportance = (key: string) =>
  // + 2 because we set base usedKeys=1 in getSplitStyles and all media go above 1
  mediaKeysOrdered.indexOf(key[0] === '$' ? key.slice(1) : key) + 2

const dispose = new Set<Function>()

export const configureMedia = (config: TamaguiInternalConfig) => {
  const { media, mediaQueryDefaultActive } = config
  if (!media) return
  for (const key in media) {
    mediaState[key] = mediaQueryDefaultActive?.[key] || false
  }
  Object.assign(mediaQueryConfig, media)
  initState = { ...mediaState }
  updateCurrentState()
  mediaKeysOrdered = Object.keys(media)
  if (config.disableSSR) {
    setupMediaListeners()
  }
}

function unlisten() {
  dispose.forEach((cb) => cb())
  dispose.clear()
}

/**
 * Note: This should *not* set the state on the first render!
 * Because to avoid hydration issues SSR must match the server
 * *and then* re-render with the actual media query state.
 */
let configuredKey = ''
function setupMediaListeners() {
  // avoid setting up more than once per config
  const nextKey = JSON.stringify(mediaQueryConfig)
  if (nextKey === configuredKey) {
    return
  }
  configuredKey = nextKey

  // hmr, undo existing before re-binding
  unlisten()

  for (const key in mediaQueryConfig) {
    const str = mediaObjectToString(mediaQueryConfig[key])
    const getMatch = () => matchMedia(str)
    const match = getMatch()
    if (!match) {
      throw new Error('⚠️ No match')
    }
    // react native needs these deprecated apis for now
    match.addListener(update)
    dispose.add(() => match.removeListener(update))

    update()

    function update() {
      const next = !!getMatch().matches
      if (next === mediaState[key]) return
      mediaState[key] = next
      updateCurrentState()
      const cur = listeners[key]
      if (cur?.size) {
        cur.forEach((cb) => cb(next))
      }
    }
  }
}

export function useMediaListeners(config: TamaguiInternalConfig) {
  if (config.disableSSR) return
  useEffect(() => {
    setupMediaListeners()
    return unlisten
  }, [])
}

const nextTick = process.nextTick || setImmediate
const currentStateListeners = new Set<any>()
let isUpdating = false
function updateCurrentState() {
  if (isUpdating) return
  isUpdating = true
  nextTick(() => {
    currentStateListeners.forEach((cb) => cb(mediaState))
    isUpdating = false
  })
}
function subscribe(subscriber: any) {
  currentStateListeners.add(subscriber)
  return () => currentStateListeners.delete(subscriber)
}

type MediaKeysState = {
  [key: string]: any
}

export function useMedia(): {
  [key in MediaQueryKey]: boolean
} {
  const keys = useSafeRef<MediaKeysState>({ prev: initState })

  const state = useSyncExternalStore<MediaQueryState>(
    subscribe,
    () => {
      const { prev, ...curKeys } = keys.current
      const shouldUpdate = !prev || Object.keys(curKeys).some((k) => mediaState[k] !== prev[k])
      if (shouldUpdate) {
        const next = { ...mediaState }
        keys.current.prev = next
        return next
      }
      return prev
    },
    () => initState
  )

  return useMemo(() => {
    return new Proxy(state, {
      get(_, key: string) {
        if (!keys.current[key]) {
          keys.current[key] = true
        }
        return Reflect.get(state, key)
      },
    })
  }, [state])
}

/**
 * Useful for more complex components that need access to the currently active props,
 * accounting for the currently active media queries.
 *
 * Use sparingly, is will loop props and trigger re-render on all media queries.
 *
 * */
export function useMediaPropsActive<A extends Object>(
  props: A
): {
  // remove all media
  [Key in keyof A extends `$${string}` ? never : keyof A]?: A[Key]
} {
  const media = useMedia()

  return useMemo(() => {
    const next = {} as A
    const importancesUsed = {}
    const propNames = Object.keys(props)

    for (let i = propNames.length - 1; i >= 0; i--) {
      const key = propNames[i]
      const val = props[key]
      if (key[0] === '$') {
        if (!media[key.slice(1)]) {
          continue
        }
        if (val && typeof val === 'object') {
          const subKeys = Object.keys(val)
          for (let j = subKeys.length; j--; j >= 0) {
            const subKey = subKeys[j]
            mergeMediaByImportance(next, subKey, val[subKey], importancesUsed)
          }
        }
      } else {
        mergeMediaByImportance(next, key, val, importancesUsed)
      }
    }

    return next
  }, [media, props])
}

export function mergeMediaByImportance(
  onto: Record<string, any>,
  key: string,
  value: any,
  importancesUsed: Record<string, number>
) {
  const importance = getMediaKeyImportance(key)
  if (importancesUsed[key] > importance) {
    return false
  }
  importancesUsed[key] = importance
  onto[key] = value
  return true
}

function camelToHyphen(str: string) {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`).toLowerCase()
}

export function mediaObjectToString(query: string | MediaQueryObject) {
  if (typeof query === 'string') {
    return query
  }
  return Object.entries(query)
    .map(([feature, value]) => {
      feature = camelToHyphen(feature)
      if (typeof value === 'string') {
        return `(${feature}: ${value})`
      }
      if (typeof value === 'number' && /[height|width]$/.test(feature)) {
        value = `${value}px`
      }
      return `(${feature}: ${value})`
    })
    .join(' and ')
}

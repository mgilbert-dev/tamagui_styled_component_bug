import { useComposedRefs } from '@tamagui/compose-refs'
import { useEvent } from '@tamagui/use-event'
import * as React from 'react'

import { FocusScopeProps } from './FocusScopeProps'

const AUTOFOCUS_ON_MOUNT = 'focusScope.autoFocusOnMount'
const AUTOFOCUS_ON_UNMOUNT = 'focusScope.autoFocusOnUnmount'
const EVENT_OPTIONS = { bubbles: false, cancelable: true }

type FocusableTarget = HTMLElement | { focus(): void }

/* -------------------------------------------------------------------------------------------------
 * FocusScope
 * -----------------------------------------------------------------------------------------------*/

const FOCUS_SCOPE_NAME = 'FocusScope'

type FocusScopeElement = HTMLDivElement

const FocusScope = React.forwardRef<FocusScopeElement, FocusScopeProps>(
  (props, forwardedRef) => {
    const {
      loop = false,
      trapped = false,
      onMountAutoFocus: onMountAutoFocusProp,
      onUnmountAutoFocus: onUnmountAutoFocusProp,
      children,
      forceUnmount,
      ...scopeProps
    } = props
    const [container, setContainer] = React.useState<HTMLElement | null>(null)
    const onMountAutoFocus = useEvent(onMountAutoFocusProp)
    const onUnmountAutoFocus = useEvent(onUnmountAutoFocusProp)
    const lastFocusedElementRef = React.useRef<HTMLElement | null>(null)
    const composedRefs = useComposedRefs(forwardedRef, (node) => setContainer(node))

    const focusScope = React.useRef({
      paused: false,
      pause() {
        this.paused = true
      },
      resume() {
        this.paused = false
      },
    }).current

    // Takes care of trapping focus if focus is moved outside programmatically for example
    React.useEffect(() => {
      if (!trapped) return
      function handleFocusIn(event: FocusEvent) {
        if (focusScope.paused || !container) return
        const target = event.target as HTMLElement | null
        if (container.contains(target)) {
          lastFocusedElementRef.current = target
        } else {
          focus(lastFocusedElementRef.current, { select: true })
        }
      }

      function handleFocusOut(event: FocusEvent) {
        if (focusScope.paused || !container) return
        if (!container.contains(event.relatedTarget as HTMLElement | null)) {
          focus(lastFocusedElementRef.current, { select: true })
        }
      }

      document.addEventListener('focusin', handleFocusIn)
      document.addEventListener('focusout', handleFocusOut)
      return () => {
        document.removeEventListener('focusin', handleFocusIn)
        document.removeEventListener('focusout', handleFocusOut)
      }
    }, [trapped, forceUnmount, container, focusScope.paused])

    React.useEffect(() => {
      if (!container) return
      if (forceUnmount) return
      focusScopesStack.add(focusScope)
      const previouslyFocusedElement = document.activeElement as HTMLElement | null
      const hasFocusedCandidate = container.contains(previouslyFocusedElement)

      if (!hasFocusedCandidate) {
        const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS)
        container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus)
        container.dispatchEvent(mountEvent)
        if (!mountEvent.defaultPrevented) {
          focusFirst(removeLinks(getTabbableCandidates(container)), { select: true })
          if (document.activeElement === previouslyFocusedElement) {
            focus(container)
          }
        }
      }

      return () => {
        container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus)

        const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS)
        container.addEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus)
        container.dispatchEvent(unmountEvent)
        if (!unmountEvent.defaultPrevented) {
          focus(previouslyFocusedElement ?? document.body, { select: true })
        }
        // we need to remove the listener after we `dispatchEvent`
        container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus)

        focusScopesStack.remove(focusScope)
      }
    }, [container, forceUnmount, onMountAutoFocus, onUnmountAutoFocus, focusScope])

    // Takes care of looping focus (when tabbing whilst at the edges)
    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (!(loop || trapped)) return
        if (focusScope.paused) return

        const isTabKey =
          event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey
        const focusedElement = document.activeElement as HTMLElement | null

        if (isTabKey && focusedElement) {
          const container = event.currentTarget as HTMLElement
          const [first, last] = getTabbableEdges(container)
          const hasTabbableElementsInside = first && last

          // we can only wrap focus if we have tabbable edges
          if (!hasTabbableElementsInside) {
            if (focusedElement === container) event.preventDefault()
          } else {
            if (!event.shiftKey && focusedElement === last) {
              event.preventDefault()
              if (loop) focus(first, { select: true })
            } else if (event.shiftKey && focusedElement === first) {
              event.preventDefault()
              if (loop) focus(last, { select: true })
            }
          }
        }
      },
      [loop, trapped, focusScope.paused],
    )

    const child = React.Children.only(children)

    return React.cloneElement(child as any, {
      tabIndex: -1,
      ...scopeProps,
      ref: composedRefs,
      onKeyDown: handleKeyDown,
    })
  },
)

FocusScope.displayName = FOCUS_SCOPE_NAME

/* -------------------------------------------------------------------------------------------------
 * Utils
 * -----------------------------------------------------------------------------------------------*/

/**
 * Attempts focusing the first element in a list of candidates.
 * Stops when focus has actually moved.
 */
function focusFirst(candidates: HTMLElement[], { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement
  for (const candidate of candidates) {
    focus(candidate, { select })
    if (document.activeElement !== previouslyFocusedElement) return
  }
}

/**
 * Returns the first and last tabbable elements inside a container.
 */
function getTabbableEdges(container: HTMLElement) {
  const candidates = getTabbableCandidates(container)
  const first = findVisible(candidates, container)
  const last = findVisible(candidates.reverse(), container)
  return [first, last] as const
}

/**
 * Returns a list of potential tabbable candidates.
 *
 * NOTE: This is only a close approximation. For example it doesn't take into account cases like when
 * elements are not visible. This cannot be worked out easily by just reading a property, but rather
 * necessitate runtime knowledge (computed styles, etc). We deal with these cases separately.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker
 * Credit: https://github.com/discord/focus-layers/blob/master/src/util/wrapFocus.tsx#L1
 */
function getTabbableCandidates(container: HTMLElement) {
  const nodes: HTMLElement[] = []
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node: any) => {
      const isHiddenInput = node.tagName === 'INPUT' && node.type === 'hidden'
      if (node.disabled || node.hidden || isHiddenInput)
        return NodeFilter.FILTER_SKIP
      // `.tabIndex` is not the same as the `tabindex` attribute. It works on the
      // runtime's understanding of tabbability, so this automatically accounts
      // for any kind of element that could be tabbed to.
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    },
  })
  while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement)
  // we do not take into account the order of nodes with positive `tabIndex` as it
  // hinders accessibility to have tab order different from visual order.
  return nodes
}

/**
 * Returns the first visible element in a list.
 * NOTE: Only checks visibility up to the `container`.
 */
function findVisible(elements: HTMLElement[], container: HTMLElement) {
  for (const element of elements) {
    // we stop checking if it's hidden at the `container` level (excluding)
    if (!isHidden(element, { upTo: container })) return element
  }
}

function isHidden(node: HTMLElement, { upTo }: { upTo?: HTMLElement }) {
  if (getComputedStyle(node).visibility === 'hidden') return true
  while (node) {
    // we stop at `upTo` (excluding it)
    if (upTo !== undefined && node === upTo) return false
    if (getComputedStyle(node).display === 'none') return true
    node = node.parentElement as HTMLElement
  }
  return false
}

function isSelectableInput(
  element: any,
): element is FocusableTarget & { select: () => void } {
  return element instanceof HTMLInputElement && 'select' in element
}

function focus(element?: FocusableTarget | null, { select = false } = {}) {
  // only focus if that element is focusable
  if (element?.focus) {
    const previouslyFocusedElement = document.activeElement
    // NOTE: we prevent scrolling on focus, to minimize jarring transitions for users
    element.focus({ preventScroll: true })
    // only select if its not the same element, it supports selection and we need to select
    if (element !== previouslyFocusedElement && isSelectableInput(element) && select)
      element.select()
  }
}

/* -------------------------------------------------------------------------------------------------
 * FocusScope stack
 * -----------------------------------------------------------------------------------------------*/

type FocusScopeAPI = { paused: boolean; pause(): void; resume(): void }
const focusScopesStack = createFocusScopesStack()

function createFocusScopesStack() {
  /** A stack of focus scopes, with the active one at the top */
  let stack: FocusScopeAPI[] = []

  return {
    add(focusScope: FocusScopeAPI) {
      // pause the currently active focus scope (at the top of the stack)
      const activeFocusScope = stack[0]
      if (focusScope !== activeFocusScope) {
        activeFocusScope?.pause()
      }
      // remove in case it already exists (because we'll re-add it at the top of the stack)
      stack = arrayRemove(stack, focusScope)
      stack.unshift(focusScope)
    },

    remove(focusScope: FocusScopeAPI) {
      stack = arrayRemove(stack, focusScope)
      stack[0]?.resume()
    },
  }
}

function arrayRemove<T>(array: T[], item: T) {
  const updatedArray = [...array]
  const index = updatedArray.indexOf(item)
  if (index !== -1) {
    updatedArray.splice(index, 1)
  }
  return updatedArray
}

function removeLinks(items: HTMLElement[]) {
  return items.filter((item) => item.tagName !== 'A')
}

export { FocusScope }

export type { FocusScopeProps }

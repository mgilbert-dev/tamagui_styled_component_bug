// this needs to check if its inserted already? 99% of the time it is
// this should avoid re-inserts, but need to test the perf trade-offs
// i tested with the site itself and the initial insert was trivial

const allSelectors = {}
const insertedSelectors = {}
export const insertedTransforms = {}

export const getAllSelectors = () => allSelectors
export const getInsertedRules = () => Object.values(insertedSelectors)
export const getAllTransforms = () => insertedTransforms

// keep transforms in map for merging later
function addTransform(identifier: string, css: string, rule?: CSSRule) {
  const s = css.indexOf('transform:')
  if (s === -1) {
    if (process.env.NODE_ENV === 'development') {
      // sometimes getting empty style rules from webpack... :/ only in dev
      if (css.indexOf('{ }')) {
        console.log('wah wah')
        return false
      }
      console.groupCollapsed(`❌ Invalid transform, likely used deg/% improperly ${identifier}`)
      console.log('rule:', rule)
      console.trace()
      console.groupEnd()
    } else {
      console.warn(`Missing transform`, identifier, css, rule)
    }
    return false
  }
  const startI = s + 'transform:'.length
  const endI = css.indexOf(';')
  const value = css.slice(startI, endI)
  if (!insertedTransforms[identifier]) {
    insertedTransforms[identifier] = value
    return true
  }
  return false
}

const isClient = typeof document !== 'undefined'

// gets existing ones (client side)
// takes ~0.1ms for a fairly large page
// used now for three things:
//   1. debugging at dev time
//   2. avoid duplicate insert styles at runtime
//   3. used now for merging transforms atomically
const scannedNum = new WeakMap<CSSStyleSheet, number>()

export function updateInserted() {
  if (process.env.NODE_ENV === 'test') return
  if (!isClient) return
  const sheets = document.styleSheets
  if (!sheets) return
  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i]
    const rules = sheet.cssRules
    const len = rules.length
    const lastScanned = scannedNum.get(sheet) ?? 0
    if (lastScanned === len) {
      continue
    }
    for (let i = lastScanned; i < len; i++) {
      const rule = rules[i]
      const response = getTamaguiSelector(rule)
      if (!response) {
        continue
      }
      const [identifier, cssRule] = response
      if (!allSelectors[identifier]) {
        const isTransform = identifier.startsWith('_transform')
        const shouldInsert = isTransform ? addTransform(identifier, cssRule.cssText, cssRule) : true
        if (shouldInsert) {
          allSelectors[identifier] = process.env.NODE_ENV === 'development' ? cssRule.cssText : true
        }
      }
    }
    scannedNum.set(sheet, i)
  }
}

function getTamaguiSelector(rule: CSSRule | null): readonly [string, CSSStyleRule] | null {
  if (rule instanceof CSSStyleRule) {
    if (rule.selectorText.startsWith('._')) {
      return [rule.selectorText.slice(1), rule]
    }
    if (rule.selectorText.startsWith(':root') && rule.selectorText.includes('._')) {
      return [getIdentifierFromTamaguiSelector(rule.selectorText), rule]
    }
  } else if (rule instanceof CSSMediaRule) {
    // tamagui only ever inserts 1 rule per media
    if (rule.cssRules.length > 1) return null
    return getTamaguiSelector(rule.cssRules[0])
  }
  return null
}

const getIdentifierFromTamaguiSelector = (selector: string) =>
  selector
    .replace(/(:root)+\s+/, '')
    .replace(/:[a-z]+$/, '')
    .slice(1)

updateInserted()

const sheet = isClient ? document.head.appendChild(document.createElement('style')).sheet : null

export function updateInsertedCache(identifier: string, rule: string) {
  if (insertedSelectors[identifier]) return false
  insertedSelectors[identifier] = rule
  if (identifier.startsWith('_transform')) {
    return addTransform(identifier, rule)
  }
  return true
}

export function insertStyleRule(identifier: string, rule: string) {
  if (allSelectors[identifier]) return
  updateInsertedCache(identifier, rule)
  allSelectors[identifier] = process.env.NODE_ENV === 'development' ? rule : true
  sheet?.insertRule(rule, sheet.cssRules.length)
}

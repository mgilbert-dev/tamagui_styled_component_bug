export const names = {
  transparent: 0x00000000,
}

if (process.env.INCLUDE_CSS_COLOR_NAMES) {
  const allNames = require('./names.native').names
  Object.assign(names, allNames)
}

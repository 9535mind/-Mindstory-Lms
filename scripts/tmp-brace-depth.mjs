import fs from 'fs'
const code = fs.readFileSync(new URL('../public/static/js/ms12-app.js', import.meta.url), 'utf8')
const marker = '(function () {'
const start = code.indexOf(marker)
if (start < 0) throw new Error('no IIFE start')
let depth = 1
let line = code.slice(0, start).split(/\n/).length
let i = start + marker.length

function skipString(q) {
  i++
  while (i < code.length) {
    const c = code[i]
    if (c === '\\') {
      i += 2
      continue
    }
    if (c === '\n') line++
    if (c === q) {
      i++
      break
    }
    i++
  }
}

function skipTemplate() {
  i++
  while (i < code.length) {
    const c = code[i]
    if (c === '\\') {
      i += 2
      continue
    }
    if (c === '\n') line++
    if (c === '`') {
      i++
      break
    }
    if (c === '$' && code[i + 1] === '{') {
      i += 2
      depth++
      while (i < code.length && depth >= 2) {
        const ch = code[i]
        if (ch === '\n') line++
        if (ch === '{') depth++
        else if (ch === '}') depth--
        i++
      }
      continue
    }
    i++
  }
}

while (i < code.length && depth >= 1) {
  const ch = code[i]
  const next = code[i + 1]

  if (ch === '/' && next === '/') {
    i += 2
    while (i < code.length && code[i] !== '\n') i++
    continue
  }
  if (ch === '/' && next === '*') {
    i += 2
    while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) {
      if (code[i] === '\n') line++
      i++
    }
    i += 2
    continue
  }

  if (ch === "'" || ch === '"') {
    skipString(ch)
    continue
  }
  if (ch === '`') {
    skipTemplate()
    continue
  }

  if (ch === '/' && /[=*!:>]/.test(code[i - 1] || ' ') === false) {
    const prev = code[i - 1]
    const maybeRegex =
      prev === '(' ||
      prev === '[' ||
      prev === '{' ||
      prev === ',' ||
      prev === ';' ||
      prev === ':' ||
      prev === '=' ||
      prev === '!' ||
      prev === '?' ||
      prev === '&' ||
      prev === '|' ||
      prev === '~' ||
      prev === '+' ||
      prev === '-' ||
      prev === '%' ||
      prev === '^' ||
      /\s/.test(prev)
    if (maybeRegex) {
      i++
      while (i < code.length) {
        const rc = code[i]
        if (rc === '\\') {
          i += 2
          continue
        }
        if (rc === '[') {
          i++
          while (i < code.length && code[i] !== ']') {
            if (code[i] === '\\') i++
            i++
          }
          i++
          continue
        }
        if (rc === '/') break
        if (rc === '\n') line++
        i++
      }
      i++
      continue
    }
  }

  if (ch === '\n') line++
  if (ch === '{') {
    depth++
  } else if (ch === '}') {
    depth--
    if (depth === 0) {
      console.log('Outer IIFE body ends at line', line, 'col context:', code.slice(Math.max(0, i - 40), i + 40))
      break
    }
  }
  i++
}

console.log('final depth', depth, 'stopped at eof?', i >= code.length)

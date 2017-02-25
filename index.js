// We can't just require('monaco-editor'), so we need to find
// it by hand. Like in the stone ages.

const fs = require('fs')
const path = require('path')

/**
 * Tries to find monaco-editor
 *
 * @returns {Promise<string>} monaco-editor directory
 */
function findMonaco () {
  return new Promise((resolve, reject) => {
    let paths = process.mainModule ? process.mainModule.paths : []

    // We'll look far and wide
    paths.push(path.join(__dirname, 'node_modules'))
    paths.push(path.join(__dirname, '..', 'node_modules'))
    paths.push(path.join(__dirname, '..', '..', 'node_modules'))
    paths.push(path.join(process.cwd(), 'node_modules'))
    paths.push(path.join(process.cwd(), '..', 'node_modules'))
    paths.push(path.join(process.cwd(), '..', '..', 'node_modules'))

    paths = paths.map((p) => path.join(p, 'monaco-editor'))

    const foundPath = paths.find((p) => testMonaco(p))

    if (foundPath) {
      resolve(foundPath)
    } else {
      reject('Monaco-Editor not found')
    }
  })
}

/**
 * Tests if "monaco-editor" is available inside a node_modules
 * folder in the given directory
 *
 * @param {string} [dir='']
 * @returns {Promise<boolean>} True if found, false if not
 */
function testMonaco (dir = '') {
  try {
    const res = fs.readdirSync(dir);
    return !!res;
  } catch (e) {
    return false;
  }
}

/**
 * Loads monaco, resolving with the monaco object
 *
 * @typedef LoadMonacoOptions
 * @property {string} baseUrl - Passed to Monaco's require.config
 *
 * @returns {Promise<Object>}
 */
function loadMonaco (options = {}) {
  return new Promise((resolve, reject) => {
    findMonaco().then((monacoDir) => {
      const loader = require(path.join(monacoDir, '/min/vs/loader.js'))

      // If this failed, we're done
      if (!loader) {
        return reject(`Found monaco-editor in ${monacoDir}, but failed to require!`)
      }

      // Configure options
      options.baseUrl = options.baseUrl || `file:///${monacoDir}/min`

      loader.require.config({
        baseUrl: options.baseUrl
      })

      // Help Monaco understand how there's both Node and Browser stuff
      self.module = undefined
      self.process.browser = true

      loader.require(['vs/editor/editor.main'], () => {
        if (monaco) {
          resolve(monaco)
        } else {
          reject('Monaco loaded, but could not find global "monaco"')
        }
      })
    })
  })
}

module.exports = loadMonaco

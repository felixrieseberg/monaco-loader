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
    if (paths.length === 0) {
      paths.push(path.join(__dirname, 'node_modules'))
      paths.push(path.join(__dirname, '..', 'node_modules'))
      paths.push(path.join(__dirname, '..', '..', 'node_modules'))
      paths.push(path.join(process.cwd(), 'node_modules'))
      paths.push(path.join(process.cwd(), '..', 'node_modules'))
      paths.push(path.join(process.cwd(), '..', '..', 'node_modules'))
    }

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
    return !!fs.existsSync(dir);
  } catch (e) {
    return false;
  }
}

/**
 * Gets the correct path
 *
 * @param {*} _path
 * @returns
 */
function uriFromPath(_path = '') {
  let pathName = path.resolve(_path).replace(/\\/g, '/');

  if (pathName.length > 0 && pathName.charAt(0) !== '/') {
    pathName = '/' + pathName;
  }

  return encodeURI('file://' + pathName);
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
      options.baseUrl = uriFromPath(options.baseUrl || `${monacoDir}/min`)

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

## Monaco Loader
Use the Monaco editor using a `require()` or a module loader.

```
npm i monaco-loader
```

```js
const loader = require('monaco-loader')

loader().then((monaco) => {
  let editor = monaco.editor.create(document.getElementById('container'), {
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true
  })
})
```

## Background
The Monaco editor is a wonderful piece of software - but the published module on npm does not conform to any standards. Just calling `require('monaco-editor')` will fail. This module cleanly requires the monaco code editor, properly configures it for usage together with a module loader, and just returns the `monaco` object to you.

By default, Monaco's internal loader's base url will be set to `encodeURI(`file://${monacoDir}/min`)`. To override, call loader with `loader({baseUrl: yourBaseUrl})`.

## License
MIT, please see LICENSE for details.

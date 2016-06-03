
# Temple

> Super simple utility to scaffold templated files

## Example

```sh
temple render readme.hjs > README.md
```

Temple will pull templates from its storage and use data from your `package.json` to output a rendered file.

## Installation

```sh
npm i -g @dotlabel/temple
```

## Usage

Temple is self-documenting as much as possible, use `--help` to get additional information about Temple and each command.

```sh
temple --help
temple render --help
```

Temple needs only a couple of things to work

* A template engine specification
* Some templates

### Specifying and installing templating engines

Temple uses [consolidate](http://github.com/tj/consolidate.js) to render templates and will not install engines unless instructed to do so.

A template engine specification consists of three fields that you need to consider:

```json
{
  "name": "hogan",
  "module": "hogan.js",
  "extensions": [
    "hjs",
    "hogan"
  ]
}
```

* `name` the identifier shared with consolidate
* `module` the module name to install from [npm](http://npmjs.com) when required
* `extensions` Temple will attempt to match template file extensions to those listed by the engine specification i.e. `readme.hjs` would imply using `hogan` to render the template.

The easiest way to register a template is to stream in a specification

```sh
echo '{"module":"hogan.js","extensions":["hjs"]}' | temple engine hogan
```

There are a few other options, see `temple engine --help`.

Once the specification is loaded then you’re free to install it, although Temple will prompt you if you forget this step and try to use a template file requiring the engine.

```sh
temple engine --install hogan
```

### Specifying a template file

Easiest way is to stream the template file in.

```sh
echo '# {{ name }}' | temple register readme.hjs
```

See `temple register --help`

### Rendering a template file

Once you have a few templates and at least one engine registered with Temple you’re set to get going

```sh
temple render readme.hjs > README.md
```

In these examples we have registered `hogan` as a templating engine and added a `readme.hjs` template file, when we attempt to render it Temple checks the extensions, finds that it matches `hogan` and uses `hogan.js` to render the template to stdout, additionally prompting to install `hogan.js` if necessary.

## License

MIT

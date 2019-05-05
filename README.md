This repository contains some scripts to 
* extract a WikiMedia article from oer4schools.org
* clean media wiki specific html
* export to `docx`.

## Requirements
* Node installed
* [Pandoc](https://pandoc.org/) installed

## Run
```
node index.js
```

## Caveat
node-website-scraper requests all sources with `binary` encoding [github issue](https://github.com/website-scraper/node-website-scraper/issues/264). This can cause some encoding issues with `utf-8` html documents.

As a temporary hack:
```javascript
let isTextContent = url.match(/\?printable=yes$/)
if (isTextContent instanceof Array && isTextContent.length == 1) {
    requestOptions.encoding = 'utf8';
}
```
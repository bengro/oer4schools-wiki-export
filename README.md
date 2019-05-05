# oer4schools-wiki-export

A script to export oer4schools wiki articles to Word documents.

Steps involved:
* extract a WikiMedia article from oer4schools.org as listed in `index.js`
* clean media wiki specific html to remove visual noise
* export to `docx` using pandoc

## Requirements
* Install node (tested with version 12)
* Install [Pandoc](https://pandoc.org/) (`brew install pandoc` on OSX)

## Generate Word documents
```
node index.js
```

Collect the files in `/tmp/scraping/.

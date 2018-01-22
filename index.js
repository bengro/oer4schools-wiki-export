const websiteScraper = require('website-scraper');
const jsdom = require("jsdom");
const pandoc = require('node-pandoc');
const fs = require('fs');

const pages = [
    'http://oer.educ.cam.ac.uk/wiki/OER4Schools/What_is_interactive_teaching?printable=yes',
    'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Introduction_to_interactive_teaching_with_ICT?printable=yes',
    'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Activity_planning_and_reflection?printable=yes',
    'http://oer.educ.cam.ac.uk/wiki/OER4Schools/ICTs_in_interactive_teaching?printable=yes',
    'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Effective_use_of_ICT?printable=yes',
];

const tmpDir = '/tmp/scraping/';

const scrape = async (page) => {
    const fileName = extractTitle(page);
    const path = `${tmpDir}${fileName}`;
    const options = {
        urls: [page],
        directory: path,
    };

    console.log(`save ${page} to ${path}`);

    return websiteScraper(options);
};

function prepare(results) {
    return results.map(result => {
        const directory = extractTitle(result[0].url);
        const filePath = `${tmpDir}${directory}/index.html`;
        return {
            file: filePath,
            directory: directory,
            content: result[0].text
        }
    })
}

function clean(results) {
    return results.map(result => {
        console.log('clean html up for ' + result.file);
        const dom = new jsdom.JSDOM(result.content);
        let elementToRemove = dom.window.document.querySelector("#mw-content-text");
        elementToRemove.parentNode.removeChild(elementToRemove);
        fs.writeFileSync(result.file, dom.serialize());
        return {
            htmlFile: result.file,
            directory: result.directory
        };
    })
}

function convert(results) {
    results.map(result => {
        const outputFile = `${result.htmlFile.split('index.html')[0]}/${result.directory}.docx`;
        const args = `-f html -t docx -o ${outputFile}`;
        pandoc(result.htmlFile, args, (error, result) => {
            if (error) {
                console.error('Pandoc step failed: ', error);
                return
            }

            console.log('Word file created!', result);
        });
    })
}

const extractTitle = (page) => {
    const filenameRegex = /OER4Schools\/(.*)\?printable=yes$/;
    const matches = filenameRegex.exec(page);
    const fileName = matches[1];
    return fileName;
};

Promise
    .all(pages.map(scrape))
    .then(results => {
        return prepare(results);
    })
    .then(results => {
        return clean(results);
    })
    .then(files => {
        return convert(files);
    })
    .catch(error => {
        console.error(error)
    });

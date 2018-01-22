const websiteScraper = require('website-scraper');
const jsdom = require("jsdom");
const nrc = require('node-run-cmd');
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

const prepare = (results) => {
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

const clean = (results) => {
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

const convert = (results) => {
    results.map(result => {
        const path = result.htmlFile.split('index.html')[0];
        const outputFile = `${path}/${result.directory}.docx`;
        const options = {cwd: path};
        nrc.run(`pandoc -f html -t docx -o ${outputFile} index.html`, options);
        console.log(`generated ${outputFile}`);
    });
};

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

const websiteScraper = require('website-scraper');
const jsdom = require("jsdom");
const nrc = require('node-run-cmd');
const fs = require('fs');
const path = require('path');

const pages = [
  // Unit 1 - 4
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/What_is_interactive_teaching?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Introduction_to_interactive_teaching_with_ICT?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Activity_planning_and_reflection?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/ICTs_in_interactive_teaching?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Effective_use_of_ICT?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Leadership_for_Learning?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Whole_class_dialogue_and_effective_questioning?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Introduction_to_whole_class_dialogue_and_effective_questioning?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Questioning?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/More_on_questioning?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Concept_mapping?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Engaging_the_community?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Group_work?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Group_work_Same_task_and_different_tasks_group_work?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Supporting_reasoning_and_managing_group_work?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Mixed_pace_groupwork_with_and_without_ICT?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Talking_points_and_effective_group_work?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Review_of_group_work?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Designing_interactive_lesson_plans?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Assessment_for_learning_and_lesson_pacing?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Introduction_to_Assessment_for_Learning?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Learning_objectives_and_success_criteria?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Formative_feedback?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Peer_and_self-assessment?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Review_of_AfL_and_lesson_pacing?printable=yes',

  // Unit 5 - 6
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Enquiry-based_learning_and_project_work?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Introduction_to_enquiry_based_learning?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Starting_the_enquiry_based_learning_process?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Collecting_and_interpreting_information?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Collecting_and_interpreting_information_part_2?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Presenting_findings_of_enquiries?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Into_the_future?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Programme_review_and_action_research?printable=yes',

  // Unit 7 - 8
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Appendix?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Techniques?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/SessionTemplate?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Video?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Induction_sessions?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Workshop_for_school_leaders?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Introductory_workshop?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/eLA2013?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/mlw2014?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/eLA2014?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/Faculty_Workshop_May_2014?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/AVU2014?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/AVU2014/en?printable=yes',
  'http://oer.educ.cam.ac.uk/wiki/OER4Schools/AVU2014/fr?printable=yes',
];

const tmpDir = '/tmp/scraping/';

class MyBeforeRequestPlugin {
  apply(registerAction) {
    registerAction('beforeRequest', ({resource, requestOptions}) => {
      const newRequestOptions = { ...requestOptions }
      if (resource.filename && resource.filename.indexOf('.html') != -1) {
        console.log('found html resource, encoding with utf-8', resource.filename);
        newRequestOptions.encoding = 'utf8';
      } else {
        newRequestOptions.encoding = 'binary';
      }
      return { requestOptions: newRequestOptions };
    });
  }
}

const scrape = async (page) => {
  const fileName = extractTitle(page);
  const path = `${tmpDir}${fileName}`;
  const options = {
    urls: [page],
    directory: path,
    plugins: [ new MyBeforeRequestPlugin() ]
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
};

const removeDomElement = (elementsToRemove) => {
  elementsToRemove.forEach(element => {
    try {
      element.parentNode.removeChild(element);
    } catch (exeption) {
      console.error('Could not remove ', element, error);
    }
  });
};

const wrapWithTable = (dom, elementsToWrap) => {
  elementsToWrap.forEach(element => {
    const table = dom.window.document.createElement('table');
    table.setAttribute("class", "table-style");
    table.setAttribute("border", "1");
    const row = dom.window.document.createElement('tr');
    const column = dom.window.document.createElement('td');
    column.appendChild(element.cloneNode(true));
    row.appendChild(column);
    table.appendChild(row);

    element.parentNode.replaceChild(table, element);
  });
};

const clean = (results) => {
  return results.map(result => {
    console.log('clean html up for ' + result.file);
    const dom = new jsdom.JSDOM(result.content);

    removeDomElement(dom.window.document.querySelectorAll("#mw-content-text"));
    removeDomElement(dom.window.document.querySelectorAll(".printfooter"));
    removeDomElement(dom.window.document.querySelectorAll(".catlinks"));
    removeDomElement(dom.window.document.querySelectorAll("#mw-navigation"));
    removeDomElement(dom.window.document.querySelectorAll("#footer"));
    removeDomElement(dom.window.document.querySelectorAll(".sidebarstyle-three"));
    removeDomElement(dom.window.document.querySelectorAll("#topcontent"));
    removeDomElement(dom.window.document.querySelectorAll("#siteNotice"));
    removeDomElement(dom.window.document.querySelectorAll("#top"));
    removeDomElement(dom.window.document.querySelectorAll("#jump-to-nav"));
    removeDomElement(dom.window.document.querySelectorAll("#contentSub"));
    removeDomElement(dom.window.document.querySelectorAll("#siteSub"));

    wrapWithTable(dom, dom.window.document.querySelectorAll('#toc'));
    wrapWithTable(dom, dom.window.document.querySelectorAll('.divStart'));

    fs.writeFileSync(result.file, dom.serialize(), { encoding: 'utf8' });

    return {
      htmlFile: result.file,
      directory: result.directory
    };
  })
};

const convert = (results) => {
  results.map(result => {
    const path = result.htmlFile.split('index.html')[0];
    const outputFile = `${path}${result.directory}.docx`;
    const options = { cwd: path };
    nrc.run(`pandoc -f html -t docx -o ${outputFile} index.html`, options);
    console.log(`generated ${outputFile}`);
  });
};

const extractTitle = (page) => {
  const filenameRegex = /OER4Schools\/(.*)\?printable=yes$/;
  const matches = filenameRegex.exec(page);
  return matches[1];
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

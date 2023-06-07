const config = require("../../config");
const path = require("path");
const {promisify} = require("util");
const readdir = promisify(require("fs").readdir);
const stat = promisify(require("fs").stat);
const exec = promisify(require("child_process").exec);
const readFile = promisify(require("fs").readFile);


const xmlserializer = require("xmlserializer");

require("./getPorts")();
require("./getAllConnections")();
require("./makeAllLinks")();
require("./makeHtmlGraph")();

const projectsDirectoryPath = path.join(__dirname, "../../public/projects");

Object.filter = (obj, predicate) =>
  Object.keys(obj)
    .filter(key => predicate(obj[key]))
    .reduce((res, key) => ((res[key] = obj[key]), res), {});

const nodeIdAsPng = (toSearch, objects) => {
  for (let i = 0; i < objects.length; i++) {
    if (objects[i].name === toSearch) {
      return objects[i].name;
    }
  }
};



/*
  MMDC async Function: create an svg from a mermaid input file
*/
async function generateSvgFromMermaid(orgFilename, thisProjectName) {
  const {stdout, stderr} = await exec(
    `./node_modules/.bin/mmdc -i public/projects/${thisProjectName}/${orgFilename}.mmd -o public/projects/${thisProjectName}/${orgFilename}.svg`
  );
  // const { stdout, stderr } = await exec('pwd');
  // console.log('stdout:', stdout);
  // console.log('stderr:', stderr);
  return "done";
}


/*
  loadGenerateSvg async Function:
  load the SVG that mermaid cli has produced
*/
async function loadGenerateSvg(orgFilename, thisProjectName) {
  const file = await readFile(
    `${projectsDirectoryPath}/${thisProjectName}/${orgFilename}.svg`,
    "utf-8"
  );
  const findMmd = Projects[thisProjectName].files.filter((file, key) => {
    if (file.type === "mmd") {
      return file;
    }
  });
  const mmd = await readFile(
    `${projectsDirectoryPath}/${thisProjectName}/${findMmd[0].filename}.${findMmd[0].type}`,
    "utf-8"
  );
  const allConnections = await getAllConnections(mmd);
  const htmlGraph = await makeHtmlGraph(thisProjectName,file)

  Array.from(htmlGraph).forEach((graphItem, j) => {
    graphItem.ports = getPorts(allConnections, htmlGraph, j);
  });

  let reactGraph = {};
  let mytempnodes = {};
  reactGraph.offset = {};
  reactGraph.offset.x = 0;
  reactGraph.offset.y = 0;
  reactGraph.nodes = {};

  reactGraph.links = makeAllLinks(allConnections, htmlGraph, reactGraph.links);
  reactGraph.selected = {};
  reactGraph.hovered = {};
  let counter2 = 0;

  Array.from(htmlGraph).forEach((item, i) => {
    // item.ports = allConnections[i]
    let identifier = `node${i + 1}`;
    // item.name = item.id
    item.id = identifier;

    mytempnodes[identifier] = item;
  });

  reactGraph.nodes = mytempnodes;
  return reactGraph;
}

module.exports = function() {
  this.interpretMerMaid = async (mmdinfo, projectname) => {
    let orgFilename = mmdinfo.filename;
    let thisProjectName = projectname;
    let hellommdc = await generateSvgFromMermaid(orgFilename, thisProjectName).catch(err => {
      console.log(err);
    });
    let reactGraph = await loadGenerateSvg(orgFilename, thisProjectName).catch(
      err => {
        console.log(err);
      }
    );

    // console.log(reactGraph);
    return reactGraph;
  };
};

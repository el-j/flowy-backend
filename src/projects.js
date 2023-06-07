const config = require("../config");
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");

const {promisify} = require("util");
const readdir = promisify(require("fs").readdir);
const writeFile = promisify(require("fs").writeFile);
const readFile = promisify(require("fs").readFile);
const stat = promisify(require("fs").stat);

const projectDirectoryPath = path.join(__dirname, "../public/projects");

require("../models")();
// require("./files")();
require("./mermaid")();

module.exports = function() {
  /*
    Create a new ProjectFolder in the Public Directory
  */
  this.createNewProjectFolder = (projectname, cb) => {
    let tempPath = `public/projects/${projectname}`;
    let thisProject = new Project("name", "path");
    mkdirp(tempPath).then(made => {
      thisProject.projectId = projectname;
      thisProject.name = projectname;
      thisProject.path = made;
      Projects = {[thisProject.projectId]: thisProject, ...Projects};

      // console.log(`made directories, starting with ${made}`)
      cb({made, projectname});
    });
  };

  /*
    Removes a Projectfolder from the Public Directory
  */
  this.removeProjectFolder = (projectname, cb) => {
    let tempPath = `public/projects/${projectname}`;
    rimraf(tempPath, removed => {
      console.log(removed, "done", `removed ${tempPath}`);
      delete Projects[projectname];
      cb(Projects);
    });
  };

  /*
    Get the Project folders as we assume these are the Projects
  */
  this.getProjects = async cb => {
    Projects = [];
    let myProjects = await readdir(projectDirectoryPath);
    myProjects = myProjects.filter(word => word !== ".DS_Store");
    // console.log(myProjects);
    for (var i = 0; i < myProjects.length; i++) {
      let thisProject = new Project();
      thisProject.projectId = myProjects[i];
      thisProject.name = myProjects[i];
      thisProject.description = myProjects[i];
      console.log(myProjects[i]);
      let thisProjectPath = `${projectDirectoryPath}/${thisProject.projectId}`;
      let files = await readdir(thisProjectPath);
      for (let file of files) {
        try {
          let stats = await stat(thisProjectPath + "/" + file);
          if (!file.includes(".DS_Store")) {
            if (stats.isFile()) {
              // console.log(stats)
              thisProject.files.push({
                filename: file.substring(0, file.lastIndexOf(".")),
                type: file.substring(file.lastIndexOf(".") + 1)
              });
            }
          }
        } catch (err) {
          console.log(`${err}`);
        }
      }
      Projects = {[thisProject.projectId]: thisProject, ...Projects};
    }

    console.log("ohha async workes",Projects);
    return cb(Projects);
  };

  /*
    Load a specific Project
  */
  this.loadProject = async (projectname, cb) => {
    let reactGraph = "";
    let myProjects = await getProjects(update => update);
    Projects = myProjects;
    let myProject = Projects[projectname];
    let myfiles = myProject.files;
    let temp = {
      offset: {
        x: 0,
        y: 0
      },
      nodes: {},
      links: {},
      selected: {},
      hovered: {}
    };
    console.log(
      myfiles.includes(file => file.type === "json"),
      myfiles.includes("mmd")
    );
    let myProjectJsons = myfiles.filter(file => file.type === "json");
    let myProjectMmd = myfiles.filter(file => file.type === "mmd");
    let myProjectPictures = myfiles.filter(
      file => file.type !== "mmd" && file.type !== "json"
    );
    if (myProjectJsons.length >= 1) {
      console.log(">>> Project JSON found: ", myProjectJsons[0].filename);
      let newTemp = await readFile(
        `${projectDirectoryPath}/${projectname}/${projectname}.json`,
        "utf-8"
      );
      reactGraph = JSON.parse(newTemp);

      Projects[projectname] = reactGraph;
    } else {
      if (myProjectMmd.length >= 1) {
        console.log(">>> MERMAID input: ", myProjectMmd[0].filename);
        reactGraph = await interpretMerMaid(myProjectMmd[0], projectname);
        Projects[projectname].projectJson = reactGraph;
      } else {
        console.log(">>> new Project with ",myProjectPictures.length, " nodes");
        for (var i = 0; i < myProjectPictures.length; i++) {
          console.log(myProjectPictures[i].type, myProjectPictures[i]);
          tempNodes = await placeholderNodes(
            myProjectPictures[i],
            i,
            projectname,
            myProjectPictures.length
          );
          temp.nodes = {...temp.nodes, ...tempNodes};
        }
        Projects[projectname].projectJson = temp;
      }
    }

    // console.log(Projects[projectname].projectJson);
    cb(Projects[projectname]);
  };

  /*
    Update a specific Project
  */
  this.updateProject = async (projectname, cb) => {
    let reactGraph = "";
    let myProjects = await getProjects(update => update);
    Projects = myProjects;
    let myProject = Projects[projectname];
    let myfiles = myProject.files;
    let temp = {
      offset: {
        x: 0,
        y: 0
      },
      nodes: {},
      links: {},
      selected: {},
      hovered: {}
    };
    console.log(
      myfiles.includes(file => file.type === "json"),
      myfiles.includes("mmd")
    );
    let myProjectJsons = myfiles.filter(file => file.type === "json");
    let myProjectMmd = myfiles.filter(file => file.type === "mmd");
    let myProjectPictures = myfiles.filter(
      file => file.type !== "mmd" && file.type !== "json"
    );
    if (myProjectJsons.length >= 1) {
      console.log(">>> Project JSON found: ", myProjectJsons[0].filename, myfiles);
      let newTemp = await readFile(
        `${projectDirectoryPath}/${projectname}/${projectname}.json`,
        "utf-8"
      );
      reactGraph = JSON.parse(newTemp);
      reactGraph.files = myProjectPictures
      for (var node in reactGraph.projectJson.nodes) {

        if (reactGraph.projectJson.nodes.hasOwnProperty(node)) {
            Object.keys(reactGraph.files).map(file => {
              let tempFilename = reactGraph.files[file].filename.split('-')
              tempFilename = tempFilename.join(' ').toLowerCase();
              let tempNodeName = reactGraph.projectJson.nodes[node].name.toLowerCase();
              console.log(tempFilename,tempNodeName,tempNodeName.indexOf(tempFilename),tempNodeName === tempFilename);
              if (tempNodeName.indexOf(tempFilename) >= 0) {
                console.log(file,node,reactGraph.files[file].filename,reactGraph.projectJson.nodes[node].name);

                reactGraph.projectJson.nodes[node].picture = `${reactGraph.files[file].filename}.${reactGraph.files[file].type}`
                reactGraph.projectJson.nodes[node].path = `${projectname}/${reactGraph.files[file].filename}.${reactGraph.files[file].type}`
              }

            })
        }
      }
      // reactGraph.projectJson.nodes
        console.log("UPDATE GRAPH because json was found",reactGraph.files,reactGraph.projectJson.nodes);
      Projects[projectname] = reactGraph;
      this.writeProjectJson(reactGraph,done => {
         if (done) {
           console.log("updated json file");
         }
         else {
           console.log('could not update json file');
         }
       })
    } else {
      if (myProjectMmd.length >= 1) {
        console.log(">>> MERMAID input: ", myProjectMmd[0].filename);
        reactGraph = await interpretMerMaid(myProjectMmd[0], projectname);
        Projects[projectname].projectJson = reactGraph;
      } else {
        console.log(">>> new Project with ",myProjectPictures.length, " nodes");
        for (var i = 0; i < myProjectPictures.length; i++) {
          console.log(myProjectPictures[i].type, myProjectPictures[i]);
          tempNodes = await placeholderNodes(
            myProjectPictures[i],
            i,
            projectname,
            myProjectPictures.length
          );
          temp.nodes = {...temp.nodes, ...tempNodes};
        }
        Projects[projectname].projectJson = temp;
      }
    }

    // console.log(Projects[projectname].projectJson);
    cb(Projects[projectname]);
  };

  /*
    create placeholderNodes so we do not have an empty project
  */
  let counter = 1;
  let factor = 1;
  this.placeholderNodes = async (file, key, projectname, max) => {
    if (key === 0) {
      factor = 1;
      counter = 1;
    }
    let posX, posY;

    if (counter >= 5) {
      counter = 1;
      factor = factor + 1;
    }
    posY = 300 * factor;
    posX = 340 * counter;
    counter = counter + 1;
    let temp = {
      [`node${key}`]: {
        id: `node${key}`,
        type: "node",
        displayType: "screen",
        picture: `${file.filename}.${file.type}`,
        text: "",
        name: file.filename,
        projectname: projectname,
        path: `${projectname}/${file.filename}.${file.type}`,
        size: {
          width: 300,
          height: 288
        },
        position: {
          x: posX,
          y: posY
        },
        ports: {}
      }
    };
    return temp;
  };


  /*
    Write the created Graph as Json file. this file will be loaded later.
  */
  this.writeProjectJson = async (myProjectJson, cb) => {
    // console.log("yes we have a mermaidfile:",myfiles[i]);
    let thisProjectPath = `${projectDirectoryPath}/${myProjectJson.projectId}/${
      myProjectJson.projectId
    }.json`;
    let output = await writeFile(
      thisProjectPath,
      JSON.stringify(myProjectJson, null, 4),
      "utf8"
    )
      .then(() => {
        console.log("JSON Saved");
        return true;
      })
      .catch(err => {
        console.log(err);
        return false;
      });
    cb(output);
  };
};

let express = require('express'),
    multer = require('multer'),
    // mongoose = require('mongoose'),
    uuidv4 = require('uuid/v4'),
    router = express.Router();

const _ = require('lodash');
const DIR = 'public/projects';

require("./projects.js")();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const projectName = req.params.projectName.slice(1)
      let myDir =`${DIR}/${projectName}`
      cb(null, myDir);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, fileName)
    }
});

var upload = multer({ storage : storage }).any('uploadFiles',200);

router.post('/uploadProjectData/:projectName', (req, res) => {
  console.log("before upload body",req.body);
  upload(req,res,function(err) {
       // console.log("in side upload calbackbody,",req.body);
       Projects[req.body.projectName].files = req.files
       // console.log(req.files,Projects);
       if(err) {
           return res.end("Error uploading file.");
       }
       res.end(JSON.stringify(Projects));
   });
})


router.post('/saveProject/:projectName', (req, res) => {
       Projects[req.body.name] = req.body
       console.log("WE SAVE THE PROJECT:",req.body.projectId);
       let myProjectJson = req.body
       let writeoutput = writeProjectJson(myProjectJson,done => {
          if (done) {
            res.end(JSON.stringify(Projects[req.body.projectId]));
          }
          else {
            res.end(JSON.stringify({err:'err'}));
          }
        })
})

//
// router.get('/printProject/:projectName', (req, res) => {
//        Projects[req.body.name] = req.body
//        console.log("WE PRINT THE PROJECT:",req.body.projectId);
//        let myProjectJson = req.body
//        let writeoutput = writeProjectJson(myProjectJson,done => {
//           if (done) {
//             res.end(JSON.stringify(Projects[req.body.projectId]));
//           }
//           else {
//             res.end(JSON.stringify({err:'err'}));
//           }
//         })
// })

/* Standart Route */
// router.get('/', (req, res) => res.send('Hello World!'))

/* Create new ProjectFolder in public directory */
router.get('/createProject/:projectname', (req, res) => {
    let projectname = req.params.projectname.slice(1)
    console.log("CREATE THE PROJECT: ",projectname);
    res.setHeader('Content-Type', 'application/json');
    createNewProjectFolder(projectname,r => res.send(r))
})

/* get all Projects in public directory */
router.get('/getProjects', (req, res) => {
    getProjects((r) => {
      console.log("WE GOT THESE PROJECTS",Object.keys(r));
      res.send(r)
    })
})

/* Remove ProjectFolder in public directory */
router.get('/removeProject/:projectname', (req, res) => {
let projectname = req.params.projectname.slice(1)
    console.log("REMOVE THE PROJECT: ",projectname);
    removeProjectFolder(projectname,r => res.send(r))
})

/* Create new ProjectFolder in public directory */
// router.post('/uploadProjectData/:projectname', (req, res) => {
//     let projectname = req.params.projectname.slice(1)
//     // console.log("Upload DATA for: ",projectname, " DATA:", req.body);
//     createNewProjectFolder(projectname,r => res.send(r))
// })

/* get all Files from a Folder */
router.get('/getallfiles', (req, res) => {createMyfiles(r=>{
  // console.log(r)
})})


/* reload all files */
router.get('/updateProject/:projectname', (req, res) => {
  let projectname = req.params.projectname.slice(1)
  console.log("we have an update", projectname);
  res.setHeader('Content-Type', 'application/json');
  updateProject(projectname,r => res.send(r))

})
/* reload all files */
router.get('/loadProject/:projectname', (req, res) => {
  let projectname = req.params.projectname.slice(1)
  console.log("we have an update", projectname);
  loadProject(projectname,f=>{
      console.log("project loaded:",f.projectId,f)
      res.send(f)}
    )
})

/* load data of a specific file type */
router.get('/loadfile/:filetype', (req, res) => {
    let filetype = req.params.filetype.slice(1)
    loadfiles(filetype,(f)=>{res.send(f)})
})

/*
OBSOLETE: we handle this by direct frontend-url calls to specific folder
was ment to load png files over the api
*/
router.get('/loadpngs', (req, res) => { loadpngs('png',f=>{
  // console.log(f)
  res.sendFile(f)
}) })

module.exports = router;

const config = require("./config");

const express = require("express"),
  // router = express.Router(),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  // uuidv4 = require('uuid/v4'),
  fileUpload = require("express-fileupload"),
  app = express();

app.use(bodyParser.json({limit: '25mb'}));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '25mb'
  })
);
app.use(
  cors()
  //   {
  //   origin: 'http://locahost:3000',
  //   optionsSuccessStatus: 200
  // }
);

// // enable files upload
// app.use(fileUpload({
//   debug:true
//     // createParentPath: trues
// }));

// require('./src/user.routes.js')()
const api = require("./src/user.routes");
app.use("/api", api);



// require("./src/files.js")();

/*
  Initalise all our projects
*/
getProjects(f => {
  console.log('PROJECTs INITIALISED:',Object.keys(f));
});

/*
 INITIALISE EXPRESS SERVER
 */

appConfig = "http://" + config.app.name + ":" + config.app.port;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", appConfig); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

/*
 let the backend listen to a specific port
*/
app.listen(config.server.port, () =>
  console.log(`SketchMermaid Backend listening on Port: ${config.server.port}!`)
);

/*
 define public as static directory for handle projects and files
*/
app.use(express.static("public"));

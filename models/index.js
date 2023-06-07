

module.exports = function(){

  this.Projects = (function Projects(Project){
    this.Project = Project
  })

  this.Project = (function Project(
    path,
    name,
    projectId,
    description,
    dateCreate,
    sketchfile,
    mmdfile,
    xmlfile,
    files,
    jsonFromXml,
    projectJson,
    previewImg,
    info,
    projectFile
  ){
      this.path = path;
      this.projectId = projectId
      this.name = name;
      this.description = description;
      this.dateCreate = dateCreate;
      this.sketchfile = sketchfile;
      this.mmdfile = mmdfile;
      this.xmlfile = xmlfile;
      this.files = [];
      this.jsonFromXml = jsonFromXml;
      this.projectJson = projectJson;
      this.previewImg = previewImg;
      this.info = info;
      this.projectFile = projectFile;
    })

    this.Item = (function Item(
      type,
      name,
      filename,
      foldername,
      time,
      filetype,
      project,
      data,
      svg
    ){
      this.type=type
      this.name=name
      this.filename=filename
      this.foldername=foldername
      this.time=time
      this.filetype=filetype
      this.project=project
      this.data=data
      this.svg=svg
    })
};
//
//
//
// module.exports = function() {
//
//   this.Projects = []
//
//   this.Project = Project()
//
//

//
//
//   this.myfiles = {
//    currlanguage: 'de_DE',
//    languages: [],
//    png: [],
//    svgs:[],
//    mmd: [],
//    json: [],
//    data: {},
//    table: {
//      header: ['Screename','TextId','Translation','Screenshot'],
//      body: []
//    }
//  }
// }

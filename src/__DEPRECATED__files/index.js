const path = require('path');
const fs = require('fs');

require('../../models')()

module.exports = function() {
/*
  the standart file handling directory path
*/
const directoryPath = path.join(__dirname, '../../public');
const myProjects = []


/*
  load all png files from the directories
*/
this.loadpngs = (cb) => {
  let filetype = 'png'
  // console.log("loadfiles filetype",filetype, myfiles[filetype].length);
  let itemsProcessed = 0;
    myfiles.png.forEach((file,key) => {
      let temp = file.foldername
      if (temp === 'public') {
        temp=`${directoryPath}/${file.name}`
      }
      else if (temp === number) {
        temp=`${directoryPath}/${file.name}`
      }
      else {
        if (temp === 'images') {
          temp=`${directoryPath}/${file.foldername}/${file.name}`
        }
        else {
        temp = `${directoryPath}/images/${file.foldername}/${file.name}`
        }
      }
      // console.log("seee our fucking temp we try everything",temp);

        itemsProcessed++;
        // console.log(itemsProcessed);
        myfiles[filetype][key].data = temp
        if(itemsProcessed === myfiles[filetype].length-1) {
        cb(myfiles[filetype][key].data);

    };
  })
}

/*
  load all files from the myfiles object
*/
this.loadfiles = (filetype,cb) => {
  let itemsProcessed = 0;
    myfiles[filetype].forEach((file,key) => {
      let temp = file.foldername
      // console.log(temp,file);
      if (typeof temp === 'string' || temp instanceof String) {



      if (temp === 'public') {
        temp=`${directoryPath}/${file.name}`
      }
      else {
        if (temp === 'images') {
          temp=`${directoryPath}/${file.foldername}/${file.name}`
        }
        else {
        temp = `${directoryPath}/images/${file.foldername}/${file.name}`
        }
      }
      }
      else {
        temp = `${directoryPath}/${file.name}`
      }
      // console.log("seee our fucking temp we try everything",temp);
      fs.readFile(temp,'utf8', function (err, data) {
        if (err) {
          throw err;
        }
        itemsProcessed++;
        // console.log(itemsProcessed,data);
        myfiles[filetype][key].data = data

        if(itemsProcessed === myfiles[filetype].length) {
          // console.log(myfiles[filetype],itemsProcessed,myfiles[filetype].length);

          if (filetype === 'json') {
            let templang = JSON.parse(myfiles['json'][0].data)
            let keys = Object.keys(templang.data)
            let keys2 = Object.keys(templang.data[keys[0]])
            let keys3 = Object.keys(templang.data[keys[0]][keys2[0]])
            // console.log(templang.data[keys[0]][keys2[0]],keys3);
            myfiles.languages = keys3
          }
          else {

          }

          cb(myfiles);
      }
    });
  })
}


/*
  sort the files and store important inforamtions to the myfiles object
*/
this.sortFile = (file,key,cb) => {
  let thisItem =  new Item()
  // console.log(file,key, thisItem);

  thisItem.name = file
  thisItem.foldername = key
  thisItem.filename = file
  // console.log("seee from sort>>>>>>>>>",path.extname(file).slice(1));

  switch (path.extname(file).slice(1)) {
    case 'mmd':
          thisItem.type = 'mermaid'
          thisItem.filetype='mmd'
          thisItem.time = ''
          thisItem.data = []

    case 'png':
      thisItem.filetype='png'
      let temp
          if (file.includes('[') && file.includes(']')) {
          temp = file.split(']')
          // console.log(temp)
          temp = temp[1].split('_')
          temp = temp[0]
      // console.log("DO WE GET A PROJECT NAME????????>>>>>>>>>>>>>",temp);
        }else {
          temp = file.split('_')

          temp = temp[0]
      }
      // console.log("DO WE GET A PROJECT NAME????????>>>>>>>>>>>>>",temp);
      thisItem.project = temp
      thisItem.type = 'node'
      if (file.includes('Day')  || file.includes('day')) {
        if (file.includes('popup')) {
          // console.log('yes', file, key);
          thisItem.displayType = 'popup'
        }
        else {
          // console.log('no', file, key);
          thisItem.displayType = 'screen'
        }
        thisItem.time = 'day'
      }
      if (file.includes('Night')|| file.includes('night')) {
        if (file.includes('popup') || file.includes('po')) {
          // console.log('yes', file, key);
          thisItem.displayType = 'popup'
        }
        else {
          // console.log('no', file, key);
          thisItem.displayType = 'screen'
        }
        thisItem.time = 'night'
      }
      break;

    case 'svg':
      thisItem.type = 'svgfile'
      thisItem.filetype='svg'
      thisItem.time = 'none'

      break;
    case 'json':
          thisItem.type = 'json'
          thisItem.filetype='json'
          thisItem.time = ''
          thisItem.data = []
      break;
    default:
        thisItem.filetype = 'unknown'
  }
  if (thisItem) {

    myProjects.push(thisItem)
    cb(myProjects)
  }
  // console.log(myfiles);
}


/*
 CreateMyfiles creates the main object for the project and the files for every project
*/
this.createMyfiles = (cb) => {


  readAllFilesInDirectory(directoryPath,(f,r)=>{
  let files = []
  let folders = []
  let myReturnObject = {}
  r.map(myfolder => {
  let split = myfolder.split('/')
  // split = split.shift()
  let thisfolder = split[split.length-2]
  let filename = split[split.length-1]
  // console.log(thisfolder);
    if (!folders.includes(thisfolder)) {
      folders.push(thisfolder)
      myReturnObject[thisfolder] = []
    }
    else {
      myReturnObject[thisfolder].push(filename)
    }
  })
  myfiles['data'] = {...myReturnObject}
  // console.log(myfiles);
  let filenames=myfiles.data

  for (var file2 in filenames) {
    // console.log(file2);
    if (filenames.hasOwnProperty(file2)) {
      // console.log(filenames[file2],file2);
      filenames[file2].map(f => {
        // console.log(f);
      sortFile(f,file2)
      })

    }
  }
  // console.log(myfiles);
  cb(myfiles)
  }
)}
}

module.exports = function() {
this.getAllConnections = async mmd => {
  let temp = mmd; //.join('/n') once i needed it ... strange
  let ttemp = temp.split(/\r?\n/g);
  let allConnections = [];
  // console.log(ttemp);
  ttemp.forEach((ob, key) => {
    let mytemp = ob.split("-->");
    let from, id, to, connectionLabel;
    let port = {};
    let ports = {};
    if (key != 0) {
      from = mytemp[0].replace(/\s/g, "");
      if (from.includes("{")) {
        let temp = from.split("{");
        temp.pop();
        from = temp[0];
      }
      if (from.includes('((')) {
        let temp = from.split("((");
        temp.pop();
        from = temp[0];
      }
      if (from.includes('(')) {
        let temp = from.split("(");
        temp.pop();
        from = temp[0];
      }
      if (from.includes("[")) {
        let temp = from.split("[");
        temp.pop();
        from = temp[0];
      }
      if (mytemp[1]) {
        to = mytemp[1].replace(/\s/g, "");
        if (to.includes("{")) {
          let temp = to.split("{");
          temp.pop();
          to = temp[0];
        }
        if (to.includes('((')) {
          let temp = to.split("((");
          temp.pop();
          to = temp[0];
        }
        if (to.includes('(')) {
          let temp = to.split("(");
          temp.pop();
          to = temp[0];
        }
        if (to.includes("[")) {
          let temp = to.split("[");
          temp.pop();
          to = temp[0];
        }
        if (to.includes("|")) {
          let temp = to.split("|");
          // console.log("label found:",temp);
          connectionLabel = temp[1]
          temp.splice(0, 2);
          to = temp[0];
        }
      }
      if (mytemp.length > 1) {
        // console.log(mytemp, from ,to,id);
        port = {
          from,
          to,
          id,
          connectionLabel
        };
        allConnections.push(port);
      }
    }
  });
  return allConnections;
}}

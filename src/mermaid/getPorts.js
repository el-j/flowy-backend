module.exports = function() {
  this.getPorts = (allConnections, htmlGraph, counter) => {
  let ports = {};
  let portcounter = 1;

  Array.from(allConnections).forEach((node, i) => {
    let from = htmlGraph.filter(thisnode => {
      if (node.from) {
        if (node.from === thisnode.name) {

          return node.from === thisnode.name;
        }
      }
    });

    let to = htmlGraph.filter(thisnode => {
      if (node.to) {
        if (node.to === thisnode.name) {

          return node.to === thisnode.name;
        }
      }
    });

    let id;
    let ob = {};
    if (from.length > 0) {
      if (htmlGraph[counter].id === from[0].id) {
        let portname = portcounter;
        id = `port${portname}`;
        ob = {
          from: node.from,
          to: node.to,
          id,
          type: "output",
          connected: false,
          properties: {value: node.connectionLabel}
        };
        ports[`port${portname}`] = ob;
        // htmlGraph[counter].ports = ob;
        portcounter++;
      }
    }
    if (to.length > 0) {
      if (htmlGraph[counter].id === to[0].id) {
        let portname = portcounter;
        if (htmlGraph[counter].ports.port1) {
          portname = Object.keys(htmlGraph[counter].ports).length + 1;
        }
        id = `port${portname}`;
        ob = {
          from: node.from,
          to: node.to,
          id,
          type: "input",
          connected: false,
          properties: {value: node.connectionLabel}
        };
        ports[`port${portname}`] = ob;
        // htmlGraph[counter].ports = ob;
        portcounter++;
      }
    }
    // if (to.length === 0 && from.length === 0) {
    //   let portname = portcounter;
    //   if (htmlGraph[counter].ports.port1) {
    //     portname = Object.keys(htmlGraph[counter].ports).length + 1;
    //   }
    //   ports[`port${portname}`] = {
    //     from: "nowhere",
    //     to: "nowhere",
    //     id,
    //     type: "nothing",
    //     connected: false,
    //     properties: {value: connection.connectionLabel}
    //   };
    // }
  });

  return ports;
}
}

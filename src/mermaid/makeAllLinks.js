module.exports = function() {

  let links = {};
this.makeAllLinks = (allConnections, tree) => {
  if (Object.keys(links).length >= 1) {
    links = {};
  }
  let from,
    to = [];
  let linkname = 0;
  Array.from(allConnections).forEach((connection, i) => {

    let id = `link${linkname}`;
    let fromType, toType;
    let ob,properties = {}
    let fromDirectionPort,
      toDirectionPort,
      fromNodeId,
      toNodeId,connectionLabel = "";
    let thisOutputNumber = 0;
    let thisInputNumber = 0;

    from = tree.filter(thisConnection => {
      if (connection.from) {
        if (connection.from.includes(thisConnection.name)) {
          if (connection.from === thisConnection.name) {
            console.log(thisConnection.name)
            return connection.from === thisConnection.name;
          }
      }
      }
    });

    to = tree.filter(thisConnection => {
      if (connection.to) {
        if (connection.to.includes(thisConnection.name)) {
        if (connection.to === thisConnection.name) {
          return connection.to  === thisConnection.name

        }
      }
      }
    });

    // console.log(from);
    if (from.length) {
    from = from[0];
    fromNodeId = from.id;

    let outputs = Object.keys(from.ports).filter(thisport => {
      if (from.ports[thisport].type === "output") {
        from.ports[thisport].connected = true
        return from.ports[thisport];
      }
    });

    let allreadyLinkedOutputs = Object.keys(links).filter(link => {
      return links[link].from.nodeId === from.id;
    });


    if (allreadyLinkedOutputs) {
      for (var i = 0; i < allreadyLinkedOutputs.length; i++) {
        if (outputs.indexOf(links[allreadyLinkedOutputs[i]].from.portId) >= 0) {
          thisOutputNumber =
            outputs.indexOf(links[allreadyLinkedOutputs[i]].from.portId) + 1;
        }
      }
    }
    if (outputs[thisOutputNumber] === "undefined") {
      fromDirectionPort = from.ports[outputs[0]].id;
    } else {
      // console.log("outputs-amount:",outputs.length,from.ports)
      if (outputs.length > 0) {
        // console.log("show me the inputs",outputs,thisOutputNumber,from.ports[outputs[thisOutputNumber]].id );
        fromDirectionPort = from.ports[outputs[thisOutputNumber]].id;
      }else {
        // fromDirectionPort = 'no'

      }
    }
    }



    if (to.length) {

    to = to[0];
    toNodeId = to.id;

    let inputs = Object.keys(to.ports).filter(thisport => {
      if (to.ports[thisport].type === "input") {
        to.ports[thisport].connected = true
        return to.ports[thisport];
      }
    });

    let allreadyLinkedInputs = Object.keys(links).filter(link => {
      return links[link].to.nodeId === to.id;
    });

    if (allreadyLinkedInputs) {
      for (var i = 0; i < allreadyLinkedInputs.length; i++) {
        if (inputs.indexOf(links[allreadyLinkedInputs[i]].to.portId) >= 0) {
          thisInputNumber =
            inputs.indexOf(links[allreadyLinkedInputs[i]].to.portId) + 1;
          // break
        }
      }
    }
    if (inputs[thisOutputNumber] === "undefined") {
      toDirectionPort = to.ports[inputs[0]].id;
    } else {
      // console.log("inputs-amount:",inputs.length,to.ports);
      if (inputs.length > 0) {
        // console.log("show me the inputs",inputs,thisInputNumber,to.ports,to.ports[inputs[thisInputNumber]].id);
        toDirectionPort = to.ports[inputs[thisInputNumber]].id;
      }else {
        // toDirectionPort = 'no'

      }
    }
    }

    if (connection.connectionLabel) {
      connectionLabel = connection.connectionLabel
    }
    else {
      connectionLabel = 'none'
    }
    connection.connected = true
    if (Object.keys(from).length > 0 && Object.keys(to).length > 0 && fromDirectionPort != undefined && toDirectionPort != undefined && toNodeId != undefined && fromNodeId!= undefined) {

    ob = {
      id,
      from: {
        nodeId: fromNodeId,
        portId: fromDirectionPort
      },
      to: {
        nodeId: toNodeId,
        portId: toDirectionPort
      },
      properties: {
        label: connectionLabel
      }
    };

    links = {
      ...links,
      [`link${linkname}`]: ob
    };
    linkname = linkname+1
    }
  });
  return links;
}
}

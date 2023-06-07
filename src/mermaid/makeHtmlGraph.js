
module.exports = async function() {

  this.makeHtmlGraph = (projectName,file) => {
  const jsdom = require("jsdom");
  const {JSDOM} = jsdom;

  const window = new JSDOM(file).window;
  const document = window.document;
  const element = document.getElementsByTagName("svg")[0];
  // var mynodes = element.getElementsByClassName("node")
  const mynodes = document.querySelectorAll(".node");
  let htmlGraph = [];
  let counter = 0;
// let mynodes = element.childNodes.getElementsByClassName("node")
// console.log("thefile","the greate dom object",element,"and my nodes",mynodes,mynodes.length);

mynodes.forEach((el, i) => {
  counter = counter + 1;
  let myHtmlnode = {
    id: `node${counter}`,
    type: "",
    displayType: "screen",
    picture: "",
    text: "",
    name: "",
    path: "",
    position: {
      x: 0,
      y: 0,
      transform: "",
      width: 0,
      height: 0
    },
    ports: {}
  };
  let children = el.childNodes;

  Array.from(children).forEach(child => {
    myHtmlnode.name = el.id;

    let mytemp = el.getElementsByTagName("foreignObject");
    mytemp = mytemp[0].getElementsByTagName("div");
    let thistext = mytemp[0].innerHTML;

    myHtmlnode.text = thistext;
    // console.log(myHtmlnode.text,el.getElementsByTagName('tspan'),thistext.length);
    let nodeTransforms = el.getAttribute("transform");
    // console.log(nodeTransforms.substring(10));
    let transFromsToXY = nodeTransforms.substring(10);
    transFromsToXY = transFromsToXY.substring(0, transFromsToXY.length - 1);
    transFromsToXY = transFromsToXY.split(",");
    // console.log(transFromsToXY)
    let temp = nodeTransforms.split(",");
    let first = temp[0] + "px, ";
    let second = temp[1];
    second = second.substring(0, second.length - 1) + "px)";
    nodeTransforms = first + second;

    switch (child.nodeName) {
      case "rect":
        // console.log('have a rect',child);
        myHtmlnode.position.x = Math.abs(child.getAttribute("x"));
        myHtmlnode.position.y = Math.abs(child.getAttribute("y"));
        if (transFromsToXY[0]) {
          myHtmlnode.position.x =
            +myHtmlnode.position.x + +transFromsToXY[0] * 2;
        }
        if (transFromsToXY[1]) {
          myHtmlnode.position.y =
            +myHtmlnode.position.y + +transFromsToXY[1] * 2;
        }
        // console.log(myHtmlnode.position);
        myHtmlnode.position.width = child.getAttribute("width");
        myHtmlnode.position.height = child.getAttribute("height");
        myHtmlnode.position.transform = nodeTransforms;
        myHtmlnode.type = "node";
        myHtmlnode.displayType = "screen";
        myHtmlnode.picture = `${myHtmlnode.name}.png`;
        break;

      case "polygon":
        myHtmlnode.position.x = 0;
        myHtmlnode.position.y = 0;
        if (transFromsToXY[0]) {
          myHtmlnode.position.x =
            +myHtmlnode.position.x + +transFromsToXY[0] * 2;
        }
        if (transFromsToXY[1]) {
          myHtmlnode.position.y =
            +myHtmlnode.position.y + +transFromsToXY[1] * 2;
        }
        myHtmlnode.position.width = 100;
        myHtmlnode.position.height = 100;
        myHtmlnode.position.transform = nodeTransforms + " rotate(45deg)";
        myHtmlnode.type = "node";
        myHtmlnode.displayType = "decision";
        myHtmlnode.picture = `none`;
        break;

        case "circle":
        console.log("found a circle element");
          myHtmlnode.position.x = Math.abs(child.getAttribute("x"));
          myHtmlnode.position.y = Math.abs(child.getAttribute("y"));
          if (transFromsToXY[0]) {
            myHtmlnode.position.x =
              +myHtmlnode.position.x + +transFromsToXY[0] * 2;
          }
          if (transFromsToXY[1]) {
            myHtmlnode.position.y =
              +myHtmlnode.position.y + +transFromsToXY[1] * 2;
          }
          myHtmlnode.position.width = 100;
          myHtmlnode.position.height = 100;
          myHtmlnode.position.transform = nodeTransforms + " rotate(45deg)";
          myHtmlnode.type = "node";
          myHtmlnode.displayType = "point";
          myHtmlnode.picture = `none`;
          break;

      case "g":
        // console.log('have a group', child);
        break;

      default:
    }
    myHtmlnode.path = `${projectName}/${myHtmlnode.name}.png`;
  });
  htmlGraph.push(myHtmlnode);
})
  return htmlGraph
}

}

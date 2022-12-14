function create_map(nodesParam, edgesParam, rootIdParam, formatted) {
  const rootId = rootIdParam
  let nodes = []
  let edges = []
  if (formatted) {
    nodes = nodesParam
    edges = edgesParam
  } else {
    const edgesSplit = edgesParam.split("|")
    const nodesSplit = nodesParam.split("|")
    for (let i = 0; i < edgesSplit.length; i++) {
      let split2 = edgesSplit[i].split("+")
      edges.push({
        source: split2[0],
        target: split2[1]
      })
    }
    for (let i = 0; i < nodesSplit.length; i += 1) {
      // If the node ID is undefined, skip the node
      if (nodesSplit[i] === undefined) {
        continue
      }
      nodes.push({
        id: nodesSplit[i].trim()
      })
    }
  }

  // Iterate backwards through the list of edges
  for (var i = edges.length - 1; i >= 0; i--) {
    // If the edge is a self-loop, remove it
    if (edges[i].source === edges[i].target) {
      edges.splice(i, 1);
    }
  }



  for (let i = 0; i < nodes.length; i += 1) {
    nodes[i]['collapsed'] = nodes[i].id !== rootId
    nodes[i]['childLinks'] = []
    nodes[i]['previousX'] = -1
    nodes[i]['previousY'] = -1
    nodes[i]['colorParam'] = ''
  }
  const gData = {
    nodes: nodes,
    links: edges
  }
  const nodesById = Object.fromEntries(gData.nodes.map(node => [node.id, node]));
  gData.links.forEach(link => {
    nodesById[link.source].childLinks.push(link);
  });
  const getPrunedTree = () => {
    const visibleNodes = [];
    const visibleLinks = [];
    (function traverseTree(node = nodesById[rootId]) {
      visibleNodes.push(node);
      if (node.collapsed) return;
      visibleLinks.push(...node.childLinks);
      node.childLinks
        .map(link => ((typeof link.target) === 'object') ? link.target : nodesById[link.target]) // get child node
        .forEach(traverseTree);
    })(); // IIFE

    return { nodes: visibleNodes, links: visibleLinks };
  };
  function textSplitter(text) {
    // initialize final array
    var finalArray = [''];
    // Split the text into an array
    var textArray = text.split(" ");
    // Loop through the array
    let positionInFinalArray = 0
    for (var i = 0; i < textArray.length; i++) {
      // If the word is longer than 10 characters
      const lenCurrentWord = textArray[i].length
      const lenCurrentPositionInFinalArray = finalArray[positionInFinalArray].length
      // If the length of the current position is under 16, considering adding the current word
      if ((lenCurrentPositionInFinalArray + lenCurrentWord) < 15) {
        // Add the word to the current position
        finalArray[positionInFinalArray] += textArray[i] + " ";
      } else {
        // Add the word to the next position
        positionInFinalArray += 1
        finalArray[positionInFinalArray] = textArray[i] + " ";
      }
    }
    for (let i = 0; i < finalArray.length; i += 1) {
      finalArray[i] = finalArray[i].trim()
    }
    return finalArray;
  }
  function drawFunction({ id, x, y, childLinks, colorParam }, color, ctx) {
    // const textList = id.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,2}\b/g);
    const textList = textSplitter(id)
    var line_height = 5
    const numChildren = childLinks.length;

    // Draw the node. White fill and back ground
    ctx.beginPath();
    ctx.fillStyle = '#EDFDFF';

    ctx.arc(x, y, 19, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();



    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '4px Arial';
    ctx.fillStyle = 'black';
    const numLines = textList.length
    for (let i = 0; i < textList.length; i += 1) {
      if (numLines > 1) {
        ctx.fillText(textList[i], x, (y + (i * line_height) - (numLines / 3 * line_height)));
      } else {
        ctx.fillText(textList[i], x, y);
      }

    }
  }
  // Get the center of the div with id "graph"
  const graphDiv = document.getElementById('competitorsGraph')
  const graphDivWidth = graphDiv.offsetWidth
  const graphDivHeight = graphDiv.offsetHeight
  const graphDivCenterX = graphDivWidth / 2
  const graphDivCenterY = graphDivHeight / 2
  const elem = document.getElementById('competitorsGraph');
  const Graph = ForceGraph()(elem)
    .graphData(getPrunedTree())
    .nodeCanvasObject((node, ctx) => drawFunction(node, 'color', ctx))
    .onNodeHover(node => elem.style.cursor = node && node.childLinks.length ? 'pointer' : null)
    .height(window.innerHeight - 60)
  Graph.d3Force('charge', d3.forceManyBody().strength(-450))
  Graph.onNodeClick((node) => {
    console.log(node)
    const domain = node.id
    // Open domain in a new tab
    window.open(`https://www.${domain}`, '_blank');
  })
  elementResizeDetectorMaker().listenTo(
    document.getElementById('competitorsGraph'),
    el => Graph.width(el.offsetWidth)
  );


  // Get the center of the graph
  // Graph.centerAt(graphDivCenterX, graphDivCenterY, 0)
  setTimeout(() => Graph.zoomToFit(400, 150), 500);
}
function formatNodesEdges(root, competitors) {
  const nodes = competitors.split(",").map((competitor) => {
    return { "id": competitor.trim() }
  })
  // Add the root node
  nodes.push({ "id": root })
  const edges = competitors.split(",").map((competitor) => {
    return { "source": root, "target": competitor.trim() }
  })
  return { nodes, edges }
}

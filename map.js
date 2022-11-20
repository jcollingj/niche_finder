<script>
function create_map(nodesParam, edgesParam, rootIdParam, formatted) {
  const rootId = rootIdParam
  let nodes = []
  let edges = []
  if (formatted) {
    nodes = nodesParam
    edges = edgesParam
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
    if (numChildren === 0) {
      ctx.fillStyle = 'grey';
    } else if (colorParam.length > 0) {
      ctx.fillStyle = colorParam;
    } else {
      ctx.fillStyle = 'white';
    }

    ctx.arc(x, y, 17, 0, 2 * Math.PI);
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
  const elem = document.getElementById('graph');
  const Graph = ForceGraph()(elem)
    .graphData(getPrunedTree())
    .nodeCanvasObject((node, ctx) => drawFunction(node, 'color', ctx))
    .onNodeHover(node => elem.style.cursor = node && node.childLinks.length ? 'pointer' : null)
  // Call back function that prints the event
  // .linkDirectionalParticles(1)
  // .linkDirectionalParticleWidth(2.5)
  // .nodeColor(node => !node.childLinks.length ? 'green' : node.collapsed ? 'red' : 'yellow');
  // This works but is horribly not smooth
  // Graph.d3Force('collide', d3.forceCollide(30))
  Graph.d3Force('charge', d3.forceManyBody().strength(-300))
  // Create a new link force that shortens the link distance
  // const linkForce = d3.forceLink().distance(100)
  // Add the link force to the graph
  // Graph.d3Force('link', linkForce)
  Graph.onNodeClick((node) => {
    if (node.childLinks.length) {
      node.collapsed = !node.collapsed; // toggle collapse state
      if (node.collapsed === false) {
        node.fx = null
        node.fy = null
        node.previousX = node.x
        node.previousY = node.y
        node.colorParam = '#f2f2f2'
      } else if (node.collapsed === true && node.previousX !== -1 && node.previousY !== -1) {
        // node.x = node.previousX
        // node.y = node.previousY
        node.fx = node.previousX
        node.fy = node.previousY
        node.colorParam = '#f2f2f2'
      }
      Graph.graphData(getPrunedTree());

      // Wait half a second and then get the new x/y coordinates
      setTimeout(() => {
        Graph.centerAt(node.x, node.y, 500)
        node.fx = null
        node.fy = null

      }, 500)
    }
  })
  Graph.zoom(2.5, 750)
}
</script>
// export {create_map}

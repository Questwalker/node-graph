function uuidv4() {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    )
}
function randRange(min, max) {
    return Math.random() * (max - min) + min
}
var nodeReferences = {
}

// Function for parsing strings into groups separated by spaces. Obeys quotes and escaped characters, more or less a simplified arg parser
function parseString(string) {
    argList = []
    stringBuilder = ''
    escaping = false
    inside_quote = '' // '' if none, a character otherwise
    // Loop through string
    for (let i = 0; i < string.length; i++) {
        const char = string[i]
        if (stringBuilder == '' && char == ' ') continue // skip extra whitespace in and around text
        if (escaping) {
            if (char == '\\') {
                stringBuilder += '\\'
            } else if (char == "'" || char == '"') {
                stringBuilder += char
            } else {
                stringBuilder += '\\' + char
            }
            escaping = false
        } else if (char == ' ' && inside_quote == '') {
            // Close string
            if (stringBuilder != '') {
                argList.push(stringBuilder)
                stringBuilder = ''
            }
        } else if (inside_quote && char == inside_quote) {
            // Exit quote
            inside_quote = ''
        } else {
            if (!inside_quote && (char == "'" || char == '"')) {
                // Enter quote
                inside_quote = char
            } else if (char == '\\') {
                escaping = true
            } else {
                stringBuilder += char
            }
        }
    }
    // Close string
    if (stringBuilder != '') {
        argList.push(stringBuilder)
        stringBuilder = ''
    }
    return argList
}

// Read the text box and update the node graph
function updateNodes() {
    let nodeList = []
    let nodeLinks = {}
    databox.value.trim().split(/\r?\n/).forEach(element => {
        // loop for each line in the text box
        let res = parseString(element.trim())
        if (res == []) return;
        let [sourceNodeName, destinationNodeName] = res
        nodeList.push(...res.slice(0, 2))

        if (sourceNodeName != undefined && nodeLinks[sourceNodeName] == undefined) {
            nodeLinks[sourceNodeName] = []
        }

        if (sourceNodeName != undefined && destinationNodeName != undefined) {
            nodeLinks[sourceNodeName].push(destinationNodeName)
        }
    })
    let nodeListSet = new Set(nodeList)
    let nodeReferencesSet = new Set(Object.keys(nodeReferences))

    // Calculate nodes that have disappeared and have appeared
    let newNodes = nodeListSet.difference(nodeReferencesSet)
    let goneNodes = nodeReferencesSet.difference(nodeListSet)

    // Create Nodes
    for (const nodeName of newNodes) {
        console.log(`+ Creating node ${nodeName}`)
        let nodeUID = uuidv4()
        nodeReferences[nodeName] = {
            uid: nodeUID,
            links: {}
        }
        nodes.update({ id: nodeUID, label: nodeName, x: randRange(-200, 200), y: randRange(-200, 200) })
    }

    // Create Links
    for (const [nodeName, linkList] of Object.entries(nodeLinks)) {
        console.log(nodeName, nodeReferences[nodeName])
        let nodeUID = nodeReferences[nodeName].uid
        linkList.forEach(destinationNode => {
            // Create a new link
            if (nodeReferences[nodeName].links[destinationNode] == undefined) {
                // If link doesn't exist
                let linkUID = uuidv4()
                let destinationUID = nodeReferences[destinationNode].uid
                console.log(`Linking ${nodeName} to ${destinationNode}`)
                edges.update({ id: linkUID, from: nodeUID, to: destinationUID })
                nodeReferences[nodeName].links[destinationNode] = linkUID

            }
        })
    }

    // Delete Nodes
    for (const nodeName of goneNodes) {
        console.log(`- Deleting node ${nodeName}`)
        let nodeUID = nodeReferences[nodeName].uid

        // Delete Node
        nodes.remove(nodeUID)
        delete nodeReferences[nodeName]
    }

    let currentNodeLinksSet = new Set(nodeList)
    let newNodeLinksSet = new Set(Object.keys(nodeLinks))

    for (const [nodeName, destinationNode] of Object.entries(nodeLinks)) {
        console.log(Object.keys(nodeReferences[nodeName].links))
        console.log(nodeLinks[nodeName])
    }

    console.log('')
}

// Listen for inputs to the textbox and process them if no characters have been pressed in the last 0.2 seconds
var delay = (function () {
    var timer = 0
    return function (callback, ms) {
        clearTimeout(timer)
        timer = setTimeout(callback, ms)
    }
})()
databox.addEventListener('input', event => {
    delay(updateNodes, 200)
})

var nodes = new vis.DataSet([
])

var edges = new vis.DataSet([
])

var data = {
    nodes: nodes,
    edges: edges
}
var options = {
    edges: {
        arrows: {
            to: true,
            // middle: true,
            // from: true
        }
    },
    nodes: {
        shape: 'box'
    },
    physics: {
        repulsion: {
            // damping: 1
        }
    }
}

var network = new vis.Network(graphcontainer, data, options)

updateNodes()


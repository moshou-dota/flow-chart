import dagreD3 from 'dagre-d3'
import * as d3 from 'd3'
import './index.css'
const edgeInput = document.getElementById('edgeCount')
const nodeInput = document.getElementById('nodeCount')
var flowData = [
  {
    clomn:['$duration', 'count'],
    name: 'HR 审批',
    $parent: '上级审批',
    value: [10, 1],
  },
  {
    clomn:['$duration', 'count'],
    name: '中级审批',
    $parent: '提交',
    value: [10, 1],
  },
  {
    clomn:['$duration', 'count'],
    name: 'HR 审批',
    $parent: '提交',
    value: [10, 1],
  },
  {
    clomn:['$duration', 'count'],
    name: 'HR 审批',
    $parent: '中级审批',
    value: [10, 1],
  },
  {
    clomn:['$duration', 'count'],
    name: 'HR 审批',
    $parent: '直接领导审批',
    value: [20, 3],
  },
  {
    clomn:['$duration', 'count'],
    name: '提交',
    $parent: '提交',
    value: [0, 5],
  },
  {
    clomn:['$duration', 'count'],
    name: '上级审批',
    $parent: '提交',
    value: [60, 3],
  },
  {
    clomn:['$duration', 'count'],
    name: '直接领导审批',
    $parent: '提交',
    value: [30, 2],
  },
]

var g = new dagreD3.graphlib.Graph().setGraph({});
var nodeMap = {}
var nodeLink = []
function formatData (data) {
  // 注意: JSON.parse(JSON.stringify(data))具有循环引用的对象时，报错. 当值为函数、undefined、或symbol时，无法拷贝
  if (!data || !data.clomn || !Array.isArray(data.clomn)) return data && JSON.parse(JSON.stringify(data)) || {}
  let result = {
    name: data.name || '',
    $parent: data.$parent || '',
  }
  data.clomn.forEach((key, index) => {
    result[key] = data.value && data.value[index] || ''
  })
  return result
}
function setNode (node) {
  g.setNode(node.name, {
    class: 'flow-node',
    rx: 10,
    ry: 10,
    paddingX: 10,
    paddingY: 5,
    // label: `${node.name}(${node.count})`,
    labelType:"html",
    label: `<div style="display: flex;align-items: center;justify-content: center;"><i class="icon-account"></i><p style="padding:0 4px;margin:0;">${node.name}(${node.count})</p></div>`,
    // label: `<g width="100"><image xlink:href="data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7" x="0" y="0" height="10" width="10" /></i><text x="250" y="150">${node.name}(${node.count})</text></g>`,
  })
}
function setLink (link) {
  g.setEdge(link.source, link.target, link.option)
}
flowData.forEach(node => {
  let {name, $parent, $duration, count} = formatData(node)
  if (nodeMap[name]) {
    nodeMap[name].count = nodeMap[name].count + count
  } else {
    nodeMap[name] = {name, count}
  }
  if (name) {
    if (name !== $parent) {
      nodeLink.push({
        source: $parent,
        target: name,
        option: {
          label: `${$duration}`,
        }
      })
    }
    setNode(nodeMap[name])
  }
})
nodeLink.forEach(link => {
  setLink(link)
})

var render = new dagreD3.render();
var svg = d3.select("svg")
var inner = svg.select('g')
render(inner, g); //渲染节点

var zoom = d3.zoom().on("zoom", function () { //添加鼠标滚轮放大缩小事件
  inner.attr("transform", d3.event.transform);
});
svg.call(zoom);

// svg 元素整体居中显示和元素缩放
var initialScale = 1;
svg.call(zoom.transform, d3.zoomIdentity.translate((svg.attr("width") - g.graph().width * initialScale) / 2, (svg.attr("height") - g.graph().height * initialScale) / 2).scale(initialScale));
// var scaleData = 1
window.zoomCtrl = function (status) {
  var scale = status? 1.2: 0.8
  initialScale *= scale
  zoom.scaleBy(svg, scale)
  // svg.call(zoom.transform, d3.zoomIdentity.translate((svg.attr("width") - g.graph().width * initialScale) / 2, (svg.attr("height") - g.graph().height * initialScale) / 2).scale(initialScale));
}

function removeNode (name) {
  becomeOrigin()
  g.removeNode(name);
}
function addNode (name) {
  becomeOrigin()
  setNode(nodeMap[name])
  nodeLink.forEach(link => {
    if (link.source === name || link.target === name) {
      setLink(link)
    }
  })
}
window.addNodeFunc = function (name) {
  addNode(name)
  render(inner, g);
}
window.removeNodeFunc = function (name) {
  removeNode(name)
  render(inner, g);
}

function removeEdge (link) {
  if(!link) return
  becomeOrigin()
  g.removeEdge(link.source, link.target)
  let i;
  if (!(i = g.nodeEdges(link.source)) || !i.length) {
    removeNode(link.source)
  }
  if (!(i= g.nodeEdges(link.target)) || !i.length) {
    removeNode(link.target)
  }
}
function addEdge (link) {
  if(!link) return
  becomeOrigin()
  if (!g.node(link.source)) {
    addNode(link.source)
  }
  if (!g.node(link.target)) {
    addNode(link.target)
  }
  setLink(link)
}

window.changeEdge = function changeEdge () {
  let val = edgeInput.value;
  nodeLink.forEach(link => {
    if (link.option && +link.option.label >= +val) {
      addEdge(link)
    } else {
      removeEdge(link)
    }
  })
  render(inner, g);
}
window.changeNode = function changeNode () {
  // svg.selectAll().remove()
  let val = nodeInput.value;
  Object.keys(nodeMap).forEach(nodeName => {
    if (nodeMap[nodeName].count >=val) {
      addNode(nodeName)
    } else {
      removeNode(nodeName);
    }
  })
  // svg.selectAll().remove()
  render(inner, g);
}

function becomeOrigin () {
  console.log('initialScale', initialScale)
  if (initialScale < 1) {
    zoom.scaleBy(svg, 1/initialScale)
    initialScale = 1
  }
  // while (initialScale < 1) {
  //   zoomCtrl(true)
  // }
}
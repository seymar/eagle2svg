const xml2js = require('xml2js')
const parseXML = xml2js.parseString;
const XML = require('xml')
const fs = require('fs')

const scale = (v) => 10 * v;

function parsePackage(x, y, r, package) {
  let svg = [{
    _attr: {
      transform: 'translate(' + scale(x) + ', ' + scale(y) + ') rotate(' + r + ')'
    }
  }];

  // Draw origin
  svg.push({
    line: [
      {
        _attr: {
          x1: -5,
          y1: 0,
          x2: 5,
          y2: 0,
          style: 'stroke-width: 1;stroke:black'
        }
      }
    ]
  });
  svg.push({
    line: [
      {
        _attr: {
          x1: 0,
          y1: -5,
          x2: 0,
          y2: 5,
          style: 'stroke-width: 1;stroke:black'
        }
      }
    ]
  });

  let holes = []

  // Draw wires
  package.wire.forEach((wire) => {
    svg.push({
      line: [
        {
          _attr: {
            x1: scale(wire.$.x1),
            y1: scale(wire.$.y1),
            x2: scale(wire.$.x2),
            y2: scale(wire.$.y2),
            style: 'stroke-width: 1;stroke:rgb(0, 0, 0)'
          }
        }
      ]
    });
  })

  if(typeof package.polygon != 'undefined') {
    package.polygon.forEach((polygon) => {
      svg.push({
        polygon: [
          {
            _attr: {
              points: polygon.vertex.map((v) => scale(v.$.x) + ' ' + scale(v.$.y)).join(' '),
              style: 'fill:red;stroke-width:0'
            }
          }
        ]
      });
    })
  }

  if(typeof package.pad != 'undefined') {
    package.pad.forEach((pad) => {
      switch(pad.$.shape) {
        case 'octagon':
          svg.push({
            circle: [
              {
                _attr: {
                  cx: scale(pad.$.x),
                  cy: scale(pad.$.y),
                  r: 2*scale(pad.$.drill)/2,
                  style: 'fill:green;stroke-width:0'
                }
              }
            ]
          });
          holes.push({x: pad.$.x, y: pad.$.y, d: pad.$.drill})
          break;
        case 'long':
          svg.push({
            circle: [
              {
                _attr: {
                  cx: scale(pad.$.x),
                  cy: scale(pad.$.y),
                  r: 2*scale(pad.$.drill)/2,
                  style: 'fill:green;stroke-width:0'
                }
              }
            ]
          });
          holes.push({x: pad.$.x, y: pad.$.y, d: pad.$.drill})
          break;
        default:
          svg.push({
            circle: [
              {
                _attr: {
                  cx: scale(pad.$.x),
                  cy: scale(pad.$.y),
                  r: scale(pad.$.diameter)/2,
                  style: 'fill:green;stroke-width:0'
                }
              }
            ]
          });
          holes.push({x: pad.$.x, y: pad.$.y, d: pad.$.diameter})
          break;
      }

      // Hole
      if(typeof pad.$.drill !== 'undefined') {
        svg.push({
          circle: [
            {
              _attr: {
                cx: scale(pad.$.x),
                cy: scale(pad.$.y),
                r: scale(pad.$.drill)/2,
                style: 'fill:blue;stroke-width:0'
              }
            }
          ]
        });
        holes.push({x: pad.$.x, y: pad.$.y, d: pad.$.drill})
      }
    })
  }

  svg = {
    g: svg
  }
  
  return {svg, holes}
}


module.exports = function(xmlString, callback) {
  parseXML(xmlString, function (err, result) {
    const drawing = result.eagle.drawing[0];
    const board = drawing.board[0];

    let svg = [
      {
        _attr: {
          xmlns: 'http://www.w3.org/2000/svg',
          width: 1000,
          height: 1000 
        }
      }
    ];

    const libraries = board.libraries[0].library;
    const byName = (arr, name) => arr.filter((el) => el.$.name == name)[0]

    let holes = []

    let maxCoordinate = {x: 0, y: 0};

    // Loop through components
    board.elements[0].element.forEach((element) => {
      const libraryName = element.$.library;
      const packageName = element.$.package;

      const lib = byName(libraries, libraryName)
      const pkgs = lib.packages[0].package
      const pkg = byName(pkgs, packageName);
      
      let rotation = element.$.rot || 'R0';
          rotation = parseFloat(rotation.substr(1))
      
      const parsedPackage = parsePackage(parseFloat(element.$.x), parseFloat(element.$.y), rotation, pkg)
      
      svg.push(parsedPackage.svg)
      
      holes = [...holes, ...parsedPackage.holes]
    })

    // Create SVG XML
    const xml = XML([
      {
        svg: svg
      }
    ], { declaration: true, indent: '\t' });

    callback(xml)
  });
}
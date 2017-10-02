const xml2js = require('xml2js')
const parseXML = xml2js.parseString;
const XML = require('xml')
const fs = require('fs')

const scale = (v) => 10 * v;

function svgPackage(x, y, r, package) {
  let svg = [{
    _attr: {
      transform: 'translate(' + scale(x) + ', ' + scale(y) + ');'//rotate(' + r + ', ' + scale(x) + ', ' + scale(y) + ')'
    }
  }];

  // Draw origin
  svg.push({
    line: [
      {
        _attr: {
          x1: scale(x)-5,
          y1: scale(y),
          x2: scale(x)+5,
          y2: scale(y),
          style: 'stroke-width: 1;stroke:black'
        }
      }
    ]
  });
  svg.push({
    line: [
      {
        _attr: {
          x1: scale(x),
          y1: scale(y)-5,
          x2: scale(x),
          y2: scale(y)+5,
          style: 'stroke-width: 1;stroke:black'
        }
      }
    ]
  });

  // Draw wires
  package.wire.forEach((wire) => {
    svg.push({
      line: [
        {
          _attr: {
            x1: wire.$.x1,
            y1: wire.$.y1,
            x2: wire.$.x2,
            y2: wire.$.y2,
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
                style: 'fill:white;stroke-width:0'
              }
            }
          ]
        });
      }
    })
  }

  //console.log(package.smd)

  svg = {
    g: svg
  }
  
  return svg;
}


module.exports = function(xmlString) {
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

    // Loop through components
    board.elements[0].element.forEach((element) => {
      //console.log(element.$);
      const libraryName = element.$.library;
      const packageName = element.$.package;

      const lib = byName(libraries, libraryName)
      const pkgs = lib.packages[0].package
      const pkg = byName(pkgs, packageName);
      
      svg.push(svgPackage(parseFloat(element.$.x), parseFloat(element.$.y), parseFloat(element.$.rot), pkg))
    })

    // Create SVG XML
    const xml = XML([
      {
        svg: svg
      }
    ], { declaration: true, indent: '\t' });
    fs.writeFileSync('image.svg', xml)
  });
}

var example4 = [
  {
    toys: [
      {
        _attr: {
          decade: '80s',
          locale: 'US'
        }
      },
      { 
        toy: 'Transformers'
      },
      {
        toy: 'GI Joe'
      },
      {
        toy: 'He-man'
      }
    ]
  }
];

//console.log(XML(example4, true));
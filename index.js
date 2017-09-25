const xml2js = require('xml2js')
const parseXML = xml2js.parseString;
const XML = require('xml')
const fs = require('fs')

const scale = (v) => 25.4 * v;

function svgPackage(x, y, package) {
  let svg = [{
    _attr: {
      transform: 'translate(' + scale(x) + ', ' + scale(y) + ')'
    }
  }];

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
            style: 'stroke-width:' + scale(wire.$.width) + ';stroke:rgb(0, 0, 0)'
          }
        }
      ]
    });
  })

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

      svg.push(svgPackage(parseFloat(element.$.x), parseFloat(element.$.y), pkg))
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
const xml2js = require('xml2js')
const parseXML = xml2js.parseString;

const scale = (v) => 2.54 * v;

function svgPackage(package) {
  const svgPkg = {
    line: []
  };

  // Draw wires
  package.wire.forEach((wire) => {
    svgPkg.line.push({
      //$: {
        x1: wire.$.x1,
        y1: wire.$.y1,
        x2: wire.$.x2,
        y2: wire.$.y2,
        style: 'stroke-width:' + scale(wire.$.width)
      //}
    });
  })

  return svgPkg;
}

module.exports = function(xmlString) {
  parseXML(xmlString, function (err, result) {
    const drawing = result.eagle.drawing[0];
    const board = drawing.board[0];

    const svgB = new xml2js.Builder();

    const libraries = board.libraries[0].library;
    const byName = (arr, name) => arr.filter((el) => el.$.name == name)[0]
    
    //console.log()

    // Loop through components
    board.elements[0].element.forEach((element) => {
      //console.log(element.$);
      const libraryName = element.$.library;
      const packageName = element.$.package;

      const lib = byName(libraries, libraryName)
      const pkgs = lib.packages[0].package
      const pkg = byName(pkgs, packageName);
      
      svg.g.push(svgPackage(pkg))
    })

    // Create SVG XML
    var xml = builder.buildObject(svg);

    console.log(xml);
  });
}

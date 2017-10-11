const fs = require('fs')
const Path = require('path')
var eagle2svg = require('../index.js')

const path = './test/Controlboard/main.brd';

// Get extension for future use
const pathInfo = Path.parse(path)

// Check file  type
const fileBuffer = fs.readFileSync(path)
const fileString = fileBuffer.toString()
	
// Check if Eagle .brd file
if(pathInfo.ext == '.brd') {
  eagle2svg(fileString, {
  	width: 80,
  	height: 60
  })
  .then((bfr) => {
    const thumbPath = './temp/test.svg';
    
	fs.writeFile(thumbPath, bfr, (a, b) => {
		console.log('done')
	})
  })
  .catch((err) => {
  	console.error(err)
  	throw err
  })
}
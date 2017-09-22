'use strict'

var expect = require('chai').expect
var fs = require('fs')

var eagleToSVG = require('../index.js')

fs.readFile('./test/Testboard/Testboard.brd', (fserr, fsdata) => {
	const xmlString = fsdata.toString();
	
	var result = eagleToSVG(xmlString);
})
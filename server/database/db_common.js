"use strict";
//This is the common driver code file 
//  For code that is better as a single block with limited dialect switches and variables


var db = require("../../server/database/DatabasePool");
var fs = require('fs');
//var Sync = require('sync');
var deasync = require('deasync');
var deasync_const=5; 

var connection = {};
var deepcopy = require('deepcopy');

	 


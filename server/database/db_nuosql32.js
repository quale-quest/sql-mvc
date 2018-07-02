"use strict";
//will / should be split into one per database

var db = require("../../server/database/DatabasePool");
var fs = require('fs');
//var Sync = require('sync');
var deasync = require('deasync');
var deasync_const=5; 

var connection = {};
var deepcopy = require('deepcopy');

	 


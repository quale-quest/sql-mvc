"use strict";
/*jshint node: true */

var fs = require('fs');
var gaze = require('gaze');
var delayTime = 200;
var guardTime = 5000;

var lastRun = {
	at : Date.now()
};

var filelist = [];

exports.gaze_start = function (onChange) {
	console.log('gaze start...:');
	gaze('Quale/**/*.quicc', function (err, watcher) {

		// On changed/added/deleted
		this.on('all', function (event, filepath) {
			filelist.push(filepath);
            //console.log('sending changed list...:', event,filepath);
            if ( filepath.match(/killserver.quicc/)) {
                console.log('Sever killed by drop file:', event,filepath);
                process.exit(0);//correct this must kill the program
            }
                 
			//remove existing timers
			if (lastRun.delayTime) {
				clearTimeout(lastRun.delayTime);
			}
			//Guard time had lapsed
			if ((Date.now() - lastRun.at) > guardTime) {
				lastRun.State = 0;
			}
			//Delay timer
			if (!lastRun.State)
				lastRun.delayTime = setTimeout(function () {
						//console.log('sending changed list...:', filelist);
                        if (onChange)
                          onChange(filelist);
						filelist = [];
						lastRun.State = 1;
						lastRun.at = Date.now();
					}, delayTime);

		});

	});

	console.log('gazing...:');
}

//exports.gaze_start();


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

exports.gaze_start = function () {
	console.log('gaze start...:');
	gaze('Quale/**/*.quicc', function (err, watcher) {

		// On changed/added/deleted
		this.on('all', function (event, filepath) {
			filelist.push(filepath);

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
						console.log('sending changed list...:', filelist);
						filelist = [];
						lastRun.State = 1;
						lastRun.at = Date.now();
					}, delayTime);

		});

	});

	console.log('gazing...:');
}

exports.gaze_start();


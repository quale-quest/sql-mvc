"use strict";

var Busboy = require('busboy'),
temp = require('temp'),
path = require('path'),
os = require('os');
var fs = require('fs');

// giving server side progress acorss AJAX is trouble some, so we rather use rpc's
//      http://stackoverflow.com/questions/6258210/how-can-i-output-data-before-i-end-the-response
//      Chrome requires the 1st chunk to be at least 1k then upcoming chunks can be smaller than that.//http://stackoverflow.com/questions/16184103/how-to-flush-chunks-of-arbitrary-sizes-in-nodejs


exports.ajax_upload_with_rpc_feedback = function (req, res) {
	console.log('req.url    : ', req.url);
	console.log('req.method : ', req.method, req.url);
	console.log('req.file : ', req.file);
	console.log('req.files : ', req.files);
	console.log('req.form : ', req.form);

	if ('POST' !== req.method)
		return false;
    var ref='';

	var busboy = new Busboy({
			headers : req.headers
		});
	busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
		console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        //what to call the file and where to put is - we cannot eccept the user's file name as is, it may conflict
        
        var tempName = temp.path({suffix: '.tmp'});
        
		//var saveTo = path.join('/tmp/', path.basename(fieldname));
		console.log('saveTo :' + tempName);
		file.pipe(fs.createWriteStream(tempName));

		file.on('data', function (data) {
			//console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
		});
		file.on('end', function () {
			console.log('File [' + fieldname + '] Finished');
		});
	});
	busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
		console.log('Field [' + fieldname + ']: value: ' + (val));
        if (fieldname==='ref') ref=val;
	});
	busboy.on('finish', function () {
		console.log('Done parsing form!');
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('{"message": "Server Complete"}');        
		res.end();
        
        //now what to do with the file (the quicc application will tell us) ....
            // move it somewere safe..
            // move it somewhere public
            // put it in the database (as a blob)
            // process it into the databse
                 //  as a csv, xls, vcard
                 //  as a custom translation
        //this should be handled by some plugin
        //  minimum internal should be move,blob,
        
        //select x from pk_field where ref=ref;
        
        

	});
	req.pipe(busboy);

	return true
};
/*
some v-card code
exports.FileUpload = function (file, user) {
	var fs;
	fs = require('fs');
	return fs.readFile(file.path, 'ascii', function (err, data) {
		var c,
		client,
		clientsData,
		csv,
		f,
		i,
		names,
		suffix,
		type,
		v,
		v2,
		value,
		_i,
		_len,
		_results;
		if (err) {
			throw err;
		}
		suffix = file.name.split('.').pop();
		if (suffix.toLowerCase() === 'vcf' || suffix.toLowerCase() === 'vcard') {
			_results = [];
			/*
			clientsData = vCardToJSON(data);

			for (_i = 0, _len = clientsData.length; _i < _len; _i++) {
			c = clientsData[_i];
			client = {
			user_id: user.id,
			account_id: user.account_id
			};
			for (f in c) {
			value = c[f];
			if (typeof value === 'object') {
			for (type in value) {
			v = value[type];
			if (typeof v === 'object') {
			for (i in v) {
			v2 = v[i];
			if (f === 'email') {
			client.email = v2;
			} else if (f === 'tel') {
			if (client.phone) {
			client.phone2 = v2;
			} else {
			client.phone = v2;
			}
			}
			}
			} else {
			if (f === 'email') {
			client.email = v;
			} else if (f === 'tel') {
			client.phone = v;
			}
			}
			}
			} else {
			if (f === 'fn') {
			names = value.split(' ');
			if (names.length === 1) {
			client.first_name = names[0];
			} else {
			client.last_name = _.last(names);
			client.first_name = _.first(names, names.length - 1).join('');
			}
			}
			}
			}
			_results.push(addClient(client));
			}
			 * /
			return _results;
		} else {

			/*
			csv = require('csv');
			return csv().fromPath(path, {
			columns: true
			}).on('data', function(data, index) {
			client = {
			user_id: user.id,
			account_id: user.account_id,
			first_name: data['Given Name'],
			last_name: data['Family Name'],
			email: data['E-mail 1 - Value'],
			phone: data['Phone 1 - Value'],
			phone2: data['Phone 2 - Value']
			};
			return addClient(client);
			}).on('end', function(count) {
			return console.log('Number of lines: ' + count);
			}).on('error', function(error) {
			return console.log(error.message);
			});
			 * /

			console.log('Number of characters: ' + data.length);
			return 1;
		}
	});
};
*/
"use strict";

var Busboy = require('busboy'),
temp = require('temp'),
path = require('path'),
os = require('os');
var fs = require('fs');
var db = require("../../server/database/DatabasePool");
var uuid = require('node-uuid');
var json_like = require("../lib/json_like"); //relocate to ./libs/
var extend = require('node.extend');
var fse = require('fs-extra');
var deepcopy = require('deepcopy');
//var mv = require('node-mv');

// giving server side progress acorss AJAX is trouble some, so we rather use rpc's
//      http://stackoverflow.com/questions/6258210/how-can-i-output-data-before-i-end-the-response
//      Chrome requires the 1st chunk to be at least 1k then upcoming chunks can be smaller than that.//http://stackoverflow.com/questions/16184103/how-to-flush-chunks-of-arbitrary-sizes-in-nodejs





exports.ajax_upload_with_rpc_feedback = function (req, res) {

	if ('POST' !== req.method)
		return false;
	var session = '',
	cx = {},
	fx = {};

	var busboy = new Busboy({
			headers : req.headers
		});
	busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
		console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
		//what to call the file and where to put is - we cannot eccept the user's file name as is, it may conflict
		fx.filename = filename;
		fx.encoding = encoding;
		fx.mimetype = mimetype;
		fx.tempName = temp.path({
				suffix : '.tmp'
			});

		//var saveTo = path.join('/tmp/', path.basename(fieldname));
		console.log('saveTo :' + fx.tempName);
		file.pipe(fs.createWriteStream(fx.tempName));

		file.on('data', function (data) {
			//console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
		});
		file.on('end', function () {
			console.log('File [' + fieldname + '] Finished');
		});
	});
	busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
		console.log('Field [' + fieldname + ']: value: ' + (val));
		if (fieldname === 'session')
			session = val;
		if (fieldname === 'cid')
			cx.cid = val;
		if (fieldname === 'pkf')
			cx.pkf = val;

	});
	busboy.on('finish', function () {
		console.log('Done parsing form!');
		res.writeHead(200, {
			'Content-Type' : 'text/plain'
		});
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

		//do preprocessing on the data depending on the type it is ...
		//split csv, xls into fields,
		// make thumbnails from images and video's
		//https://github.com/hacksparrow/node-easyimage
		//we now have {session,cid,pkf,a:[{inlinetransfromname,name,type,value/file}]}

		cx.dbref = db.LocateDatabasePool(session);

		//var readstream = fs.createReadStream(fx.tempName);
        //console.log('ajax_upload_with_rpc_feedback :',cx.dbref,session);
		if (cx.dbref !== null) {

			//create the thumb nail
			//have some kind of pluggable thumbnail engine....
			fx.THUMBTYPE = 'text/plain';
			fx.THUMB = fx.filename;

			var local_par = ['', '', '', '', '',''];
			local_par[0] = fx.mimetype;
			local_par[1] = 'file';
			local_par[2] = fx.THUMBTYPE;
			local_par[3] = fx.THUMB;
			local_par[4] = fx.filename;
            local_par[5] = fx.filename;

			var jobs = [
				["connect"],
				["query", "SELECT first 1 a.POST_PROCEDURE,a.QUERY FROM Z$PK_CACHE a where a.MASTER=? and a.INDX=?", [cx.cid, cx.pkf]],
				["log", " r "],
				["if", "r.POST_PROCEDURE!=''", [
						["adapt", "query", "SELECT first 1 a.CODE FROM Z$SP a where a.FN_HASH='{{r.POST_PROCEDURE}}' ", []],
						["log", " r "],
						["cb", function (cx, inst, cb) {
                                console.log('js if cx.r :', cx.r);
								console.log('js if cx.dbref.conf.async :', cx.dbref.conf.async);
								var quale = json_like.parse(cx.r.CODE);
								//todo add exception handing here test like: var quale = json_like.parse(cx.r.CODEX);
								console.log('js to check on what type of upload :', quale);
								var fileinfo = {};
								if (quale.Target) { //destination defined in the project config,json
									fileinfo = deepcopy(cx.dbref.conf.async[quale.Target]);
									console.log('js if fileinfo :', fileinfo);
								}
								extend(fileinfo, quale);
								console.log('js cb final destination:', fileinfo);

								//send the blob to a file or the database
								if (fileinfo.blobfield === undefined) {
									fileinfo.path = path.resolve(fileinfo.path);
									if (fileinfo.filename === 'original') //original name in unique sub folder
										fileinfo.filename = path.join(uuid.v4(), path.basename(fx.filename));
									else {
										if (fileinfo.filename === 'uuid.v4')
											fileinfo.filename = uuid.v4();
										if (fileinfo.extension === 'original')
                                            {
                                            console.log('js filename:', fileinfo.filename);
                                            console.log('js extname:', path.extname(fx.filename));
											fileinfo.filename = fileinfo.filename + path.extname(fx.filename);
                                            }
									}
									console.log('mv :', fx.tempName, ' to:', path.join(fileinfo.path, fileinfo.filename));
									fse.move(fx.tempName, path.join(fileinfo.path, fileinfo.filename), {
										clobber : true
									}, function (err) {
										if (err)
											return console.error(err)
											console.log("file move success!", fileinfo.filename)
									})
									//ok to complete async..we wont need it until much later..presume it wont fail.
									cx.v.type = 'file';
									local_par[0] = fx.mimetype;
									local_par[1] = 'file';
									local_par[2] = fx.THUMBTYPE;
									local_par[3] = fx.THUMB;
									local_par[4] = fileinfo.filename;
								} else {
									cx.v.type = 'blob';
								}
								console.log('js cb final final destination:', fileinfo, fx);
								cx.fi = fileinfo;
								cb();
							}
						],
						["if", "v.type==='blob'", [
								["adapt", "query", "SELECT p.PKO FROM {{r.POST_PROCEDURE}}(2,       '{{{r.QUERY}}}' , ?,       ?,      ?          , ?       , ?,?) p",
									//                                                      "ACTION"', 'PKI',         'BINTYPE', 'BINI', 'THUMBTYPE', 'THUMB', 'NAME'
									//[fx.mimetype, fs.createReadStream(fx.tempName), fx.THUMBTYPE, fx.THUMB, fileinfo.filename]]
									local_par]
								//this does not work yet due to node-firebird driver needing to be updated...
							],
							[//else
								["adapt", "query", "SELECT p.PKO FROM {{r.POST_PROCEDURE}}(2,       '{{{r.QUERY}}}' , ?,       ?,      ?          , ?       , ?,?) p",
									//                                                      "ACTION"', 'PKI',         'BINTYPE', 'BINI', 'THUMBTYPE', 'THUMB', 'NAME'
									//[fx.mimetype, 'file', fx.THUMBTYPE, fx.THUMB, fileinfo.filename]]
									local_par]
							]
						]

					]],
				["complete"]
			];

			require("../../lib/query-proc/query-proc").exec(cx, jobs);

		}
	});
	req.pipe(busboy);

	return true
};

exports.ajax_get_secured_file = function (req, res,url) {
//todo
//get the seeion from the cookie or a parameter, get a CID,FID
//get the file name from the databse
//send the file...
// app_uploads.ajax_get_secured_file(req, res,fn);   
}


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

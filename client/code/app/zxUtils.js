"use strict";
/* qq App */

exports.intersect_safe_sorted = function (a, b) { //http://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
	var ai = 0,
	bi = 0;
	var result = [];
	while (ai < a.length && bi < b.length) {
		if (a[ai] < b[bi]) {
			ai++;
		} else if (a[ai] > b[bi]) {
			bi++;
		} else /* they're equal */
		{
			result.push(a[ai]);
			ai++;
			bi++;
		}
	}

	return result;
};

exports.intersect = function (a, b) {
	return a.filter(function (n) {
		return b.indexOf(n) !== -1;
	});
	//test: var a= [1,2,3,4,5,6,7,8];var b= [4,6,8,10,12];console.log('zxintersect',zxintersect(a, b));
};

exports.removefromarray = function (arr, item) {
	var i;
	while ((i = arr.indexOf(item)) !== -1) {
		arr.splice(i, 1);
	}
};

exports.deduplicate = function (array) {
	//http://jsperf.com/remove-duplicate-array-tests
	var temp = {};
	for (var i = 0; i < array.length; i++)
		temp[array[i]] = true;
	var r = [];
	for (var k in temp)
		r.push(k);
	return r;
};

exports.getfilename = function (str) {
	//http://stackoverflow.com/questions/423376/how-to-get-the-file-name-from-a-full-path-using-javascript
	return str.split('\\').pop().split('/').pop();
};
exports.getfilenamepart = function (str) {
	//http://stackoverflow.com/questions/423376/how-to-get-the-file-name-from-a-full-path-using-javascript
	return (str.split('\\').pop().split('/').pop()).split('.').shift();
};

//http://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-particular-index-in-javascript
//note interesting .. extending the base string class
String.prototype.zxreplaceAt = function (index, character) {
	return this.substr(0, index) + character + this.substr(index + character.length);
};
String.prototype.zxinsertAt = function (index, character) {
	return this.substr(0, index) + character + this.substr(index);
};

exports.Beautify = function (txt) {

	var p;
	var c;
	var cp = ' ';
	if (txt === undefined)
		return txt;
	var l = txt.length;
	//replace $ . _ with spaces
	p = 0;
	while (p < l) {
		c = txt.charAt(p);

		if ((c === '$') || (c === '_') || (c === '.')) {
			txt = txt.zxreplaceAt(p, ' ');
		}
		if (((cp >= 'a') && (cp <= 'z')) && ((c >= 'A') && (c <= 'Z'))) {
			//small case followed by upper
			txt = txt.zxreplaceAt(p, c.toUpperCase());
			txt = txt.zxinsertAt(p, " "); //space camel-case
			l++;
		}
		cp = c;
		p++;
	}

	//capitalize first word
	txt = txt.toLowerCase();
	if (l > 1) {
		c = txt.charAt(0);
		if ((c >= 'a') && (c <= 'z')) {
			txt = txt.zxreplaceAt(0, c.toUpperCase());
		}
	}

	return txt;
};

exports.FirstBeauty = function (txt1, txt2, txt3, txt4, txt5) {

	//console.log('FirstBeauty: ',txt1,txt2,txt3,txt4,txt5);
	if (txt1 !== undefined) {
		if (txt1 !== "")
			return exports.Beautify(txt1);
	}
	if (txt2 !== undefined) {
		if (txt2 !== "")
			return exports.Beautify(txt2);
	}
	if (txt3 !== undefined) {
		if (txt3 !== "")
			return exports.Beautify(txt3);
	}
	if (txt4 !== undefined) {
		if (txt4 !== "")
			return exports.Beautify(txt4);
	}

	return txt5;

};

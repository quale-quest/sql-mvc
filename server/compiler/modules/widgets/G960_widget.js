"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */
//not used yet but will be

exports.module_name='g960_widget.js';

var get_style = function (zx, o, Key) { //used for g960,container and notify //this can be made common into a style plugin
	var Value = "";
	if (o.localstyle !== undefined) {
		Value = zx.UIsl[o.localstyle + Key];
	} else {
		if (o.style !== undefined)
			zx.G960.style = o.style; //set new style for the rest of the buttons

		if (zx.G960.style !== "")
			Value = zx.UIsl[zx.G960.style + Key];
	}

	if ((Value === undefined) || (Value === "")) //not set so use the unstyled value
		Value = zx.UIsl[Key];
	if (Value === undefined)
		return "";

	return Value;
};

var g960 = function (zx, o) {
	zx.G960.ContainersCount++;
	var result;

	if ((o.grid === undefined) || (o.grid === '0') || (o.grid === 'close')) {
		zx.G960.ContainersClosed = 1;
		zx.G960.ContainersCount = 0;
		return get_style(zx, o, "G960Close");
	}
	if (o.grid === "clear") {
		return get_style(zx, o, "G960Clear");
	}
	if (zx.G960.ContainersCount === 1) {
		result = get_style(zx, o, "G960Open");
	} else {
		if (zx.G960.ContainersCount === 2)
			result = get_style(zx, o, "G960First");
		else
			result = get_style(zx, o, "G960Next");
	}

	result = result.replace("$grid$", o.grid);
	return result;
};

exports.tag_g960 = function (zx, o) {
	var ReplaceText = g960(zx, o);
	zx.mt.lines.push(ReplaceText);
};

exports.start_pass = function (zx /*, line_objects*/
) {
	zx.G960.ContainersCount = 0;
};

exports.done_div = function (zx, line_objects) { //dinviner does not use this yet - TODO expand diviner...
	if (!zx.G960.ContainersClosed) { //close any open containers before the div ends
		zx.mt.lines.push(get_style(zx, line_objects, "G960Close"));
	}
};

exports.init = function (zx) {
	//validates and translates v2 tag contents to .divin input

	//console.warn('init G960_widget:');

	zx.G960 = {
		ContainersCount : 0
	};
	zx.G960.ContainersClosed = 0;
	zx.G960.style = "";

	zx.UIsl.G960Open = "<div id=\"content\"><div class=\"container_12\">";
	zx.UIsl.G960First = "<div class=\"grid_$grid$\">";
	zx.UIsl.G960Next = "</div><div class=\"grid_$grid$\">";
	zx.UIsl.G960Clear = "<div class=\"clear\"></div>";
	zx.UIsl.G960Close = "</div></div>";

};

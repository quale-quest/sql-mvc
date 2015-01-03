"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

//var evalulate = function (zx, o) {};


exports.compile = function (zx, obj) {
	//validates and translates v2 tag contents to .divin input
	var line_obj,
	i,
	tag,
	done;

	zx.debug = 0;
	zx.line_objects = obj;

	zx.eachplugin(zx, "init", zx.line_objects);

	zx.pass_max = 5;
	for (zx.pass = 1; zx.pass <= zx.pass_max; zx.pass += 1) {
		console.warn('=======================================================================Pass', zx.pass);

		zx.eachplugin(zx, "start_pass", zx.line_objects);
		//console.warn('iterate over items :',0 );
		//iterate over items


		for (i = 0; i < zx.line_objects.length; i += 1) {
			line_obj = zx.line_objects[i];
			zx.line_obj = line_obj;
			//console.warn('iterate over item :',i,line_obj.tag );
			//console.warn('iterate over item :',i,line_obj );
			zx.line_obj_current_tag_index = i;
			if (line_obj.srcinfo === undefined) {
				console.warn('undefined srcinfo ', line_obj);
			}
			line_obj.srcinfo.current_tag_index = i;
			if (line_obj.tag === undefined) {
				console.warn('undefined Tag ', i);
			} else {
				tag = line_obj.tag.toLowerCase();

				if ((tag.substring(0, 1) !== 'x') && (tag.substring(tag.length - 1) !== 'x')) {

					//common conditional keys - they have to be all true else the operation is skipped
					//console.warn('Divin compile conditionals :',i );
					//zx.plugins.forEach(function (entry,ii,zx, line_obj) {
					zx.eachplugin(zx, "start_item", line_obj);
					//console.warn('Divin compile conditionals done :',i );

					//common operational values
					//if (line_obj.assign !== undefined) {}
					if (line_obj.debug === undefined) {
						line_obj.debug = 0;
					}

					//tags
					if (zx.debug > 3) {
						zx.mt.lines.push("<-- " + tag + " -->");
					}

					//check plugins
					tag = line_obj.tag.toLowerCase();

					done = zx.locate_plugin(zx, "tag_", tag, line_obj);
					if (!done) {
						//console.warn('Widgets not done for :',tag );
						if ((tag.substring(0, 1) !== 'x') && (tag.substring(tag.length - 1) !== 'x') && (zx.pass === 1)) {
							console.log('WARN : unknown tag type: ', tag, 'in', line_obj.srcinfo.filename);
							console.log('WARN :           object: ', line_obj.srcinfo);

						} //case
					} //if done
				} //else

				zx.eachplugin(zx, "done_item", line_obj);

			} //if not x'ed
		} //for lines
		//console.log('entry.done_pass: ');
		zx.eachplugin(zx, "done_pass", zx.line_objects);

	} //pass
	//TODO add call back called done_div .. but it must be at the end of the div/file... not the end of the program	- check g960

	zx.eachplugin(zx, "done", zx.line_objects);

	return zx.line_objects;
};

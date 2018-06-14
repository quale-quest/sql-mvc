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

	zx.pass_max = 5;
	for (zx.pass = 1; zx.pass <= zx.pass_max; zx.pass += 1) {

		console.warn('=======================================================================Pass', zx.pass);//,zx.CurrentPageIndex,' : ',zx.pgi);

		zx.eachplugin(zx, "start_pass", zx.line_objects);
		//console.warn('iterate over items :',0 );
		//iterate over items
		if (zx.pass === 5) {
			zx.CurrentPageIndex = zx.dbg.getPageIndexNumber(zx, zx.pages[zx.pgi].name);
			//console.warn('Page ', zx.pages[zx.pgi].name,' == ',zx.CurrentPageIndex);
		} else zx.CurrentPageIndex = 1;

		for (i = 0; i < zx.line_objects.length; i += 1) {

			if (zx.pass === 1) {

				//zx.locate_plugin(zx, "tag_pass0_", line_obj.tag, line_obj);
				zx.eachplugin(zx, "process_pass01", {
					line_obj : zx.line_objects[i],
					//blocks : blocks,
                    line_objects : zx.line_objects,
                    indx : i
				});

			}
            //console.warn('=======================================================================compile:', zx.CurrentPageIndex,' : ',zx.pgi);
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
				if (line_obj.dialect_active === 0) {
					if (zx.pass === 1) {
						//console.warn('dialect_active==0 :',i,line_obj.tag ,line_obj.save );
						//console.log('WARN : dialect_active==0: ', line_obj.tag, 'in', line_obj.srcinfo.filename, ' at line ',line_obj.srcinfo.start_line);
						//console.log('WARN :                  : ', line_obj.srcinfo);
						
					}
				} else {
				tag = line_obj.tag.toLowerCase();

                //console.warn('iterate over item 130405:',i,line_obj.tag ,line_obj.save);
				if ((line_obj.save === undefined)&&
                    (line_obj.part_of_model === undefined)&&
                    (tag.substring(0, 1) !== 'x') && (tag.substring(tag.length - 1) !== 'x')) {
                    //console.warn('iterate over item 130407:',i,line_obj.tag );
					//common conditional keys - they have to be all true else the operation is skipped
					//console.warn('Divin compile conditionals :',i );
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
					try {
                    //console.warn('iterate over item 130410:',i,line_obj.tag );
						done = zx.locate_plugin(zx, "tag_", tag, line_obj);
						if (!done) {
							//console.warn('Widgets not done for :',tag );
							if ((tag.substring(0, 1) !== 'x') && (tag.substring(tag.length - 1) !== 'x') && (zx.pass === 1)) {
								console.log('WARN : unknown tag type: ', tag, 'in', line_obj.srcinfo.filename);
								console.log('WARN :           object: ', line_obj.srcinfo);

							}
						} //if done
					} catch (e) {
						zx.error.caught_exception(zx, e, " locate_plugin -114538,  tag_" + tag);
						throw new Error("local known error");
					}
				} //else

				zx.eachplugin(zx, "done_item", line_obj);
				}
			} //if not x'ed
		} //for lines
		//console.log('entry.done_pass: ');
		zx.eachplugin(zx, "done_pass", zx.line_objects);
        
        zx.mtscript = zx.mt.lines.join('\n'); //fix: to remove the artificial \n we must make take input \n 's as part of the source - so the output template is formatted the same as the input
        zx.mtHash = zx.TemplateHashPrefix + zx.ShortHash(zx.mtscript+ zx.conf.db.dialect ); 

	} //pass
	//TODO add call back called done_div .. but it must be at the end of the div/file... not the end of the program	- check g960

	zx.eachplugin(zx, "done", zx.line_objects);

	return zx.line_objects;
};

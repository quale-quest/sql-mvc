"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

 exports.module_name='container_widget.js';
 
var get_style = function (zx, o, Key) { //used for g960,container and notify  //this can be made common into a style plugin
	var Value = "";
	if (o.localstyle !== undefined) {
		Value = zx.UIsl[o.localstyle + Key];
	} else {
		if (o.style !== undefined)
			zx.Container.Style = o.style; //set new style for the rest of the buttons

		if (zx.Container.Style !== "")
			Value = zx.UIsl[zx.Container.Style + Key];
	}

	if ((Value === undefined) || (Value === "")) //not set so use the unstyled value
		Value = zx.UIsl[Key];
	if (Value === undefined)
		return "";

	return Value;
};

var zxContainerSubst = function (zx, o, Result) {
	var li_class = '',
	IconSpan = '',
	LeftSpan = '',
	RightSpan = '';

	/* todo expand container substitution
	AS title  = o.title;
	ContextValue(Sqld,title,title,"title");

	AS li_class = ExtractQ(TagParams,"li-class");
	if (li_class!=""){li_class=" class=\"" + li_class + "\" ";
	}

	AS IconSpan=ExtractQ(TagParams,"icon");
	if (IconSpan!=""){
	IconSpan="<span class=\""+IconSpan+"\"></span>";
	}
	AS LeftSpan=ExtractQ(TagParams,"LeftSpan");
	if (LeftSpan!=""){
	AS Param;
	AS Result;
	ParseParamFromString(LeftSpan,Param,20);
	ContextValue(Sqld,StripQ(LeftSpan),Result,"ElementValue:");
	LeftSpan="ls:"+LeftSpan+"<span class=\""+Param+"\">" + Result + "</span>";
	}

	AS RightSpan=ExtractQ(TagParams,"rightspan");
	if (RightSpan!=""){
	AS Param;
	AS Result;
	ParseParamFromString(RightSpan,Param,20);
	ContextValue(Sqld,StripQ(RightSpan),Result,"ElementValue:");
	RightSpan="<span class=\""+Param+"\">" + Result + "</span>";
	}
	 */

	if (Result.indexOf("$tabid$") > 0) {
		Result = Result.replace(/\$tabid\$/g, "TabID" + zx.Container.Tabs[0].List[zx.Container.Tabs[0].Item] + String(zx.Container.Tabs[0].Item));
		zx.Container.Tabs[0].Item++;
	}
    //console.log('zxContainerSubst a: ',Result );
	Result = Result.replace(/\$li_class$/g, li_class);
	//Result=Result.replace(/\$Title$/g,Beautify(title));
	Result = Result.replace(/\$LeftSpan$/g, LeftSpan + IconSpan);
	Result = Result.replace(/\$RightSpan$/g, RightSpan);
	Result = Result.replace(/\$LinkElements$/g, "");
	Result = Result.replace(/\$CRLF$/g, "\n");

	return Result;
};

var zxContainerOpen = function (zx, o) {

   
	if (o.style !== undefined)
		zx.Container.Style = o.style;

	//other attributes such as size ...

	//Push the current strings
	var newcontianer = {
		Item : 0,
        Indx : zx.Container.ContainerIndex,
		List : []
	};
	if (o.tab !== undefined) {
		//console.log('newcontianer tab: ',o.tab,newcontianer.Indx,zx.Container.TabLists );
		newcontianer.List = o.tab;   
        if (zx.pass>1)
             newcontianer.List = zx.Container.TabLists[newcontianer.Indx] ;    
	}
    
	if (o.tabs !== undefined) {
		//console.log('newcontianer tabs: ',o.tabs[0] );
		newcontianer.List = o.tabs[0].split(',');
    }
	zx.Container.Tabs.unshift(newcontianer);

	var Result = get_style(zx, o, "ContainerOpen");
	//console.log('zxContainerOpen Result: ',Result );
	Result = zxContainerSubst(zx, o, Result);
	//console.log('zxContainerOpen Result: ',Result );
	var content='';
	for (var i = 0; i < zx.Container.Tabs[0].List.length; i++) {
		var item = get_style(zx, o, "ContainerItem");
		item = item.replace("$Title$", zx.Beautify(zx.Container.Tabs[0].List[i]));
		item = item.replace("$tabid$", "TabID" + zx.Container.Tabs[0].List[i] + String(i));
		content += item;
	}
    //console.log('zxContainerOpen Result z: ',content );
	Result = Result.replace("$TabList$", content);
	return Result;
};

var zxContainerNext = function (zx, o /*, Type*/
) {
	//TODO  conditional container should disable all other elements up to its closure -new feature
	var Result = "";
    //console.log('zxContainerNext a: ',o.tab,zx.pass );
    if ((o.tab)&&(zx.pass<=1)) zx.Container.Tabs[0].List.push(o.tab);
	//if we have no more tab titles then drop to static divs
	if (zx.Container.Tabs[0].List.length <= zx.Container.Tabs[0].Item) {
		Result = zxContainerClose(zx, o);
		Result += zxContainerOpen(zx, o);
		return Result;
	}

	Result = get_style(zx, o, "ContainerNext");
	if (Result === "") //no next so close and re-open
	{
		Result = get_style(zx, o, "ContainerClose") + get_style(zx, o, "ContainerOpen");
		//console.log('zxContainerOpen Result: ',Result );
	}

	Result = zxContainerSubst(zx, o, Result);
	return Result;

};

var zxContainerClose = function (zx, o) {
	var Result = get_style(zx, o, "ContainerClose");
	// not realy needed and messes up the next tab switch due to removing the title zxContainerSubst(TagParams,Result);

	//pop the parent stings
	if (zx.Container.Tabs[0].List.length > 0) {
        zx.Container.TabLists[zx.Container.Tabs[0].Indx]=zx.Container.Tabs[0].List ;    
		zx.Container.Tabs.shift();
	}
	return Result;
};

exports.tag_container = function (zx, o) {
     zx.Container.ContainerIndex++; 
	var ReplaceText = zxContainerOpen(zx, o);
	zx.mt.lines.push(ReplaceText);
	//console.log('tag_container: ',o,ReplaceText,zx.mt.lines );
};

exports.tag_nextcontainer = function (zx, o) {
	var ReplaceText = zxContainerNext(zx, o, 98);
	zx.mt.lines.push(ReplaceText);
};

exports.tag_closecontainer = function (zx, o) {
	var ReplaceText = zxContainerClose(zx, o);
	zx.mt.lines.push(ReplaceText);
};

exports.start_pass = function (zx /*, line_objects*/
) {

    
	zx.Container.Tabs = [{
			Item : 0,
			List : []
		}
	];
    zx.Container.ContainerIndex=0;
    
};
exports.done_pass = function (zx, line_obj) {
	if (zx.pass === 1) {
		//console.log(' model db_update.update:');
		zx.db_update.update(zx);
		//console.log(' model db_update.update done:');
	}
};

exports.done_div = function (/*zx, line_objects*/
) { //dinviner does not use this yet - TODO expand diviner...

	//TODO close any open containers before the div ends

};
exports.start_page = function (zx) {
    zx.Container.Style = "";
}

exports.start_up = function (zx) {
	//validates and translates v2 tag contents to .divin input
    

	//console.warn('init container_widget:');
	zx.Container = {};
    zx.Container.TabLists=[];
	zx.Container.Style = "";

	zx.UIsl.ContainerOpen = "<div class=\"widget-panel\"><div class=\"widget-top\">$LeftSpan$<h4>$Title$</h4>$RightSpan$</div><div class=\"widget-content module\"><div class=\"content-block tbl-default\">";
	zx.UIsl.ContainerClose = "</div></div></div>";
	zx.UIsl.ContainerFirst = "First";
	zx.UIsl.ContainerMaintainItemList = 0;

	zx.UIsl.ThinContainerOpen = "<div class=\"widget-panel\"><div class=\"widget-clear\">$LeftSpan$<h4>$Title$</h4>$RightSpan$</div><div class=\"widget-content module\"><div class=\"content-block tbl-default\">";
	zx.UIsl.ThinContainerClose = "</div></div></div>";
	zx.UIsl.ThinContainerFirst = "First";
	zx.UIsl.ThinContainerMaintainItemList = 0;

	zx.UIsl.CollapsableContainerOpen = "<div class=\"widget-panel\"><div class=\"widget-top collapse-bar\"><h4>$Title$</h4>$RightSpan$</div><div class=\"widget-content module\"><div class=\"content-block tbl-default\">";
	zx.UIsl.CollapsableContainerClose = "</div></div></div>";
	zx.UIsl.CollapsableContainerMaintainItemList = 0;

	zx.UIsl.AccordionContainerOpen = "<div class=\"widget-panel\"><div class=\"widget-content module\"><div class=\"accordion-basic\" id=\"list-accordion\"><a class=\"title\">$Title$ $RightSpan$</a><div>";
	zx.UIsl.AccordionContainerNext = "</div><a class=\"title\">$Title$</a><div>";
	zx.UIsl.AccordionContainerClose = "</div></div></div></div>";
	zx.UIsl.AccordionContainerMaintainItemList = 0;

	zx.UIsl.TabContainerOpen = "<div class=\"widget-panel\"><div class=\"widget-content module\"><div class=\"tabBlock\"><div class=\"widget-top\"><ul class=\"mytabs\">$TabList$</ul></div><div class=\"mytabContainer\"><div id=\"$tabid$\" class=\"tab-block\"><div class=\"tab-content\">";
	zx.UIsl.TabContainerItem = "<li><a href=\"#$tabid$\">$Title$</a></li>";
	zx.UIsl.TabContainerNext = "</div></div><div id=\"$tabid$\" class=\"tab-block\"><div class=\"tab-content\">";
	zx.UIsl.TabContainerClose = "</div></div></div></div></div></div>";
	zx.UIsl.TabContainerMaintainItemList = 1;

};

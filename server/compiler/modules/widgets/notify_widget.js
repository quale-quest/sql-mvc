"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

var fileutils = require('../../../compiler/modules/fileutils.js');
var path = require('path');
var fs = require('fs');
var page = require('../../modules/page.js');
var hogan = require("hogan");
var gets = require('../../zx.js').gets;
exports.module_name='notify_widget.js';



var get_style = function (zx, o, Key) { //used for g960,container and notify  //this can be made common into a style plugin
	var Value = "";
	if (o.localstyle !== undefined) {
		Value = zx.UIsl[o.localstyle + Key];
	} else {
		if (o.style)
			Value = zx.UIsl[o.style + Key];
	}

	if ((Value === undefined) || (Value === "")) //not set so use the unstyled value
		Value = zx.UIsl[Key];
	if (Value === undefined)
		return "";

	return Value;
};


/*
exports.tag_menuend = function (zx, o) {

	o.li_class = styleif(o.li_class, " class=\"{{pop}}\" ");
	o.IconSpan = styleif(o.icon, "<span class=\"{{pop}}\"></span>");
	o.Icon = styleif(o.glymph, "{{pop}}");

	o.RightSpan = "";
	o.LeftSpan = o.IconSpan;
     
	//QryUrl should be complete // excluding the on click script
	var result = action_style(zx, o, (zx.action.level <= 1) ? "ActionMain" : "ActionSub");
	o.Title = zx.Beautify(gets(o.title)); //use proper
    o.url = QryUrl;
    o.Glymph = o.Icon;
    
    
	//console.warn('Menuend:',o,ReplaceText);
};


AnsiString TPWFormat::zxNotify(TStrings *TagParams,int level)
//Help is conditional messages that the user can switch off
// each message can be individually switched or it can use a help level
//Help Level=10 or show=always   cannot be stitched off
{

      AS Help_ID = ExtractQ(TagParams,"help_id").LowerCase();
      level  = ExtractQ(TagParams,"level").ToIntDef(level);

      AS show = ExtractQ(TagParams,"show").LowerCase();
      if ((show!="always")&&(level<10))
        {
        //additional chacking if the user has turned of this help item

        }

      //Help by level overrides all
      if (level<DM->OperatorHelpLevel) return "";


      //conditional is delayed until after the help levels as it is likey more expensive than the help levels
      if (!zxConditionalExecution(TagParams)) return "";

      AS Style = ExtractQ(TagParams,"style");
      if (Style=="")
        {//If no style specified then determine style according to the level
          if (level<6)
            Style="Help";
          else if (level<8)   //7=inform
            Style="Infrom";
          else if (level<9)   //8=success
            Style="Success";
          else if (level<10)  //9=fail
            Style="Failure";
          else
            Style="Warning";
        }

//Display the help
      AS text  = ExtractQ(TagParams,"text");
      if (text=="") //if none specified the remainder is the text
           text  = TagParams->Text;
      text = PwSubstitute(text);

      AS icon  = ExtractQ(TagParams,"icon");


      AS 
      TrimCRLF(text);
      ReplaceString(Result,S "$Text$",text);
      ReplaceString(Result,S "$Icon$",icon);      

      return Result;
}

*/



var notify = exports.tag_notify = function (zx, line_obj) {
    line_obj.style=zx.gets(line_obj.style)  
    var template=get_style(zx, line_obj,"NotifyDiv");

    line_obj.Text=zx.expressions.TextWithEmbededExpressions(zx, line_obj, line_obj.nonkeyd, "mt", "tag_help");	
    var result = hogan.compile(template).render(line_obj);
    zx.mt.lines.push(result);
    
    console.warn('tag_help:',line_obj,template,result);
};

exports.tag_help = function (zx, line_obj) {
      line_obj.style="Help";
      notify(zx, line_obj);
}

exports.tag_infrom = function (zx, line_obj) {
      line_obj.style="Infrom";
      notify(zx, line_obj);
}
exports.tag_warning = function (zx, line_obj) {
      line_obj.style="Warning";
      notify(zx, line_obj);
}

exports.tag_success = function (zx, line_obj) {
      line_obj.style="Success";
      notify(zx, line_obj);
}

exports.tag_failure = function (zx, line_obj) {
      line_obj.style="Failure";
      notify(zx, line_obj);
}







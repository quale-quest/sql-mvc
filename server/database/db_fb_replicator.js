"use strict";
/*

 */
var fs = require('fs');
var deepcopy = require('deepcopy');
var extend = require('node.extend');
var deasync = require('deasync'); var deasync_const=15;

exports.module_name = 'db_fb_replicator.js';
var fullscript="";
var existingscript={};


var F_F2J = function (zx, str) {
  return " "+zx.config.db.sql_concat_prefix + "'\"'"+
		zx.config.db.sql_concat_seperator+"REPLACE(REPLACE(Coalesce(" + str + ",''),'\"','\\\"'),'\\n','CRLF')"+
		zx.config.db.sql_concat_seperator+"'\""+
		zx.config.db.sql_concat_postfix; 	
}

var F_F2JV = function (zx, name, str) {
  return zx.config.db.sql_concat_seperator+"'\""+ name +"\":'"+
	zx.config.db.sql_concat_seperator+  F_F2J(zx,str) + "'" +
	zx.config.db.sql_concat_seperator
	;
}

var MakeReplication_StartProcedure = function (zx, model) {
	var script="";
	var selects="";
	var intos="";
	var concats="";
	var declare="";
	
	var strt=" ";
	var strtc="";
	var openrecord="";
	var metarecord="";
	var startdata="";
	var fi=0;
	var s;
	var CRLF="\r\n";
	//console.log('MakeReplicationCode :', model);

	fi=0;
	model.Fields.forEach(function (field) {
		s = CRLF + "  declare f"+ fi +" varchar(260)=''; "  ;
		declare = declare +s;

		s = CRLF + '    ' + strt + field.FieldName +" " ;
		selects = selects + s;

		s = strt + ":f"+ fi ;
		intos = intos +s;
		
		s = CRLF+'    ' +   'ASCII_CHAR(13)||ASCII_CHAR(10)'+strtc + F_F2JV(zx,field.FieldName,":f"+fi) ;
					
		concats = concats + s;
		
		fi=fi+1;
		strt=",";
		strtc="||','";
	});
	
	openrecord = "{';";
	
	metarecord = "''"+F_F2JV(zx,'f',"'upd'")+
		"','"+F_F2JV(zx,'t',"'"+model.Table+"'")+
		"','"+F_F2JV(zx,'id',":f0")+
		"','"+F_F2JV(zx,'s',":seq")	;
	startdata = "',\"d\":{'||";

	
	script = 
		CRLF+CRLF+CRLF+CRLF+	
		"-- ========================================"+model.Table+CRLF+				
		"CREATE OR ALTER PROCEDURE Export_"+model.Table+"(" + CRLF+
		"    seq integer,"+ CRLF+
		"    OPERATOR$REF Varchar(41) )" + CRLF+
		"  RETURNS (" + CRLF+
		"    INFO Blob sub_type 1," + CRLF+
		"    RES Blob sub_type 1," + CRLF+
		"    SCRIPTNAMED Varchar(250) )" + CRLF+
		"  AS	" + CRLF+
	
	
		CRLF + declare +
		CRLF + "  declare preload varchar(100)='';" +
		CRLF + "  declare rowcontent varchar(8000)='';"+
		
		CRLF + "  begin  "+
		CRLF + "  res='';"+
		CRLF + "  preload='["+openrecord +
		CRLF + "  for Select "+
				
		CRLF + selects + 
		
		CRLF + "  From "+model.Table+"	 into "+		
		intos+
		CRLF + "   do begin "+	
		CRLF + "   rowcontent=:preload|| "+	metarecord+startdata+
		
		CRLF + concats + "'';" + 
		CRLF + "  preload='}},"+openrecord +		
		CRLF + "  seq=seq+1;"+
		CRLF + "  res=:res||:rowcontent;"+
		CRLF + "  SCRIPTNAMED = OCTET_LENGTH(res); suspend;"+
		CRLF + "  end"+
		CRLF + "  res=:res||'}}]';"+
		CRLF + "  suspend;"+
		CRLF + "end^";
		//console.log('MCode :',fi,' ', script );
	
	return script;
	
}


var MakeReplication_UpdateTrigger = function (zx, model,insert_or_update) {
	var script="";
	var update="";
	var intos="";
	var concats="";
	var declare="";
	
	var strt="";
	var strtc="";

	var metarecord="";
	var startdata="";
	var fi=0;
	var s;
	var CRLF="\r\n";
	//console.log('MakeReplicationCode :', model);

	fi=0;
	model.Fields.forEach(function (field) {

		if (insert_or_update) {
			s = '\r\n' +
				'\r\n    if (new.'+field.FieldName+' is distinct from old.'+field.FieldName+') then begin' +
				'\r\n      JSON = JSON||\',"'+field.FieldName+'":\'||'+F_F2J(zx,'new.'+field.FieldName) + "';" +
				'\r\n    end';
		} else {
			s = '\r\n' +
				'\r\n    if (new.'+field.FieldName+' is distinct from null ) then begin' +
				'\r\n      JSON = JSON||\',"'+field.FieldName+'":\'||'+F_F2J(zx,'new.'+field.FieldName) + "';" +
				'\r\n    end';
			
		}	
			
		
		
		update = update + s;	
		fi=fi+1;

	});
	

	
	metarecord = "'{'"+F_F2JV(zx,'f',
		(insert_or_update?"'upd'":"'ins'")
		)+
		"','"+F_F2JV(zx,'t',"'"+model.Table+"'")+
		"','"+F_F2JV(zx,'id','new.'+model.Fields[0].FieldName)+
		"','"+F_F2JV(zx,'s',":DID")	+
		'\',"d":{\'||'
		;
	

	
	script = 
		CRLF+CRLF+CRLF+CRLF+
		//"-- ========================================"+model.Table+CRLF+		
		
		"CREATE or ALTER  TRIGGER "+model.Table+"_"+
		(insert_or_update?"Update":"Insert")+
		"_trigger FOR "+model.Table+" " + CRLF+
		(insert_or_update?"  ACTIVE BEFORE UPDATE POSITION 32000 ":"   ACTIVE BEFORE INSERT POSITION 32000")+ CRLF+
		"  AS	" + CRLF+

		CRLF + "  declare preload varchar(100)='';" +
		CRLF + "  declare JSON varchar(8000)='';"+
		CRLF + "  declare DID BIGINT;"+
		
		CRLF + "    begin  "+
				
		CRLF + update +

		CRLF + "    if (JSON<>'') then begin "+
		

		
		CRLF + "    if (CURRENT_USER<>'REPL') then begin"+
		CRLF + "        DID=gen_id(ZR$LOG_ID, 1) ;"+
		
		CRLF +"        insert into  ZR$LOG(ID,GEN,JSON) values(:DID,gen_id(ZR$LOG_GENERATION,0),"+
		CRLF + metarecord	+
//		CRLF +'\'"_":0\'||'+ - not needing the substring
		CRLF +"        SUBSTRING(:JSON FROM 2)||'}}'); "+
		
		CRLF + "     end" +		
		CRLF + "   end" +		
		CRLF + " end^";
		//console.log('TCode :', script );
	
	return script;
}



exports.MakeReplicationCode = function (zx, model) {
	
	
	var CRLF="\r\n";
	var script=	CRLF+"SET TERM ^ ;" + CRLF;
	
	if (existingscript[model.Table]==1) return;
	existingscript[model.Table]=1;
	
	script +=MakeReplication_StartProcedure(zx, model);
	script +=MakeReplication_UpdateTrigger(zx, model,0);
	script +=MakeReplication_UpdateTrigger(zx, model,1);

	fullscript+=script;	
	//console.log('TCode :' );
	//process.exit(2);
}	

exports.shut_down = function (zx, par) {
//	console.log('Replication :', fullscript );
	fs.writeFileSync(zx.output_folder + 'replicate.sql', fullscript);
//	process.exit(2);
}

exports.init = function (zx) {
};

exports.start_up = function (zx) {};

exports.unit_test = function (zx) {
};



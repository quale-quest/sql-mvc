"use strict";
/*

Replication Model - build for a specific purpose but may work for others.
Scenario
	A cloud server running SQL (FB).
	Multiple (<100) mobile devices running sqllite, that must run some functions perfectly on an intermittent network.
	Multiple groups (SHARDs)of  mobile devices
	Typical size of a shard (<5MB)
	
Function
	If there is no shard field then we don't replicate
	
	Insert Or Update Trigger
		if SHARD	
			if shard changed insert into delta old shard , new shard value
			copy changed or all data to a delta table under new shard.
			
	delete Trigger		
		Make delete record into delta

	When data is moved from one SHARD to another SHARD it flags the old shard and create the full record in the new shard.
	Creating a shard
		Instead of "writing a current/first state" we just change the shard value for all the records we want in the shard.
		UPDATE Z$USER  SET SHARD = 'xxx' WHERE PROJECT_ID='xxx' ;
		UPDATE PROJECT SET SHARD = 'xxx' WHERE PROJECT_ID='xxx' ;
		UPDATE ACCOUNT SET SHARD = 'xxx' WHERE PROJECT_ID='xxx' ;		
		UPDATE SCRIPT  SET SHARD = 'xxx' WHERE PROJECT_ID='xxx' ;		
		
		
		
	Issues "CURRENT_TRANSACTION - Because this value is stored on the database header page, it will be reset after a database restore."
			can be fixed with GET_REAL_CURRENT_TRANSACTION code	

	Issue - Ideally we want to detect missing updates in the client - that is what seq ID generator is usefull (if we have one shard).
		also is a transactions is rolled back we will have gaps in ID
	
	
	REST Server 
		option ???? Reorders / makes new sequince per shard	 (SID) - ??
		Restore select * where SHARD=''  and TID>=Last_TID order by TID|ID
			- we dont delete older records in a shard because a new cleint can connect at anytime
			
	Client
		select shard from rest:PROJECT where PROJECT.ID = 'myProject' into new_shard
		if (new_shard<>download_shard) {
			//the shard has changed ....
			download_TID = 0;			
			download_shard=new_shard;
		}
		select from rest:ZR$LOG where SHARD=download_shard and TID>=download_TID
			if 0 records and no errors or UPTODATE
				if Active_shard <> download_shard then flag_app to reload asap
				Active_shard = download_shard;
				
				
				
				


	

 */
var fs = require('fs');
var deepcopy = require('deepcopy');
var extend = require('node.extend');
var deasync = require('deasync'); var deasync_const=15;

exports.module_name = 'db_fb_replicator.js';
var fullscript="";
var existingscript={};
var CRLF="\r\n";

var GET_REAL_CURRENT_TRANSACTION = 
CRLF + "		REAL_CURRENT_TRANSACTION = rdb$get_context('USER_SESSION', 'REAL_CURRENT_TRANSACTION');"+
CRLF + "		if (REAL_CURRENT_TRANSACTION is not distinct from null) then begin"+
			
CRLF + "			if (CURRENT_TRANSACTION < gen_id(ZR$LAST_CURRENT_TRANSACTION,0) ) then"+
CRLF + "				REAL_CURRENT_TRANSACTION = gen_id(ZR$MIN_CURRENT_TRANSACTION,gen_id(ZR$LAST_CURRENT_TRANSACTION,0)); "+
			
CRLF + "			REAL_CURRENT_TRANSACTION = GEN_ID(ZR$LAST_CURRENT_TRANSACTION, CURRENT_TRANSACTION - GEN_ID(ZR$LAST_CURRENT_TRANSACTION, 0 ) );"+
CRLF + "			REAL_CURRENT_TRANSACTION = gen_id(ZR$MIN_CURRENT_TRANSACTION,0) + CURRENT_TRANSACTION;"+
CRLF + "			rdb$set_context('USER_SESSION', 'REAL_CURRENT_TRANSACTION', REAL_CURRENT_TRANSACTION);"+
CRLF + "		end    ";
		

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


var MakeReplication_Meta = function (zx, model,Typ,shard,oldnew) {
	
	return "'{'"+F_F2JV(zx,'f',"'"+Typ+"'")+
		         "','"+F_F2JV(zx,'t',"'"+model.Table+"'")+
		         "','"+F_F2JV(zx,'id',oldnew+model.Fields[0].FieldName)+
		         "','"+F_F2JV(zx,'s',":DID")	+
		         //"','"+F_F2JV(zx,'s',shard)	+				 
		         '\',"d":{\'||';
	
}

var MakeReplication_UpdateTrigger = function (zx, model,insert_or_update) {
	var script="";
	var update="";
	var intos="";
	var concats="";
	var declare="";
	
	var strt="";
	var strtc="";

	
	var startdata="";
	var fi=0;
	var s;
	
	//console.log('MakeReplicationCode :', model);

	fi=0;
	//if (model.Fields.

	model.Fields.forEach(function (field) {

		s = '\r\n' +
			'\r\n      if (WRITING=1 or new.'+field.FieldName+' is distinct from old.'+field.FieldName+') then begin' +
			'\r\n        JSON = JSON||\',"'+field.FieldName+'":\'||'+F_F2J(zx,'new.'+field.FieldName) + "';" +
			'\r\n      end';
	
			
		
		
		update = update + s;	
		fi=fi+1;

	});
	
	
	script = 
		CRLF+CRLF+CRLF+CRLF+
		//"-- ========================================"+model.Table+CRLF+		
		
		"CREATE or ALTER  TRIGGER ZR$"+model.Table+"_replicate_trigger FOR "+model.Table+" " + CRLF+
		"  ACTIVE BEFORE INSERT OR UPDATE OR DELETE POSITION 32000 " + CRLF+
		"  AS	" + CRLF+

		CRLF + "  declare preload varchar(100)='';" +
		CRLF + "  declare JSON varchar(8000)='';"+
		CRLF + "  declare DID BIGINT;"+
		CRLF + "  declare REAL_CURRENT_TRANSACTION BIGINT;"+
		
		CRLF + "  declare WRITING INTEGER=0;"+
		
		CRLF + "  begin"+

		CRLF + "    if (CURRENT_USER<>'REPL') then begin"+
		
		CRLF + "    if (deleting) then begin"+		
		CRLF + "        JSON='.';"+		
		CRLF + "    end else begin" +		
		CRLF + "      if (old.SHARD is distinct from new.SHARD or inserting) then "+
		CRLF + "         WRITING=1;"+			
				
		CRLF + update +

		CRLF + "    end --else deleting" +
		
		CRLF + "      if (JSON<>'') then begin "+
		CRLF + GET_REAL_CURRENT_TRANSACTION+CRLF +
		CRLF + "    if (deleting) then begin"+		
		CRLF + "        if (old.SHARD is distinct from null) then begin"+		
		CRLF + "            DID=gen_id(ZR$LOG_ID, 1) ;"+		
		CRLF + "            insert into  ZR$LOG(TID,ID,SHARD_ID,JSON) values(:REAL_CURRENT_TRANSACTION,:DID,old.SHARD,"+		
		CRLF + 			MakeReplication_Meta(zx, model,"del","old.SHARD",'old.')+ " SUBSTRING(:JSON FROM 2)||'}}'); "+		
		CRLF + "        end end else begin" +		
		
		CRLF + "        if (old.SHARD is distinct from null and old.SHARD is distinct from new.SHARD) then begin"+
		CRLF + "            DID=gen_id(ZR$LOG_ID, 1) ;"+		
		CRLF + "            insert into  ZR$LOG(TID,ID,SHARD_ID,JSON) values(:REAL_CURRENT_TRANSACTION,:DID,old.SHARD,"+		
		CRLF + 			MakeReplication_Meta(zx, model,"upd","old.SHARD",'new.')+ " SUBSTRING(:JSON FROM 2)||'}}'); "+		
		CRLF + "        end" +		
		CRLF + "        if (new.SHARD is distinct from null) then begin"+
		CRLF + "            DID=gen_id(ZR$LOG_ID, 1) ;"+		
		CRLF + "            insert into  ZR$LOG(TID,ID,SHARD_ID,JSON) values(:REAL_CURRENT_TRANSACTION,:DID,new.SHARD,"+		
		CRLF + 			MakeReplication_Meta(zx, model,"upd","new.SHARD",'new.')+ " SUBSTRING(:JSON FROM 2)||'}}'); "+		
		CRLF + "        end" +		
		CRLF + "      end -- else deleting" +	
		CRLF + "      end -- JSON" +		
				
		
		CRLF + "   end --User" +		
		CRLF + " end^";
	
	return script;
}



exports.MakeReplicationCode = function (zx, model) {
	
	
	
	var script=	CRLF+"SET TERM ^ ;" + CRLF;
	
	if (existingscript[model.Table]==1) return;	
	existingscript[model.Table]=1;
	
	model.shard="";
	model.Fields.forEach(function (field) {	if (field.FieldName=="SHARD") model.shard="SHARD"; });	
	
	//console.log('MakeReplicationCode :', model);
	//script +=MakeReplication_StartProcedure(zx, model);
	if (model.shard!="")
		script +=MakeReplication_UpdateTrigger(zx, model,0);
	//script +=MakeReplication_UpdateTrigger(zx, model,1);

	fullscript+=script	+CRLF+"SET TERM ; ^" + CRLF;	
	//console.log('TCode :' ,script);
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



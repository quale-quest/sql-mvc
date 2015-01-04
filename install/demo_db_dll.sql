
--below is a extract using flame robin
-- however creating the index CREATE INDEX IDX_Z$PK_CACHE2 ON Z$PK_CACHE (MASTER,NEW_VALUE_SET,VALU,QUERY,PK_FIELD_NAME); must be placed above z$run


/********************* ROLES **********************/

/********************* UDFS ***********************/

DECLARE EXTERNAL FUNCTION ADD2
INTEGER, INTEGER
RETURNS INTEGER BY VALUE 
ENTRY_POINT 'q_add2'
MODULE_NAME 'q_UDFLibC';

DECLARE EXTERNAL FUNCTION ADDDAY
TIMESTAMP, INTEGER
RETURNS TIMESTAMP
ENTRY_POINT 'addDay'
MODULE_NAME 'fbudf';

DECLARE EXTERNAL FUNCTION ADDHOUR
TIMESTAMP, INTEGER
RETURNS TIMESTAMP
ENTRY_POINT 'addHour'
MODULE_NAME 'fbudf';

DECLARE EXTERNAL FUNCTION ADDMONTH
TIMESTAMP, INTEGER
RETURNS TIMESTAMP
ENTRY_POINT 'addMonth'
MODULE_NAME 'fbudf';

DECLARE EXTERNAL FUNCTION DPOWER

DOUBLE PRECISION BY DESCRIPTOR , DOUBLE PRECISION BY DESCRIPTOR , DOUBLE PRECISION BY DESCRIPTOR 
RETURNS PARAMETER 3
ENTRY_POINT 'power'
MODULE_NAME 'fbudf';

DECLARE EXTERNAL FUNCTION QLOWER
VARCHAR(256)
RETURNS CSTRING(80)
ENTRY_POINT 'fn_lower_c'
MODULE_NAME 'q_UDFLibC';

DECLARE EXTERNAL FUNCTION Z$F_F2J
CSTRING(256)
RETURNS CSTRING(256)
ENTRY_POINT 'Z$F_F2J'
MODULE_NAME 'q_UDFLibC';

DECLARE EXTERNAL FUNCTION Z$F_F2SQL
CSTRING(256)
RETURNS CSTRING(256)
ENTRY_POINT 'Z$F_F2SQL'
MODULE_NAME 'q_UDFLibC';

DECLARE EXTERNAL FUNCTION Z$F_J2F
CSTRING(256)
RETURNS CSTRING(256)
ENTRY_POINT 'Z$F_J2F'
MODULE_NAME 'q_UDFLibC';

DECLARE EXTERNAL FUNCTION Z$F_VERSION

RETURNS INTEGER BY VALUE 
ENTRY_POINT 'Z$F_VERSION'
MODULE_NAME 'q_UDFLibC';

DECLARE EXTERNAL FUNCTION RAND

RETURNS DOUBLE PRECISION BY VALUE 
ENTRY_POINT 'IB_UDF_rand'
MODULE_NAME 'ib_udf';

/****************** GENERATORS ********************/

CREATE GENERATOR Z$CONTEXT_SEQ;
CREATE GENERATOR Z$PK_GEN;
CREATE GENERATOR Z$SERVER_NUMBER;
/******************** DOMAINS *********************/

CREATE DOMAIN LONG_NAME
 AS VARCHAR(50)
 DEFAULT ''
 COLLATE NONE;
CREATE DOMAIN Z$PASSWORD
 AS VARCHAR(20)
 DEFAULT ''
 COLLATE NONE;
CREATE DOMAIN Z$PHONE_NUMBER
 AS VARCHAR(80)
 DEFAULT ''
 COLLATE NONE; 
CREATE DOMAIN Z$EMAIL
 AS VARCHAR(80)
 DEFAULT ''
 COLLATE NONE; 
CREATE DOMAIN PK
 AS VARCHAR(32)
 NOT NULL
 COLLATE NONE;
CREATE DOMAIN PKR
 AS VARCHAR(32)
 COLLATE NONE;
CREATE DOMAIN REFER
 AS VARCHAR(32)
 COLLATE NONE;
CREATE DOMAIN SHORT_NAME
 AS VARCHAR(20)
 DEFAULT ''
 COLLATE NONE;
CREATE DOMAIN TEXT320
 AS VARCHAR(320)
 DEFAULT ''
 COLLATE NONE;
CREATE DOMAIN TEXT40
 AS VARCHAR(40)
 DEFAULT ''
 COLLATE NONE;
CREATE DOMAIN TEXT80
 AS VARCHAR(80)
 DEFAULT ''
 COLLATE NONE;
CREATE DOMAIN TO_UPK
 AS VARCHAR(32)
 COLLATE NONE;
CREATE DOMAIN T_STATUS
 AS VARCHAR(20)
 DEFAULT ''
 COLLATE NONE;
/******************* PROCEDURES ******************/

SET TERM ^ ;
CREATE PROCEDURE Z$GEN_PK (
    STEP INTEGER )
RETURNS (
    REF REFER )
AS
BEGIN SUSPEND; END^
SET TERM ; ^

SET TERM ^ ;
CREATE PROCEDURE Z$RUN (
    SESSION VARCHAR(40),
    ACT VARCHAR(40),
    CID INTEGER,
    PKREF INTEGER,
    VALU VARCHAR(1000),
    PUBLIC_PARAMETERS VARCHAR(1000),
    UPDATES BLOB SUB_TYPE 1 )
RETURNS (
    INFO VARCHAR(1000),
    RES BLOB SUB_TYPE 1 )
AS
BEGIN SUSPEND; END^
SET TERM ; ^

/******************** TABLES **********************/

CREATE TABLE MAIL
(
  REF PK,
  SUBJECT VARCHAR(20),
  TYP INTEGER,
  STATUS INTEGER,
  TO_USER VARCHAR(20),
  CC_USER VARCHAR(20),
  FROM_USER VARCHAR(20),
  THREAD VARCHAR(20),
  KEYWORDS VARCHAR(40),
  READSTAMP TIMESTAMP,
  PENDING INTEGER,
  OUTCOME INTEGER,
  IMPORTANCE INTEGER,
  ATTACHMENT VARCHAR(20),
  BRIEF VARCHAR(4000),
  NOTES BLOB SUB_TYPE 1,
  STAMP TIMESTAMP DEFAULT 'now',
  CONTEXT_1 VARCHAR(20),
  CONTEXT_2 VARCHAR(20),
  DESTINATION TEXT40
);
CREATE TABLE Z$USER
(
  REF PK,
  NAME LONG_NAME,
  OWNER PKR,
  USER_NAME SHORT_NAME,
  PASSWRD Z$PASSWORD,
  LANDING_PAGE VARCHAR(80) DEFAULT 'Home/Guest',
  ACTIVATION_DATE TIMESTAMP DEFAULT 'now',
  EXPIRY_DATE TIMESTAMP DEFAULT '2100/01/01',
  FLAGS VARCHAR(20),
  SKILL_LIST VARCHAR(250),
  KEY_LIST VARCHAR(250),
  PASSWORD_FORCE_CHANGE_ON TIMESTAMP,
  LANGUAGE PKR,
  TEAM PKR,
  IMAGE PKR,
  MOBILE_NUMBER Z$PHONE_NUMBER,
  EMAIL Z$EMAIL,
  GP_INPUT VARCHAR(250),
  IM VARCHAR(200)
);
CREATE TABLE TODO_MVC
(
  REF PK,
  NAME VARCHAR(100),
  OWNER PKR,
  STATUS VARCHAR(10),
  CREATED_STAMP TIMESTAMP DEFAULT 'now'
);
CREATE TABLE Z$CONTEXT
(
  PK INTEGER,
  TSTAMP TIMESTAMP,
  OPERATOR_REF VARCHAR(32),
  SESSION_REF VARCHAR(32),
  CURRENT_PAGE INTEGER,
  LINKED_FROM_CID INTEGER,
  LINKED_FROM_INDX INTEGER,
  ID VARCHAR(32)
);
CREATE TABLE Z$DICTIONARY
(
  REF VARCHAR(20),
  COY VARCHAR(20),
  NAME VARCHAR(40),
  CONTEXT VARCHAR(20),
  INDX INTEGER,
  VALU VARCHAR(40),
  EXTRA VARCHAR(40),
  BIN BLOB SUB_TYPE 1
);
CREATE TABLE Z$INSERTREF
(
  NON_MATCH VARCHAR(20),
  INSERT_REF VARCHAR(20)
);
CREATE TABLE Z$PK_CACHE
(
  MASTER INTEGER,
  INDX INTEGER,
  FIELD_NAME VARCHAR(40),
  VALU VARCHAR(1000),
  BASERECORD INTEGER,
  TARGET VARCHAR(100),
  QUERY VARCHAR(100),
  BODY VARCHAR(1000),
  PAGE_PARAMS VARCHAR(1000),
  PK_FIELD_NAME VARCHAR(40),
  NEW_VALUE VARCHAR(1000),
  OLD_VALUE VARCHAR(1000),
  NEW_VALUE_SET INTEGER,
  TARGET_VALUES VARCHAR(256),
  TARGET_FIELDS VARCHAR(100)
);
CREATE TABLE Z$SP
(
  PK INTEGER,
  TSTAMP TIMESTAMP,
  FILE_NAME VARCHAR(250),
  CODE VARCHAR(32000),
  SCRIPT BLOB SUB_TYPE 1,
  REMOVE_STAMP TIMESTAMP
);
CREATE TABLE Z$VARIABLES
(
  REF VARCHAR(80),
  VALU VARCHAR(256),
  STAMP TIMESTAMP DEFAULT 'now',
  EXPIRE TIMESTAMP
);
/********************* VIEWS **********************/

/******************* EXCEPTIONS *******************/

/******************** TRIGGERS ********************/
SET TERM ^ ;
CREATE TRIGGER TODO_MVC_BI FOR TODO_MVC ACTIVE
BEFORE INSERT POSITION 0
AS
BEGIN
  if (new.ref is null) then
     select ref from Z$GEN_PK(1) into new.ref;
END^
SET TERM ; ^

SET TERM ^ ;
CREATE TRIGGER MAIL_BI FOR MAIL ACTIVE
BEFORE INSERT POSITION 0
AS
BEGIN
if (new.ref is null) then
 select ref from Z$GEN_PK(1) into new.ref;
END^
SET TERM ; ^



SET TERM ^ ;
CREATE TRIGGER Z$USER FOR Z$USER ACTIVE
BEFORE INSERT POSITION 0
AS
BEGIN
if (new.ref is null) then
    select ref from Z$GEN_PK(1) into new.ref;

END^
SET TERM ; ^
SET TERM ^ ;
CREATE TRIGGER Z$DICTIONARY_BI FOR Z$DICTIONARY ACTIVE
BEFORE INSERT POSITION 0
AS
BEGIN
    /* enter trigger code here */ 
if (new.ref is null) then
  begin
    select ref from Z$GEN_PK(1) into new.ref;
  end
END^
SET TERM ; ^
SET TERM ^ ;
CREATE TRIGGER Z$SP_BI FOR Z$SP ACTIVE
BEFORE INSERT POSITION 0
AS
BEGIN
    new.pk = gen_id( Z$CONTEXT_seq, 1 );
    new.tstamp='now';
END^
SET TERM ; ^

SET TERM ^ ;
ALTER PROCEDURE Z$GEN_PK (
    STEP INTEGER )
RETURNS (
    REF REFER )
AS
begin  
  Ref =  gen_id(Z$SERVER_NUMBER, 0) || '.' || gen_id(Z$PK_GEN, :step);
  suspend;
END^
SET TERM ; ^

CREATE INDEX IDX_Z$PK_CACHE2 ON Z$PK_CACHE (MASTER,NEW_VALUE_SET,VALU,QUERY,PK_FIELD_NAME);

SET TERM ^ ;
ALTER PROCEDURE Z$RUN (
    SESSION VARCHAR(40),
    ACT VARCHAR(40),
    CID INTEGER,
    PKREF INTEGER,
    VALU VARCHAR(1000),
    PUBLIC_PARAMETERS VARCHAR(1000),
    UPDATES BLOB SUB_TYPE 1 )
RETURNS (
    INFO VARCHAR(1000),
    RES BLOB SUB_TYPE 1 )
AS
DECLARE VARIABLE o_ref    varchar(40);
DECLARE VARIABLE o_session varchar(40);
DECLARE VARIABLE passw    varchar(20) ='';
DECLARE VARIABLE usern    varchar(20) ='';
DECLARE VARIABLE LANDING_PAGE varchar(100) ;
DECLARE VARIABLE currentpage varchar(100);

DECLARE VARIABLE table_name varchar(100);
DECLARE VARIABLE target_field_name  varchar(100);
DECLARE VARIABLE target_fields     varchar(100);
DECLARE VARIABLE pk_field_name  varchar(100);
DECLARE VARIABLE pk_val  varchar(100);    

DECLARE VARIABLE current_page_pk  integer;
DECLARE VARIABLE i        integer;
DECLARE VARIABLE update_cid integer;


DECLARE VARIABLE bp        integer;
DECLARE VARIABLE val       varchar(10000);
DECLARE VARIABLE c         integer;
DECLARE VARIABLE len       integer;
DECLARE VARIABLE bt        char(1);

DECLARE VARIABLE pk        integer;
DECLARE VARIABLE pki       integer=1;

DECLARE VARIABLE script    BLOB SUB_TYPE 1;
DECLARE VARIABLE Openstr   varchar(1000);

DECLARE VARIABLE page_params  varchar(1000)='';    

BEGIN
/*test code:
SELECT p.RES,info FROM Z$RUN ('SESSION1', 'ACT', 999,999, 'VALU', 'u08USER8002p041257x00end') p;

SELECT info,p.RES FROM Z$RUN ('SESSION1', 'ACT', 999,999, 'VALU', 'u08USER8002p041258x00end') p;

*/
    /*read the Session, CID,PKRef info*/
    --info='mark1';  suspend;
    /*post updates - and check for username passwords*/    
    bp=1;    
    c=0;
    while (c<1000) do 
      BEGIN
          c=c+1;
          bt=SUBSTRING (UPDATES FROM bp FOR 1);   
          /*info=SUBSTRING (UPDATES FROM bp FOR 1); suspend; */
          if (bt>='a') THEN 
              BEGIN /*small case are short fields*/
                  len=cast(SUBSTRING (UPDATES FROM bp+1 FOR 2) as integer);        
                  val=SUBSTRING (UPDATES FROM bp+3 FOR len);        
                  bp=bp+3+len;              
              END
            ELSE
              BEGIN
                  len=cast(SUBSTRING (UPDATES FROM bp+1 FOR 5) as integer);        
                  val=SUBSTRING (UPDATES FROM bp+6 FOR len);        
                  bp=bp+6+len;              
              END
          
            bt=LOWER(bt);
                 if (bt='u') THEN  usern=val ;       
            else if (bt='p') THEN  passw=val ;       
            else if (bt='c') THEN  update_cid=val ;  -- used as tempory storage                 
            else if (bt='k') THEN  i=cast(val as integer); /*Key field update - used as temporary storage                 */
            else if (bt='v') THEN /*Key value update - temp cache*/
                     BEGIN
						--softcodec code from the compiler	
						SELECT first 1 COALESCE(b.PAGE_PARAMS,'') FROM Z$PK_CACHE b 
						    WHERE b.MASTER = :update_cid AND b.INDX = :i INTO :script;
						if (script<>'') THEN
                            EXECUTE STATEMENT(script)(:val) INTO :val; 
						
						--val=clean_escape(val);--not needed we are using paramitzed stament
						update Z$PK_CACHE a set a.new_value=:val , a.NEW_VALUE_SET=1
							WHERE a.MASTER = :update_cid AND a.INDX = :i;						
                     END                     
            else if (bt='w') THEN /*Key value update - write updates per record*/
                     BEGIN
                        
						for SELECT b.VALU, b.QUERY, b.PK_FIELD_NAME FROM Z$PK_CACHE b 
							WHERE b.MASTER = :update_cid 
							and b.NEW_VALUE_SET=1
							GROUP by b.MASTER,b.NEW_VALUE_SET,b.VALU,b.QUERY,b.PK_FIELD_NAME
							PLAN (b INDEX (IDX_Z$PK_CACHE2) )
                            into :table_name,:pk_val,:pk_field_name do
                        begin     
                            val = pk_field_name;
                            --info=:pk_val;  suspend;
                            --script = '(SELECT first 1 a.QUERY FROM Z$PK_CACHE a WHERE a.MASTER = '||:update_cid||' and a.QUERY='||:pk_val||')' ;
                            script = '?';
                            for SELECT c.TARGET,c.INDX,c.TARGET_FIELDS,c.TARGET_VALUES FROM Z$PK_CACHE c
                                WHERE c.MASTER = :update_cid 
								and c.NEW_VALUE_SET=1
                                and c.VALU=:table_name and c.QUERY=:pk_val and c.PK_FIELD_NAME=:pk_field_name
                                into :target_field_name,:i,:target_fields,:Openstr do
                                begin                        
                                --info=:val;  suspend;
                                --info=:target_field_name;  suspend;    
                                    val = val||','||:target_field_name||COALESCE(:target_fields,'');
                                    --info=:val;  suspend;    
                                    script = script || ',(select a.new_value from Z$PK_CACHE a where a.MASTER ='||:update_cid||
                                    ' AND a.INDX = '||:i||')'||COALESCE(:Openstr,'');                             
                                end 
                             --update set= tags  
                                
                            
                            script = 'update or insert into '||:table_name||' ('||
                                    val||') values ('||script||') matching ('||pk_field_name||')';

                            
                            --fixup pk for insert methods
                            if ((pk_val is null ) or (OCTET_LENGTH(pk_val)<=1)) then
                                BEGIN
                                   select (ref) from Z$GEN_PK(1) into :pk_val;
                                   --info=:pk_val;  suspend;
                                   --info=:script;  suspend;
                                END
                            --info=:script;  suspend;    
                            EXECUTE STATEMENT(script)(pk_val); 
                            update Z$PK_CACHE a set new_value=null,a.NEW_VALUE_SET=null WHERE a.MASTER = :update_cid;
                            --trigger based validations will emit erors into a log that can be fed back to the user
                            
                        end  
                     END                     
            else c=1001;
                  
      END

    --info='mark2';  suspend;
    --info=:usern||'&'||:passw||'&'||:currentpage;  suspend;
    /*part of post updates is creating a new session if login info is supplied*/

    if (usern='') THEN    
        BEGIN
			if (PKRef<>0) then
			    begin
					SELECT a.target,COALESCE(a.PAGE_PARAMS,'') FROM Z$PK_CACHE a WHERE a.MASTER = :CID AND a.INDX = :PKRef into :currentpage,:page_params;              
					if (currentpage='') then PKRef=0;
				end	
		
		    --refresh page
			if (PKRef=0) then
			    begin
				    SELECT r.LINKED_FROM_CID, r.LINKED_FROM_INDX FROM Z$CONTEXT r where r.pk=:CID into :CID,:PKRef;
					SELECT a.target,COALESCE(a.PAGE_PARAMS,'')||:page_params FROM Z$PK_CACHE a WHERE a.MASTER = :CID AND a.INDX = :PKRef into :currentpage,:page_params;              				    
				end
				

				
            /*get the new page, and context info */                
            SELECT r.OPERATOR_REF, r.ID FROM Z$CONTEXT r where r.pk=:CID into :o_ref,:o_session;
            /*todo validate o_session against session*/
                        
            SELECT LANDING_PAGE FROM Z$USER WHERE REF = :o_ref into :LANDING_PAGE;


            
			
            --if (currentpage is null) then usern='SessionExpired';
            --info=:CID||'&'||:PKRef||'& '||'/'||COALESCE(:currentpage,'');  suspend;
            
        END
    
    if (usern<>'') THEN
        begin
          o_ref=NULL;
          /*alow them to login even if expired,  the dashboard gives information that they have expired...*/
          select first 1 ref,LANDING_PAGE from Z$USER where USER_NAME=:usern and PASSWRD=:passw into :o_ref,:LANDING_PAGE;
          /*if null then select the nobody user */
          if (o_ref is NULL) then 
              select first 1 ref,LANDING_PAGE from Z$USER where USER_NAME='Guest' into :o_ref,:LANDING_PAGE;
          
          /*info=:o_ref||'&'||:LANDING_PAGE||'&'||:passw||'&';  suspend;*/
          
         currentpage = '//'||LANDING_PAGE||'/Index';
          
         current_page_pk=NULL;
         pk = gen_id( Z$CONTEXT_seq, 1 );          
         INSERT INTO Z$CONTEXT (PK, TSTAMP, OPERATOR_REF, ID) 
                             VALUES (:pk,'now', :o_ref,       :SESSION    );
         
         --this record is so we can save and reload the first page                    
         INSERT INTO Z$PK_CACHE (MASTER, INDX, FIELD_NAME, VALU,TARGET,QUERY, PAGE_PARAMS)
            VALUES (:pk,0,'click','Z$USER', :currentpage , 'ref='''||replace(:o_ref,'''','''''')||'''','');  
                             
         CID = pk;           
          
        end           
        
               
/*          INSERT INTO Z$PK_CACHE (MASTER, INDX, FIELD_NAME, VALU, BASERECORD) VALUES (:pk,:pki,'master_ref','', '');*/


    --info='mark3';  suspend;  
          
      /*info=:o_ref||'&'||:LANDING_PAGE||'&'||:currentpage||'&'||:passw||'&'||COALESCE(current_page_pk,'null');  suspend;          */
      /*execute the page or SP*/  
    Openstr = 'EXECUTE BLOCK RETURNS  (info varchar(200),res blob SUB_TYPE 1)AS declare pki integer='||CID||';declare pkf integer='||PKRef||';'
         --||COALESCE(:public_parameters,'')
		 --||COALESCE(:page_params,'')
         ||'declare z$sessionid varchar(40)='''||:SESSION||''''
         ||';'; 
    --info='mark36';  suspend;    
	--info=COALESCE(:page_params,'');  suspend;    
	
    --further match language and coy custom files  
    SELECT first 1 pk,:Openstr||q.SCRIPT FROM Z$SP q where file_name=:currentpage into :current_page_pk,:script ;
    if (script is null) then /*back home or direct to an 404 error page ..?*/                    
        SELECT first 1 pk,:Openstr||q.SCRIPT FROM Z$SP q where 
                   file_name='//'||(SELECT LANDING_PAGE FROM Z$USER WHERE REF = :o_ref)||'/404' into :current_page_pk,:script ;                        
    if (script is null) then /*global 404 error page */
        SELECT first 1 pk,:Openstr||q.SCRIPT FROM Z$SP q where file_name='//Default/404' into :current_page_pk,:script ;                        
      
      
    /*both inline script and SP will be launched with the same method, to pass the parameters.
       for SP it will just be a small stub of script.
       
       we cannot do "execute procedure :pName ..." --would be nice...and faster
       it may be better to launch the execute procedure from a bunch of if statements..?
      */      
     --info='mark4';  suspend;  
     if (script is null) then
        begin 
           info='No script named : '||:currentpage;  suspend;
        end
        ELSE   
        begin           
		  script = replace(:script,'--assign_params',COALESCE(:page_params,''));
          --res= :script ;  suspend;
          FOR EXECUTE STATEMENT script INTO :info,:res DO suspend;
        end    
    
    
    
        /*when any do
        begin
          / *handle above error* /
        end */
        
          
END^
SET TERM ; ^

SET TERM ^ ;
CREATE PROCEDURE Z$TimeSamp_RANGE (
    FROM_TIME TIMESTAMP,
    TO_TIME TIMESTAMP ,
    STEP integer 
    )
RETURNS (
    INDX INTEGER,
    THE_START TIMESTAMP,
    THE_END TIMESTAMP )
AS
BEGIN
  
    
  indx=0;  
  THE_start = FROM_TIME;
  while (THE_start<to_time) do
    begin    
    if (STEP=2629800) --constant for a month 365.25*85400/12
    THEN THE_END  = ADDMONTH(THE_start,1);     
    ELSE THE_END  = THE_start + (STEP/86400.000000000000);  
    suspend; 
    THE_start=THE_END;           
    indx = indx+1;    
    end  

END^
SET TERM ; ^

SET TERM ^ ;
CREATE PROCEDURE Z$INTEGER_RANGE (
    FROM_I INTEGER,
    TO_I INTEGER ,
    STEP integer 
    )
RETURNS (
    INDX INTEGER,
    THE_START INTEGER,
    THE_END INTEGER )
AS
BEGIN
    
  indx=0;  
  THE_start = FROM_I;
  while (THE_start<TO_I) do
    begin         
    THE_END  = THE_start + STEP;  
    suspend; 
    THE_start=THE_END;           
    indx = indx+1;    
    end  

END^
SET TERM ; ^


CREATE INDEX IDX_MAIL1 ON MAIL (REF);
CREATE INDEX IDX_MAIL2 ON MAIL (FROM_USER);
CREATE INDEX IDX_MAIL3 ON MAIL (TO_USER);
CREATE INDEX IDX_MAIL4 ON MAIL (SUBJECT);

CREATE INDEX IDX_ME1 ON Z$USER (REF);
CREATE INDEX IDX_ME4 ON Z$USER (USER_NAME);
CREATE INDEX IDX_Z$CONTEXT1 ON Z$CONTEXT (PK);
CREATE INDEX IDX_Z$PK_CACHE1 ON Z$PK_CACHE (MASTER,INDX);

CREATE INDEX IDX_Z$SP1 ON Z$SP (PK);
CREATE INDEX IDX_Z$SP2 ON Z$SP (FILE_NAME);
GRANT EXECUTE
 ON PROCEDURE Z$GEN_PK TO  SYSDBA;

GRANT EXECUTE
 ON PROCEDURE Z$RUN TO  SYSDBA;

GRANT DELETE, INSERT, REFERENCES, SELECT, UPDATE
 ON MAIL TO  SYSDBA WITH GRANT OPTION;

GRANT DELETE, INSERT, REFERENCES, SELECT, UPDATE
 ON Z$USER TO  SYSDBA WITH GRANT OPTION;

GRANT DELETE, INSERT, REFERENCES, SELECT, UPDATE
 ON TODO_MVC TO  SYSDBA WITH GRANT OPTION;

GRANT DELETE, INSERT, REFERENCES, SELECT, UPDATE
 ON Z$CONTEXT TO  SYSDBA WITH GRANT OPTION;

GRANT DELETE, INSERT, REFERENCES, SELECT, UPDATE
 ON Z$DICTIONARY TO  SYSDBA WITH GRANT OPTION;

GRANT DELETE, INSERT, REFERENCES, SELECT, UPDATE
 ON Z$INSERTREF TO  SYSDBA WITH GRANT OPTION;

GRANT DELETE, INSERT, REFERENCES, SELECT, UPDATE
 ON Z$PK_CACHE TO  SYSDBA WITH GRANT OPTION;

GRANT DELETE, INSERT, REFERENCES, SELECT, UPDATE
 ON Z$SP TO  SYSDBA WITH GRANT OPTION;

GRANT DELETE, INSERT, REFERENCES, SELECT, UPDATE
 ON Z$VARIABLES TO  SYSDBA WITH GRANT OPTION;


COMMIT;

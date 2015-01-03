SET TERM ^ ;
ALTER PROCEDURE Z_RUN (
    SESSION VARCHAR(40),
    ACT VARCHAR(40),
    CID INTEGER,
    PKR INTEGER,
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
DECLARE VARIABLE homepage varchar(100) ;
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
SELECT p.RES,info FROM Z_RUN ('SESSION1', 'ACT', 999,999, 'VALU', 'u08USER8002p041257x00end') p;

SELECT info,p.RES FROM Z_RUN ('SESSION1', 'ACT', 999,999, 'VALU', 'u08USER8002p041258x00end') p;

*/
    /*read the Session, CID,PKR info*/
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
						SELECT first 1 COALESCE(b.master_fields,'') FROM FIELD_DETAIL b 
						    WHERE b.MASTER = :update_cid AND b.INDX = :i INTO :script;
						if (script<>'') THEN
                            EXECUTE STATEMENT(script)(:val) INTO :val; 
						
						--val=clean_escape(val);--not needed we are using paramitzed stament
						update FIELD_DETAIL a set a.new_value=:val , a.NEW_VALUE_SET=1
							WHERE a.MASTER = :update_cid AND a.INDX = :i;						
                     END                     
            else if (bt='w') THEN /*Key value update - write updates per record*/
                     BEGIN
                        
						for SELECT b.VALU, b.QUERY, b.PK_FIELD_NAME FROM FIELD_DETAIL b 
							WHERE b.MASTER = :update_cid 
							and b.NEW_VALUE_SET=1
							GROUP by b.MASTER,b.NEW_VALUE_SET,b.VALU,b.QUERY,b.PK_FIELD_NAME
							PLAN (b INDEX (IDX_FIELD_DETAIL2) )
                            into :table_name,:pk_val,:pk_field_name do
                        begin     
                            val = pk_field_name;
                            --info=:pk_val;  suspend;
                            --script = '(SELECT first 1 a.QUERY FROM FIELD_DETAIL a WHERE a.MASTER = '||:update_cid||' and a.QUERY='||:pk_val||')' ;
                            script = '?';
                            for SELECT c.TARGET,c.INDX,c.TARGET_FIELDS,c.TARGET_VALUES FROM FIELD_DETAIL c
                                WHERE c.MASTER = :update_cid 
								and c.NEW_VALUE_SET=1
                                and c.VALU=:table_name and c.QUERY=:pk_val and c.PK_FIELD_NAME=:pk_field_name
                                into :target_field_name,:i,:target_fields,:Openstr do
                                begin                        
                                --info=:val;  suspend;
                                --info=:target_field_name;  suspend;    
                                    val = val||','||:target_field_name||COALESCE(:target_fields,'');
                                    --info=:val;  suspend;    
                                    script = script || ',(select a.new_value from FIELD_DETAIL a where a.MASTER ='||:update_cid||
                                    ' AND a.INDX = '||:i||')'||COALESCE(:Openstr,'');                             
                                end 
                             --update set= tags  
                                
                            
                            script = 'update or insert into '||:table_name||' ('||
                                    val||') values ('||script||') matching ('||pk_field_name||')';

                            
                            --fixup pk for insert methods
                            if ((pk_val is null ) or (OCTET_LENGTH(pk_val)<=1)) then
                                BEGIN
                                   select (ref) from Gen_REF(1) into :pk_val;
                                   --info=:pk_val;  suspend;
                                   --info=:script;  suspend;
                                END
                            --info=:script;  suspend;    
                            EXECUTE STATEMENT(script)(pk_val); 
                            update FIELD_DETAIL a set new_value=null,a.NEW_VALUE_SET=null WHERE a.MASTER = :update_cid;
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
			if (PKR<>0) then
			    begin
					SELECT a.target,COALESCE(a.master_fields,'') FROM FIELD_DETAIL a WHERE a.MASTER = :CID AND a.INDX = :PKR into :currentpage,:page_params;              
					if (currentpage='') then PKR=0;
				end	
		
		    --refresh page
			if (PKR=0) then
			    begin
				    SELECT r.LINKED_FROM_CID, r.LINKED_FROM_INDX FROM FIELD_MASTER r where r.pk=:CID into :CID,:PKR;
					SELECT a.target,COALESCE(a.master_fields,'')||:page_params FROM FIELD_DETAIL a WHERE a.MASTER = :CID AND a.INDX = :PKR into :currentpage,:page_params;              				    
				end
				

				
            /*get the new page, and context info */                
            SELECT r.OPERATOR_REF, r.ID FROM FIELD_MASTER r where r.pk=:CID into :o_ref,:o_session;
            /*todo validate o_session against session*/
                        
            SELECT HOMEPAGE FROM ME WHERE REF = :o_ref into :homepage;


            
			
            --if (currentpage is null) then usern='SessionExpired';
            --info=:CID||'&'||:PKR||'& '||'/'||COALESCE(:currentpage,'');  suspend;
            
        END
    
    if (usern<>'') THEN
        begin
          o_ref=NULL;
          /*alow them to login even if expired,  the dashboard gives information that they have expired...*/
          select first 1 ref,homepage from me where Employee_number=upper(:usern) and short_user_code=upper(:passw) into :o_ref,:homepage;
          /*if null then select the nobody user */
          if (o_ref is NULL) then 
              select first 1 ref,homepage from me where Employee_number='GUESTUSER' into :o_ref,:homepage;
          
          /*info=:o_ref||'&'||:homepage||'&'||:passw||'&';  suspend;*/
          
         currentpage = '//'||homepage||'/Index';
          
         current_page_pk=NULL;
         pk = gen_id( Field_master_seq, 1 );          
         INSERT INTO FIELD_MASTER (PK, TSTAMP, OPERATOR_REF, ID) 
                             VALUES (:pk,'now', :o_ref,       :SESSION    );
         
         --this record is so we can save and reload the first page                    
         INSERT INTO FIELD_DETAIL (MASTER, INDX, FIELD_NAME, VALU,TARGET,QUERY, MASTER_FIELDS)
            VALUES (:pk,0,'click','me', :currentpage , 'ref='''||replace(:o_ref,'''','''''')||'''','');  
                             
         CID = pk;           
          
        end           
        
               
/*          INSERT INTO FIELD_DETAIL (MASTER, INDX, FIELD_NAME, VALU, BASERECORD) VALUES (:pk,:pki,'master_ref','', '');*/


    --info='mark3';  suspend;  
          
      /*info=:o_ref||'&'||:homepage||'&'||:currentpage||'&'||:passw||'&'||COALESCE(current_page_pk,'null');  suspend;          */
      /*execute the page or SP*/  
    Openstr = 'EXECUTE BLOCK RETURNS  (info varchar(200),res blob SUB_TYPE 1)AS declare pki integer='||CID||';declare pkf integer='||PKR||';'
         --||COALESCE(:public_parameters,'')
		 --||COALESCE(:page_params,'')
         ||'declare z$sessionid varchar(40)='''||:SESSION||''''
         ||';'; 
    --info='mark36';  suspend;    
	--info=COALESCE(:page_params,'');  suspend;    
	
    --further match language and coy custom files  
    SELECT first 1 pk,:Openstr||q.SCRIPT FROM FIELD_SQL q where file_name=:currentpage into :current_page_pk,:script ;
    if (script is null) then /*back home or direct to an 404 error page ..?*/                    
        SELECT first 1 pk,:Openstr||q.SCRIPT FROM FIELD_SQL q where 
                   file_name='//'||(SELECT HOMEPAGE FROM ME WHERE REF = :o_ref)||'/404' into :current_page_pk,:script ;                        
    if (script is null) then /*global 404 error page */
        SELECT first 1 pk,:Openstr||q.SCRIPT FROM FIELD_SQL q where file_name='//Default/404' into :current_page_pk,:script ;                        
      
      
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


GRANT EXECUTE
 ON PROCEDURE Z_RUN TO  SYSDBA;


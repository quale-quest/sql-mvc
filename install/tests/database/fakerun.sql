

connect '127.0.0.1:guest.fdb' user 'SYSDBA' password 'pickfb25';

show tables;

select PK,TStamp,octet_length(coalesce(code,'1')),trim(FILE_NAME) from FIELD_SQL;


  
SELECT info,RES FROM Z_RUN ('10:18:48.968','',1000,0,'','','u08USER8002p041257w00x00');
  
  

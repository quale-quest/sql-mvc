# Todo Overview,

## Ongoing
* documentation

## WIP 

* 90% done - mysql driver
* mssql driver


## Undocumented features ------------------------------------------------------Undocumented features
* zx.dbu.sql_make_compatable(zx,
* varx.code in db_fb_sql_gen.js:523 : execute statement st into -- allows sql procedure to be called as a function
* compound_statement_debug

## TODO             -----------------------------------------------------------TODO

* use of Fix mysql generator table 
* /CREATE\s+SEQUENCE\s+([\w$]+)/i)  - reconcile with getnerator - to reduce code
* separate sql drivers into separate files?

* make "Insert if not exiting" for   INSERT INTO user_table_name (user_landing_page,user_display_field,user_name_field,user_password_field) values ('Home/Guest','Guest','user_guest_name','AnyPassword');

* Move FB to a new package or combine in main package?
* FACE BOOK Procedures in facebook_model.quicc
* FACE BOOK LOGIN

* combine insertref table with dictionary table

* check all triggers must be deleted to be updated?
* switch pk between auto incement and uuid
* use build_variable_passing instead of the page params for passing paramaters cuch as ?cond_proc?

* use of backtic for ` field/table names - and " for firebird

* Facebook login testing
* UDF functions?
* TRIGGER Z$SP_BI we increment by 1000 as we have sub procedures that are indexed relative to this index*/
* todo Z$TimeStamp_RANGE for mysql in extras_model.quic

## DEFER            -----------------------------------------------------------DEFER
* Apps with multiple DB drivers?


## SQL Translations -----------------------------------------------------------SQL Translations
* fb "matching" translate to mysql
* MAXDATE in expressions		

## Documentation    -----------------------------------------------------------Documentation


## Testing          -----------------------------------------------------------Testing
* Gallary does not reload after uploading a file - used to work
* POP UP on todo reports

## Later            -----------------------------------------------------------Later
* postgresql driver
MSsql driver

## Defer            -----------------------------------------------------------Defer

## Done

* fake_domains
* simple translations
* Split Z$RUN
* INSERT MATCHING 
* GROUP_CONCAT
* dialect Directive 
* dialect for alternate database specific code in one quicc source file.
* Move database_default_config from config.json
* recombine dark ui
* recombine app changes
* extras_model.quicc   one standard file only
* UPDATE OR INSERT INTO MAIL matching compatablilty
* get config for db engines from alternate file - main config should be kept simple
* remove driver dependant sql from GUI - or atleast use driver directive
* create mysql db from blank
* wtf search for : (fn.indexOf('SaleForm') - why such specific code? -removed		
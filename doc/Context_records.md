*file under - Quale / Quicc extensions to SQL *

##Emulated records
Quuic emulates records and allow access to them from scripts  using a record_name dot field_name notation.
Internal in the database they are either discrete variables or use getter and setter methods, 
and if used at the client side, will be automatically exported into the JSON .

##Predefined records

* operator - (read only) current user info - see below for fields,
* master -  (read only) context info passed from a link on the previous page,
available fields and their content depends on the table that was used to create the link and the record the user clicked on to follow the link. 

##Singleton table records
into Record_name select first 1....;  --creates a in script (in memory read only)  context record from any table record with field according to a singleton selection, select * is not allowed.

##Context records
Context records are visualized and you can have any field name without it being declared, its type is varchar(250) and default is ''.
* session - context variables unique to the current operator in the current log-in session. Session.id is a predefined read only field that reflects the current log-in session id.
* params  - the url parameters passed originally - Read only - see below
* my      - context variables unique to the current operator - persistent until cleared.
* here    - context variables unique to the current operator in the current page, when he re-log-ins the variable will still be here, in this page.
* system   - context variables shared with every one on this database.


set [my|here|system|session].any_field_name=(value|sql expression);  --updates the context immediately

Context records are a key factor in enabling SQL-MVC to be such an effective development platform.

##Examples

```
<#print you were here last at here.this_page_info>
<#:script set here.this_page_info=cast('now' as timestamp);>
--here the context variable is being updated after is had been 
--displayed so it always shows the date of the last update.
```
    
#Operator fields
The following is the default model of the user table. Event though operator. record is read only, you can update the user tables, and those changes will reflect on the next navigation action.

```
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
```

##Exiting project schemes
You may already have a user table in your database, in the config.json you can configure the user table the system uses, so the system can adapt to your scheme (TODO/WIP).

```
"user_table": {
			"table_name": "Z$USER",
			"display_name_field": "Name",
			"primary_key_field": "ref",
			"username_field": "USER_NAME",
			"password_field": "PASSWORD",
			"keys_field": "KEY_LIST"
		},
```

##params

The URL parameters passed to the server, the params are parsed with json_like.js but where ampersand are equivalent to comma.
if a URL param of name 'user' is included it is taken to be the user name and a automatic login is attempted,
additional optional parameters are "password", "app" and "page". 
If no password is supplied the password defaults to 'gu35t'.  If user name or password fails it logs in as user 'guest'.
Guest login can contain some guest app info, and offer a re-login - password recovery or registration.





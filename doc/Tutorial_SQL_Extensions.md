# SQL-MVC Extensions

The principle intention is for the compiler not to have to understand the SQL language.

However we break this rule often, sometimes for good reason sometimes for convenience,
we should avoid doing this.



#DDL statements

1. CREATE_EXTEND extension_name TABLE : 
used to add field to an existing table. Use case facebook_model.quicc adding fields to the basic user table



2.setting a field's qualia as fk will automatically add a trigger and unique number generator to the field.


#DML or PSQL

3. Pseudo variable:
This is actually a platform feature and is desirable, mentioned here for completeness.	





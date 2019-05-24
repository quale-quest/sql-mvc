# SQL-MVC User Preferences,

Not implemented yet.


CREATE TABLE USER_PREFERENCES                        --:{as:"Table"} 
(
  ID PK, 			                                 --:{as:"pk"}
  User_ID FK,										 --:{as:"fk"}
  Show_error_on_open     INTEGER,			         --:{as:"ticked"}  
  Unit_of_measure FK								 --:{as:"fk"}
}

The user preferences should output to a object on the first page load of the user only, cached from then on.

## Preferences

Show_error_on_open : validate all forms when opened
Unit_of_measure : Imperial or metric
Web_Language : any of the i18n languages.

## Implementation

TODO
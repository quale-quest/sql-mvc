"use strict";
/*
speed/memory performance  is not important
ease of use is important
 */

/*
Purpose is to execute model code against the database to perform DDL operations.
To automate the DDL maintenance.
 */

/*

#Guidelines
The following is some guidelines. 

#General
Updating a production  SQL database is always a challenge for the following reasons:
* Data integrity is the number one concern.
* Referral integrity, Stored procedures, triggers and views depend on the table structures, 
   this makes it almost impossible sometimes to change a table. The intricacy  mean a programmer 
   has to plan a upgrade path and implement a process.
* often this this would involve
    1) taking the database off-line (single user mode).
    2) deleting some or all triggers, stored procedures, views and referral integrity.
    4) altering simple columns.
    5) creating new columns, copying / transforming data, drop the old columns, rename the new columns back.
    6) recreating triggers, stored procedures, views and referral integrity.
* this process is much to delicate to automate without extensive testing.
* for this reason organisations often don't allow programmers to make such changes and rather 
have (highly paid)dedicated database administrators for such tasks.    
   

Updating a development database is fortunately not so bad because data integrity is not a concern, but development time is.
so it is ok to "trust" a automated process on a dev database.

So on a production database the compiler won't attempt any DDL updates, it trusts the models match the actual database.

During early stages of development it useful not to have to much referral integrity, as it makes such updates difficult,
add it in during later stages of development.
(it would be nice in this updater code to to be able to switch of referral integrity.)

#updater features 
##during application compiling.
* can do simple table changes(or create) according to model files.
* can add indexes, triggers and stored procedures.
* can populate demo data according to simple scripts.

##command line
* can export a schema update script from the development database.
* can import the schema update script to another database.


#Workflow
* create database - command line   sql-mvc database [-a application] new_name
* update/add model files.
* update / add application pages.
* the compiler will see the model changes and update the database schema.
* test the application.
* export the schema update script, and review, possibly keep in GIT for version control.
* clone the production box including database to a sandbox.
* update the sandbox to the new upp and test.
* clone the production box including database to a backup / standby.
* optionally take the production box off-line
* update the production box to the new app and test.
* bring the production box on-line
   
*/
 

exports.init = function (zx) {
//

};





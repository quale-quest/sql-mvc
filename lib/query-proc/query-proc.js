"use strict";


/*
This is a place holder for future code.

query-proc.js is a js based stored procedure emulator / proxy.

It is an alternative to database centric stored procedures.

It is intended for use with databases that do not have stored procedure facilities
such as sqlite, no-sql databases or web services.
It will also find use where the stored procedure must query multiple data sources.

It is intended to be able to run either server side or client side,
for web applications without a central server. 

This could be combined with some replication methods to 
make for totally off-line client apps.


Implementation details:
    The stored procedure text is compiled into a JSON-LR (JSON language representation).
    
    A simple runtime interpreter the tags in the JSON and executes them,    
        the database query (of which ever dialect) is passed almost unaltered(just variable substitution).
        
 */

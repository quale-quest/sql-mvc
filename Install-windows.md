
#Windows experimental

**at the moment this does not work **

The issue we use a old version of node-firebird , beacuse we have a issue with reading blobs 
on the new version, however , on windows the old vesion seens to have a problem with comitting transactions......

This will require further investigations...

Upto now we have :




This is based on windows XP, adjust the paths as needed.
The pre compiled dll is 32 bit I don't know if 64bit server will run with this DLL.

This installation guide is far from perfected , 
so it may cause a lot more pain than needed,
promise it will be worth it in the end.

##Firebird

Install:
1. http://www.firebirdsql.org/en/get-started/
2. http://www.flamerobin.org/

##Node and gyp

install 
1. http://nodejs.org/download/
2. node-gyp requirements, details at : https://github.com/TooTallNate/node-gyp


##sql-mvc

```
git clone https://github.com/quale-quest/sql-mvc.git   * or "clone in desktop"
cd into the folder
npm install

copy Patches\ss-hogan\new_compiler.js  ..\node_modules\ss-hogan\node_modules\hogan.js\lib\compiler.js
copy Patches\ss-hogan\new_client.js   ..\node_modules\ss-hogan\client.js
copy Patches\ss-hogan\new_engine.js   ..\node_modules\ss-hogan\engine.js
copy Patches\marked\new_marked.js   ..\node_modules\marked\lib\marked.js 
copy Patches\emoji\new_emoji.js  ..\node_modules\emoji\lib\emoji.js
```

##udf pre-compiled 

copy server\udf\q_UDFLibC.dll  "C:\Program Files\Firebird\Firebird_2_5\UDF"

#set configuration

```
"monitor_mode":{"dev":"none",
add "windows":"yes",

in db:

"database": "C:\\data\\demo_db.fdb",
"username": "sysdba",
"password": "whatever",
"authfile": "",
```
		
#manually build the demo index page.

node compile.js app Home/Guest Index

cd server/compiler 
node compile.js app Home/Guest Index 
--this only compiles a single page...the the auto compiler not working yet

run the server
cd ../..
node app.js

point you browser to localhost:3000




 

###test with 
open a test database with [flamerobin](http://www.flamerobin.org/) and run these test commands
DECLARE EXTERNAL FUNCTION Z$F_VERSION
RETURNS INTEGER BY VALUE 
ENTRY_POINT 'Z$F_VERSION'
MODULE_NAME 'q_UDFLibC';


select  Z$F_VERSION() from RDB$DATABASE
	
select Z$F_F2J('abc') from RDB$DATABASE

If you have trouble getting this to work try
 1. run firebird as a program instead of a service
 2. copy ib_util.dll from the firebird lib directory to the UDF directory
 2. Check firebird.conf that UdfAccess is not been enabled.
 3. reboot

 
 
 
 
###Optionals - udf compile your own 
	
install visual studio 
http://download.microsoft.com/download/1/D/9/1D9A6C0E-FC89-43EE-9658-B9F0E3A76983/vc_web.exe	
	
open "visual studio command prompt"  from menu

Adjust your file paths as needed:

```
cd to sql-mvc\server\udf folder of the project

cl.exe /D_USRDLL /D_WINDLL /I "C:\Program Files\Firebird\Firebird_2_5\include"  q_UDFLibC.c "C:\Program Files\Firebird\Firebird_2_5\lib\ib_util_ms.lib"  /link /DLL /OUT:q_UDFLibC.dll

stop the fb server

copy q_UDFLibC.dll C:\Program Files\Firebird\Firebird_2_5\UDF\

start the server again
```	
 
 
 
refs:
http://www.firebirdnews.org/compiling-linux-udfs-on-msvc/
http://stackoverflow.com/questions/1130479/how-to-build-a-dll-from-the-command-line-in-windows-using-msvc






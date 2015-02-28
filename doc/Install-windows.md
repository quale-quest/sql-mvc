
#Windows experimental

**Running on windows, but installer is not refined.**

This installation guide is far from perfected , 
so it may cause a lot more pain than needed,
promise it will be worth it in the end.

##Testes on Windows 7, should work in 8, 10.

##Firebird

1. Install with the default settings from :
http://www.firebirdsql.org/en/firebird-2-5/  either win2 or win64 bit version 
* http://sourceforge.net/projects/firebird/files/firebird-win32/2.5.3-Release/Firebird-2.5.3.26780_0_Win32.exe/download
* http://sourceforge.net/projects/firebird/files/firebird-win64/2.5.3-Release/Firebird-2.5.3.26780_0_x64.exe/download

Optional Install:
http://www.flamerobin.org/


##Node

Install node from:

1. http://nodejs.org/download/




No longer needed : 
##Node and gyp

Install :

1. http://nodejs.org/download/
2. node-gyp requirements, details at : https://github.com/TooTallNate/node-gyp


##Socket stream requirements
https://www.npmjs.com/package/socketstream#will-it-run-on-windows

##sql-mvc

```
git clone https://github.com/quale-quest/sql-mvc.git   * or "clone in desktop"
cd into the folder
npm install

cd install
copy Patches\ss-hogan\new_compiler.js  ..\node_modules\ss-hogan\node_modules\hogan.js\lib\compiler.js /y
copy Patches\ss-hogan\new_client.js   ..\node_modules\ss-hogan\client.js /y
copy Patches\ss-hogan\new_engine.js   ..\node_modules\ss-hogan\engine.js /y
copy Patches\marked\new_marked.js   ..\node_modules\marked\lib\marked.js /y
copy Patches\emoji\new_emoji.js  ..\node_modules\emoji\lib\emoji.js /y
cd ..
```

##pre-compiled UDF

copy server\udf\q_UDFLibC.dll  "C:\Program Files\Firebird\Firebird_2_5\UDF"

##set configuration

```
edit Quale\Config\config.json
set "dev":{"monitor_mode":"none",
add "windows":"yes",

in db record:

set "database": "C:\\data\\demo_db.fdb",
set "username": "sysdba",
set "password": "whatever the server is set to",
set "authfile": "",
```
		
##manually build the demo index page.



node  server\compiler\compile.js app Home/Guest Index

--this only compiles a single page...the the auto compiler not working yet

##run the server
cd ../..
node app.js

point you browser to localhost:3000

Only the index page will load, it will look ok but the actions wont work...yet



 

##Trouble shooting
If you have trouble getting this to work try:

1. run firebird as a program instead of a service
2. copy ib_util.dll from the firebird lib directory to the UDF directory
2. Check firebird.conf that UdfAccess is not been enabled.
3. reboot
4. manually test the firebird connection with flamerobin
5. manually test the UDF (procedure below)
5. manually build the UDF (especially 64 bit server)
 

###test UDF lib with 
open a test database with [flamerobin](http://www.flamerobin.org/) and run these test commands
DECLARE EXTERNAL FUNCTION Z$F_VERSION
RETURNS INTEGER BY VALUE 
ENTRY_POINT 'Z$F_VERSION'
MODULE_NAME 'q_UDFLibC';


select  Z$F_VERSION() from RDB$DATABASE
	
select Z$F_F2J('abc') from RDB$DATABASE
 
 
 
###Optionals - udf compile your own 
	
install visual studio 
http://download.microsoft.com/download/1/D/9/1D9A6C0E-FC89-43EE-9658-B9F0E3A76983/vc_web.exe	
	
open "visual studio command prompt"  from menu

Adjust your file paths as needed:

```
cd to sql-mvc\server\udf folder of the project

cl.exe /D_USRDLL /D_WINDLL /I "C:\Program Files\Firebird\Firebird_2_5\include"  q_UDFLibC.c "C:\Program Files\Firebird\Firebird_2_5\lib\ib_util_ms.lib"  /link /DLL /OUT:q_UDFLibC.dll

stop the fb server

copy q_UDFLibC.dll "C:\Program Files\Firebird\Firebird_2_5\UDF\"

start the server again
```	
  
refs:
http://www.firebirdnews.org/compiling-linux-udfs-on-msvc/
http://stackoverflow.com/questions/1130479/how-to-build-a-dll-from-the-command-line-in-windows-using-msvc





#Windows manual install (experimental)

##Tested on Windows 7, should work in 8, 10.

##Install Firebird

Install with the default settings from :
http://www.firebirdsql.org/en/firebird-2-5/  either win2 or win64 bit version 
* http://sourceforge.net/projects/firebird/files/firebird-win32/2.5.3-Release/Firebird-2.5.3.26780_0_Win32.exe/download
* http://sourceforge.net/projects/firebird/files/firebird-win64/2.5.3-Release/Firebird-2.5.3.26780_0_x64.exe/download

Optional Install:
http://www.flamerobin.org/


##Install Node

Install node from:

1. http://nodejs.org/download/


##Install SQL-MVC from npm
right click and run the "node js command prompt" (Back command link not the green node Icon) as administrator

![run-node as admin](https://github.com/quale-quest/sql-mvc/blob/master/doc/win/win-run-as-admin.png "run node as admin")
>mkdir and cd /some project folder
>npm install sql-mvc
>cd node-modules/sql-mvc

##manually build the app.

>node  server\compiler\compile.js app Home/Guest all

>node app.js

Windows will warn about opening the firewall, allow node all access. 

Open a browser to localhost:3000

##Edit the Index.quicc file and models/controllers.
but manually rebuild the app again with 

>node  server\compiler\compile.js app Home/Guest all


** windows automated installer to follow soon **




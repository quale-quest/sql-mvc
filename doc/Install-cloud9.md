
#Getting started with SQL-MVC on the cloud9 IDE:

To get started, first sign up for a free account on cloud 9 https://c9.io/

Go to your dashboard.

Create a new "Hosted" workspace, 
![Create a new Workspace](https://github.com/quale-quest/sql-mvc/blob/master/doc/c9/c9_1.png "New workspace")

Set the name of your workspace as sql-mvc , leave the workspace privacy as open (free accounts only allow open workspaces)
leave the Hosting as "Hosted", and select "node.js" install :
![Name your new Workspace](https://github.com/quale-quest/sql-mvc/blob/master/doc/c9/c9_2.png "Name your workspace")


Select the workspace under "MY PROJECTS" and click "Start editing" (in green)
![Select the sql-mvc Workspace](https://github.com/quale-quest/sql-mvc/blob/master/doc/c9/c9_3.png "Select workspace")

Your workspace will load.
At the bottom of the work space there will be an open bash terminal:
![terminal](https://github.com/quale-quest/sql-mvc/blob/master/doc/c9/c9_terminal.png "terminal")


Get the install script
>wget https://github.com/quale-quest/sql-mvc/raw/master/install/cloud9.sh
Run the install script
>bash cloud9.sh

The installer will run until, firebird pauses with a message (or two) prompting  "more", just press enter,
then it will prompt for a password, just press enter (This is fine - it is all secure).
![Firebird prompt](https://github.com/quale-quest/sql-mvc/blob/master/doc/c9/c9_fb.png "Firebird prompt")

Then it will run some more...and once done (or in future ) you can run the application with :
> cd demo-app/;sudo node app.js

The application will start running and compile the web pages, once done:

Check the application URL, click on "Share" on the top right.
![Click share](https://github.com/quale-quest/sql-mvc/blob/master/doc/c9/c9_share_1.png "Click share")

And check the Application URL.
![Check the Application URL and where it if you wish](https://github.com/quale-quest/sql-mvc/blob/master/doc/c9/c9_share_2.png "URL")

Share the URL publicly if you want others to also be able connect to it.

Open the URL in a new browser.

Now you will see the application run - exactly the same as the sql-mvc.com site.

To play around, go to the directory tree, navigate to demo-app/Quale/Standard/Home/Guest/MainMenu/02_demos/10_todo_mvc.quicc
![Edit](https://github.com/quale-quest/sql-mvc/blob/master/doc/c9/c9_edit.png "Edit")

edit this file, after the <#view add 
> warning this is just the start
then save with <ctrl-s>, you will notice the file compiling and your web browser 
will reload the page with the change automatically.

Now follow the tutorials on writing a basic 
 at : [Github - Tutorial_basic_1](https://github.com/quale-quest/sql-mvc/blob/master/doc/Tutorial_basic_1.md)

Or check a list of tutorials at :
[Github - Tutorials home](https://github.com/quale-quest/sql-mvc/blob/master/doc/Tutorials.md)





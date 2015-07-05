# Directory structure

The Quale folders contains all the project files.

*We use "Normally" Because you can locate it anywhere.

Normally the Quale directory in the install root or sub-projects contains the user project files.
	InstallRoot
    ├── node_modules
    │   ├── sql-mvc				: The main platform
    │   └── sql-mvc-ui-dark		: User interface Theme
    ├── Quale					->First/Default user project
    │   ├── Config
    │   └── Standard	
    ├── project2				-> more projects named anything
    │   └── Quale
    └── project3
        └── Quale


Normally the node_modules/sql-mvc/Quale contains the system libraries.	 
InstallRoot
    ├── node_modules	 
    │   ├── sql-mvc	
			├── Quale
			│   ├── Lib
			│   │   └── Models
	 
	 
Normally the node_modules/sql-mvc-UI*/Quale contains the UI libraries.	
├── sql-mvc-ui-dark
│   ├── lib
│   └── Quale
│       └── Lib
│           ├── All
│           ├── Elements
│           ├── FootMenu
│           ├── Models
│           └── UserMenu

	
	
The demo app sits  under standard in the platform directory :  Quale/Standard 	
├── Quale
│   ├── Config
│   ├── Custom
│   ├── Lib
│   │   └── Models
│   └── Standard
│       └── Home
│           ├── Controllers
│           ├── Guest
│           │   ├── Controllers
│           │   ├── Dashboard
│           │   ├── Divout
│           │   ├── Help
│           │   ├── MainMenu
│           │   │   ├── 02_Demos
│           │   │   └── 05_Documentation
│           │   ├── Menu
│           │   ├── Models
│           │   ├── Operator
│           │   ├── Popup
│           │   └── Views
│           ├── Layout
│           ├── Models
│           ├── SysAdmin
│           └── User

	
Typical apps will look like this	
├── Quale
│   ├── Config
│   └── Standard
│       ├── Controllers
│       ├── Home
│       │   ├── Guest
│       │   ├── Layout
│       │   ├── SysAdmin
│       │   └── User
│       └── Models




The compiler and server uses 2 directories,
Current working directory for the location of the Quale files, and the location of the executable 
js as the location for the libraries and default support files.

To compile a sub project file
	node ../node_modules/sql-mvc/server/compiler/compile.js  app Home/User Index
to run	a sub project
	node ../node_modules/sql-mvc/app.js
	
	
	
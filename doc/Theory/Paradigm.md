# Paradigm 

A brief overview of some programming paradigms and how Quale fits in.

ref1: https://en.wikipedia.org/wiki/Programming_paradigm
ref2: http://people.cs.aau.dk/~normark/prog3-03/html/notes/paradigms_themes-paradigm-overview-section.html
ref3: https://www.info.ucl.ac.be/~pvr/VanRoyChapter.pdf

A programming paradigm is a fundamental style of computer programming, serving as a way of building the structure and elements of computer programs. 
Many programming languages cannot be strictly classified into one paradigm, but rather include features from several paradigms(ref1).
Each paradigm supports a set of concepts that makes it the best for a certain kind of problem(ref3). 

The language examples below consider their main feature, as ref 1 above mentions they do contain elements of multiple paradigms.

Only two primary paradigm groups exist : 
	declarative : (non Turing complete) examples : regular expressions,Templates,basic Spreadsheets (without scripts),SQL (most of)	
	declarative : (Turing complete) a.k.a functional  : examples :  Haskell,Scheme, MapReduce, Verilog
	imperative  : "first do this, next do that"
	
All other paradigms can be classed into these groups, here we call them derivative paradigms.
	declarative :
		functional : 
		logic 	:seems less natural in the more general areas of computation
		reactive programming
	imperative : 
		procedural,
		structured,
		object-oriented,
		
	

Design patterns are further implemented using several paradigms, often a Design pattern may also be considered a  paradigms.
		MVC  - abstraction
		event-driven 
		test driven
		.
		.

##Are GUI tools a paradigm?
Many productivity tools exists that allow you explore objects, and set their properties through a GUI  interface,
some even allow you to drag and drop objects and connects them graphically. I don't believe the input method of a language
changes its paradigm, these tools may make programming easier for novices or slower for experts, but they do not constitute a
change in paradigm.

	
#Declarative Spreadsheet apps	
Spreadsheets (excluding macros and scripts)  follow declarative/functional/reactive paradigms, and it can be argued that
more of these programs have ever been written than in any other language. The problem is that spreadsheets have limited
functionality compared to general purpose languages. 

#imperative Web and mobile apps
Web and mobile apps	are mostly written in General purpose imperative languages, but have evolved, and now tend to include support 
for many paradigms (multi-paradigm) such as declarative aspects like the use of Moustache and other templates.

Web and mobile applications are built using multi-paradigm languages, and as a result they are flexible enough to provide 
for almost unlimited creativity in producing newer and and more competitive products, 
however the cutting edge is also the bleeding edge, and this flexibility comes at the cost of very high incidental complexity.

#Incidental complexity
Illustration of incidental complexity: Say you have a Google spreadsheet, that you share with your team, you use it
so each team member can input their hours worked on a specific project. Your total complexity would be, open and share a sheet,
add a few lines of text, a bit of formatting and one formula "=sum(e2:e:999)". Done in 5 mins.
Compare this to building a mobile app to do the same basic function. The difference is incidental complexity, 
complexity that has nothing to do with the problem being solved. Consider the skill requirement difference it is even greater 
than the time to code.

Unnecessary incidental complexity tends to spiral out of control when an inappropriate paradigm or framework is selected to solve a problem.


#Solution
Quale introduces a brand new paradigm we are calling  "Directly bound", i.e. there is no need for intermediate variables 
between the data in the database, and the data being presented or processed, the query itself is the UI operation.


Thus Quale follows a declarative/reactive/Directly bound paradigm similar to spreadsheets, this results in greatly reduced incidental complexity,
as it removes the need to pull and push working variables to an from the database.


#how the Quale ecosystem fits in

Quale belongs in the group of declarative paradigms,
Quale is a turing complete declarative programming paradigm, 

Quicc is a language syntax like Javascript is a language syntax

SQL-MVC is the compiler and runtime environment like node.js is a compiler/interpreter and runtime.

SQL-MVC-* are modules like npm are  modules for node.




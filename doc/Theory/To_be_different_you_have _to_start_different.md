#Application Architecture Abstraction Paradigm (AAAP)
To be different, you have to start of being different

##Background
<https://www.youtube.com/watch?feature=player_detailpage&v=2egL4y_VpYg> at 7:30 is a graph showing C++'s origin being in Simula, a general purpose abstraction and C, a hardware abstraction. All modern  languages have borrowed from this general purpose abstraction(GPA) ancestry , leaving behind Domain Specific Abstractions(DSA) like Fortran and Cobol, branding them as legacy and deprecated.

This general purpose abstraction(GPA) mirrors the basic hardware architecture of being a processing unit attached to storage units (Von Neumann model). Subsequent scripted languages and higher abstractions, even parts of functional programming have followed this model.

About the same time as C++ the client server model started to appear, first only as file storage and later as record level storage in the form of server based DBMS. This still fitted the Von Neumann model. 

As the internet evolved and security became an issue the server's role changed from primarily a storage device to a processing device, but in order to make the servers be able to serve as many clients as possible, the modern trend of Single Page applications have developed , requiring a application to be split into a service part and a client part - it has been touted that service API is the future of the web. Still the programming of the two parts follow the Von Neumann model, whilst the architecture clearly does not fit any-more.


##To be different, you have to start of different
Imagine how different our programming architecture would be today, if all computer memory right from the first bits in the first stored program computer to every QB today was directly accessible and non volatile memory.

Without the need for external mass storage, the Von Neumann model would not exist. This is a artefact of our technical limits and not of our purpose. We program computers today using better "machine code assemblers" , our thinking is still locked in to the "machine" and how it works.

To quote John Backus "Not only is this (Von Neumann) tube a literal bottleneck for the data traffic of a problem, but, more importantly, it is an intellectual bottleneck that has kept us tied to word-at-a-time thinking instead of encouraging us to think in terms of the larger conceptual units of the task at hand."
 

Abolishing the Von Neumann model is the foundation of our re-think of the programming paradigm.

##Application Architecture Abstraction Paradigm (AAAP)
AAAP is a extension of a very old paradigm (Domain Specific Abstraction DSA).

Many rapid application development tools and libraries exist to help abstract away some or all of the hardware architecture such as ROR, Django, Web forms, Oracle APEX, Iron speed, CodeOnTime, and others, RAD tools go back as far as the 1980's . These platforms can be described as technology specific abstractions (TSA). Some have very nice GUI's to assist and make the abstractions as user friendly as possible. But technology specific abstractions can be easily identified by the some aspect of their technology stack such as the look and feel, networking model or database systems, and the application is locked into that specific technology and moving the application to new platforms or technologies, and modernising them is a hard rewrite. 

The key difference between TSA and AAAP is in the technology agnostic compiler, AAAP applications are agnostic to the underlying technologies, so can easily be updated to new technologies or moved to alternative technologies for example from web to native. Your application will not be locked into a underlying technology.

Think of AAAP more as a linker that links your application with the appropriate technology, rather than a platform and libraries such as traditional application development acceleration platforms.


##AAAP is a:

**Domain Specific Abstraction(DSA)** - For LOB,OLTP type Applications (or parts there of). 

**Architecture abstraction** - Build on top of a general purpose abstraction(GPA) layer

**Agnostic**	- It is technology agnostic in every possible manner. It does not care what GPA language is used, it does not care what database language is used, it does not care what the user interface is or where the code is going to run.

**language that is not a language** - it is a language extension mechanism or a markup language around your code, it is a way to write your code in the language of your choice, but without having to care about the architecture client/server or database/application.

**A declarative syntax to bind UI and DB with code**, binding code with DB either in ORM, 2 way binding, or by moving code into the DB (stored procedures).

**Efficient** - Efficiency measured in Total lines of code, or Incidental Complexity + Exponential Incidental Complexity. It is  efficient to develop with and efficient in utilising the latest technology to deliver the best possible performance and user experience.


So far our proof of concept is QualeQuest/SQL-MVC is working but it still needs a lot of work before it will meet all these goals.

**Please visit <https://github.com/quale-quest/sql-mvc> for some more detail on the platform.**

[About Lafras] (https://github.com/quale-quest/sql-mvc/blob/master/doc/Theory/About_Lafras.md) 
 
 

*Ref 1:* "Can Programming Be Liberated from the Von Neumann Style?".
<https://web.stanford.edu/class/cs242/readings/backus.pdf>

*Ref 2:* <http://arstechnica.com/information-technology/2015/06/the-web-is-getting-its-bytecode-webassembly/>
This kind of wide-ranging usage led Microsoft's Scott Hanselman to dub JavaScript the "assembly language for the Web," a sentiment largely shared by people such as Brendan Eich, who invented JavaScript, and Douglas Crockford, who invented JSON, widely used for JavaScript-based data interchange.


*Good reading:* <http://cstheory.stackexchange.com/questions/14860/what-is-a-practical-non-von-neumann-architecture>





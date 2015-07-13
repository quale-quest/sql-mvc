#How we can change the world

Our domain of interest in this paper is client/server/database applications (on-line or off-line),
more specifically web and mobile applications, and initially web applications.

##The problem

Programming is easy, all you need to know is (while,if,else), writing large programs is hard, you need to 
understand a lot of complex issues and methods.

As a program grows in complexity and in the number of users, a lot of issues
that have nothing to do with the service you are trying to deliver
start to have an impact on the complexity of the program, 
this is incidental complexity.
 
As your incidental complexity increases, complexity arises from those complexities,
this is exponential incidental complexity.
 
Incidental complexity is not a simple number but has many vectors like 

| Vector                          | High   | vs | Low    |
|---------------------------------|--------|----|--------|
| Language syntax                 | c++    | vs | python |
| Poor runtime performance        | python | vs | c++    |
| Accessible libraries            | c      | vs | java   |
| Poor concurrency control        | node   | vs | java   |
| Fast non blocking requirement   | java   | vs | node   |
| Simple web site enhancements    | node   | vs | PHP    |
| Real time web site enhancements | PHP    | vs | node   |

(this is a short subjective list for illustration only )	

As a result some language/ecosystems are known to be better choices for some problem domains.
 
 
A formula for the complexity of a system can be expressed
	Total Complexity = Program size ......
	

##Current solutions

It could be argued that all languages got started due to an attempt to reduce some complexity vector in another language.

Over the decades many new systems and languages have been created with the intent to reduce 
the Incidental complexity, it is wise to learn and use the best practices.


Code reuse - without libraries, modules and packages, we would still be in the dark-ages. 
Sub issues are Discovery, Usability and Maintenance. Node through NPM is a great example 
of a very efficient solution.

Language syntax - I prefer braces for code blocks, but have had very enjoyable times in python's indentation blocks,
however I disliked PHP's syntax intensely, however these are superficial differences which probably 
add very little incidental complexity. More substantial complexity are language features such as C macro's.




Python has a great meme: There should by one and only one obvious way of doing something, 
although a bit idealistic, this is a great principle well worth striving for.

Ruby has a great principle: DRY - do not repeat yourself. I don't think I need to repeat this , again (haha).

Architecture - PHP style vs MVC, The MVC type models have done a lot to free us from the spaghetti of PHP+HTML
however I think the views (even in angular) must be even further removed from the application.
But even the MVC method adds its own vector of incidental complexity.

.....

#Creating better solutions
The question then becomes how do we minimise all the incidental complexity vectors of a specific problem domains of interest.

Within this domain we have 
		* User Interface
		* Bussiness/Application logic
		* Database Interface
		
MVC splits the UI away from the Model and controller, this is especially useful in modern apps where the aesthetic of an applications is vital and the
programmer does not have all the skills of a UI designer, and the UI designer must not be able to break the rest of the program.

A really big contributor of incidental complexity is the notion that the "database" is separate from the application, thus the database records have to be loaded into memory, operated on and posted back. Paradigms like ORM is an attempt to make the database appear as part of the application code. the benefit of this is much reduced incidental complexity but at the expense of performance. The alternative is to move the application code into the database, which is unusual but not totally unheard of as often parts of an application is moved to the database normally for performance or security reasons, what makes QualeQuest/SQL-MVC so unique is it approaches the database as the default location for all the code except for when functionally this is not possible. 

The out come is a system with decreased complexity and improved performance.

	
“Something that looks great but is difficult to use is exemplary of great UI and poor UX. 
While Something very usable that looks terrible is exemplary of great UX and poor UI.”	
	
	
	Refs:
	http://www.onextrapixel.com/2014/04/24/the-gap-between-ui-and-ux-design-know-the-difference/
	http://xlntconsulting.blogspot.ca/2014/11/why-is-programming-so-hard.html
	
#Incidental complexity 

Our domain of interest in this paper is client/server/database applications (on-line or off-line), more specifically web and mobile applications, and initially web applications.

##The problem

Programming is easy, you only need to understand a few concepts (while,if,else), writing large programs is hard, you need to understand a lot of complex issues and methods.

As a program grows in complexity and in the number of users, a lot of issues that have nothing to do with the service you are trying to deliver start to have an impact on the complexity of the program, this is incidental complexity (IC).
 
As your incidental complexity increases, complexity arises from those complexities, this is exponential incidental complexity (EIC). *To Illustrate, in [build-worlds-hottest-startups] (http://thenextweb.com/dd/2013/12/02/much-cost-build-worlds-hottest-startups/) it states to write a Facebook start-up would cost $500k, however according to [Facebook-Software-Engineer-Salaries] (http://www.glassdoor.com/Salary/Facebook-Software-Engineer-Salaries-E40772_D_KO9,26.htm) Facebook has spent more than $140M ( 300 times the start-up estimate) on development in only the last 2 years, this discrepancy is partly due to the exponential incidental complexity.*
 
Incidental complexity is not a simple number but has many vectors, for example:


| Vector                          | IC High | vs | IC Low | Significance  |
|---------------------------------|---------|----|--------|---------------|
| Language syntax                 | c++     | vs | python |	low			  |
| Poor runtime performance        | python  | vs | c++    | low			  |
| Poor concurrency control        | node    | vs | java   | low			  |
| Fast non blocking requirement   | java    | vs | node   | low			  |
| Simple web site enhancements    | node    | vs | PHP    | low			  |
| Real time web site enhancements | PHP     | vs | node   | low			  |
| Accessible libraries            | c       | vs | java   | medium		  |
| Debug complexity                | CLI     | vs | IDE    | medium		  |
| Legacy complexity               | IE<8    | vs | Chrome | medium		  |
| Diversity complexity            | Native  | vs | Web    | high		  |
| Network performance complexity  | 2G      | vs | 3G/LTE | high		  |
| Endpoint trust complexity       | Internet| vs | LAN    | very high	  |

(this is a short and subjective list for illustration only )	

As a result some language/ecosystems are known to be better choices for some problem domains, and It could be argued that all languages / platforms got started due to an attempt to reduce some unacceptably high complexity vector in another language. 
 

#A few Incidental complexity vectors in detail
	
##Endpoint trust Incidental complexity 

In a secure network you can write a simpler single client side application that can directly access the database, and be restricted only by database user credentials, in this environment you can trust (sort of) the client code not to be malicious. In an Internet application, you cannot trust the client environment, as a hacker can manipulate the code to either steal information (read only) or they can update information with dire consistences, thus the trust must be moved to the server, this has lead to coding the application is two distinct arias, namely server side and client side, often using vastly different technologies even embedding the generation of the client side code into the server application (like in PHP). Libraries and code reuse can help to simplify this but this is possibly the largest incidental complexity vector by far.

##Network performance Incidental complexity

If you focus only on web applications or you use a abstraction like Cardova for minimising Diversity Incidental complexity, then the second most significant, is Network performance Incidental complexity, a developer is easily lulled into a false sense of accomplishment when testing a app in a high performance network, but if you expect your app to become vastly popular, then coping with network issues is going to add significant complexity to your app. Caching, parallel requests, demand for good battery life, all make for complex workarounds to a basic problem.

##Diversity Incidental complexity

Browser diversity, is much improved but native mobile device diversity is ever increasing not only in models of a platform, but in the platforms themselves. [Wiki](https://en.wikipedia.org/wiki/Mobile_operating_system) lists nearly twenty platforms. 

##Legacy Incidental complexity

Browser diversity used to be of very high significance, but over the last few years this has become less significant (in part due to JQuery and HTML5), however other arias such as older devices or devices with low end specifications still contribute to this complexity. [Link] (https://www.youtube.com/watch?feature=player_embedded&v=X6YbAKiLCLU)

	
##Debugging and maintenance Incidental complexity
in [react-native] (https://facebook.github.io/react-native/docs/videos.html#content)  at 14:26, Tom Occhino states
"When we create our application using declarative code and when we structure our views declaratively, your code is significantly more predictable" and at 16:50 he leads into "I propose that declarative code is a lot easier to maintain and extend"

##Others
Language syntax - I prefer braces for code blocks, but have had very enjoyable times in python's indentation blocks,
however I disliked PHP's syntax intensely, however these are superficial differences which probably 
add very little incidental complexity. 



#Best practises going forward

Best practises has the benefit of reducing Incidental complexity, avoiding technical debt or at least measuring it.

Some legacy best practises may not be Best practises going forward, we need to identify what are fundamentals and what are side effects of legacy environments.

##Fundamental best practises

**Code reuse** - without libraries, modules, packages and components within applications, we would still be in the dark-ages. 
Sub issues are Discovery, Usability and Maintenance. Node through NPM is a great example of a very efficient solution. 

**one obvious way** - Python has a great meme: There should by one and only one obvious way of doing something, 
although a bit idealistic, this is a great principle well worth striving for.

**DRY** - Ruby has a principle: DRY - do not repeat yourself. I don't think I need to repeat the benefits of this.

**Declarative vs Imperative** - Only use imperative paradigm where a declarative paradigm is not possible.

**Separation of concerns** - There are many arguments at which point / angle concerns should be separated, I believe primary separation should be based on human talent, i.e. separate programmers from designers and analysts (as the 3 talents are seldom found in one individual). The second separation should be on application code vs system code, application code is best written by programmers that have a thorough understanding of the business use case, whereas system programming very seldom is dependent on the use case and is very infrastructure driven. Thus by its very nature, there are three primary natural separations. I think this separation should be so severe that it must not be possible to mix the Application code, the design art and the system code at all.


##Anti-establishment 

The above description is pretty straight forward, fairly self-evident and not really controversial, but it does start to create the mindset we need to look at the problem from a incidental complexity point of view. 

*Go against convention.* "Conventional wisdom is bad. It is what the majority of the world follows and the majority of the world is in the big part of the bell shaped curve. Do things differently and you will end up with a very different result." [reference] (https://www.quora.com/What-are-the-top-10-things-that-we-should-be-informed-about-in-life)

In a [keynote address at Curry ON Prague] (<https://www.youtube.com/watch?feature=player_detailpage&v=2egL4y_VpYg#t=399>, Bjarne Stousstrup describes the early days of C++ and how he had faced ridicule because of anti-establishment thinking, this is inevitable, if you do not get ridiculed you are not radical enough.

##Anti-Patterns of Fundamental best practises

**test driven development** - over emphasis on testing is a artefact of a fragile unpredictable environment. You should be able to code with confidence that your app wont break because of some strange side effect.

**choose what is popular** - 
The software industry, contrary to what you might expect, is absolutely filled with people who hate progress, most of the software industry makes its decisions like a high school teenager: they obsessively check for what’s cool in their clique. [reference](http://blog.circleci.com/it-really-is-the-future/) 

#Creating better solutions

The question then becomes how do we minimise the significant incidental complexity vectors for our specific problem domain of interest.

##Step 1 - eliminate the client/server programming model 

Factors such as the historical and current diversity of client server architectures, Endpoint trust IC and Network performance IC have shaped the current programming paradigms, and fixed in our minds the client/server programming model. This model is far removed from objectives of the application we are trying to create, thus it results in huge amounts of incidental complexity as we try and fit the two together. 

We need an application programming model, that is architecture agnostic i.e. focuses on the application problem domain not on the implementation problem domain, but can easily be compiled into constituent parts for making the application work on both the client and server side.


##Step 2 - eliminate the database/code programming model

Once we realise that an architecture agnostic application programming model is possible and can compile into server and client side code, we can easily extend this concept to the next conceptual level up, and remove the database/code programming model.

The biggest contributor of incidental complexity by far is the notion that the "database" is separate from the application, thus the database records have to be loaded into memory, operated on and posted back. Paradigms like ORM is an attempt to make the database appear as part of the application code. the benefit of this is much reduced incidental complexity but at the expense of performance. The alternative is to move the application code into the database, which is unusual but not totally unheard of as often parts of an application is moved to the database as stored procedures, normally for performance or security reasons, but it is also possible to make this the primary code environment.


##Step 3 - enforce separation of application code from design art and systems level code.

Separate concerns to the extent that the code should not directly generate HTML or Native Objects but all rendering should all go through a "design art" engine.

Custom handling of input boxes etc. should not be possible in the application programming model, but must be moved to a systems level programming model.

"Write once run everywhere" is an unattainable ideal, but if we abstract the application programming model to a sufficiently high level we can force the removal of platform code out of the application level and place it into an design art level or systems level, thereby making it easier to port, and reuse consistently in various views.

Systems level code would be written in general purpose native or scripted languages, and would typically form a "Platform", if the  application programming model is sufficiently abstracted, it will not matter to the application how Incidental complexity vectors like Legacy, Diversity, Network performance and Endpoint trust are resolved by the underlying platform, and such issues would be able to be improved upon by system level developers without affecting the application code at all.


##Step 4 - enable declarative programming as far as possible.
At a sufficiently abstracted application programming level, it becomes more about what to do and not how to do it, and a declarative programming model, becomes a natural fit for "designing" applications rather than programming them. Provided the application programmer does not need to have custom systems level or design art built, development will be very efficient.

##Step 5 - Build proof of concept

All above is a pointless discussion if it cannot be put into practise, The outcome is a system with decreased complexity and improved performance, QualeQuest/SQL-MVC is the first platform built with this concept.


Please visit <https://github.com/quale-quest/sql-mvc> for some more detail on the platform.


[About Lafras] (https://github.com/quale-quest/sql-mvc/blob/master/doc/Theory/About_Lafras.md)
	

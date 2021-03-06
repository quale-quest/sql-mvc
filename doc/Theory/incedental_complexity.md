
!!!! read this on the ext review: http://coding-geek.com/how-databases-work/

https://github.com/kbilsted/CodeQualityAndReadability/blob/master/Articles/Readability/TheChangingNotionOfReadability.md
-with facbook likes buttons
http://tacticstudios.blogspot.ca/2015/07/effective-coding-dont-repeat-yourself.html

#Introduction

This paper is not ready for publication yet! If you do find it, please don't post it to Reddit or others.

In January 2015 published some pretty cool stuff, but nobody seems to notice it between all the "noise" of new technologies, So I started to try and document the theory behind it, I actually had to discover what I invented and find a way to express it in a theoretical manner that would illustrate the benefits, this has been great and has lead to more abstract thinking and further evolution of the concepts - truly a Quest.

This paper is the second in a series  [Escaping the Von Neumann programming paradigm] (https://github.com/quale-quest/sql-mvc/blob/master/doc/Theory/Escaping_the_Von_Neumann_programming_paradigm.md/ ), but independent of the first, and attacks the problem with a different approach.

#Incidental complexity 


Our domain of interest in this paper is client/server/database applications, more specifically web and mobile applications, and initially web applications.

##The problem

Programming is easy, you only need to understand a few concepts (while,if,else), writing large programs is hard, you need to understand a lot of complex issues and methods. [ an example of a lost newbie] (https://www.reddit.com/r/webdev/comments/3ejynq/can_somebody_explain_to_me_how_a_few_things_tie/)

Apart from the initial complexity, as a program grows in complexity and in the number of users, a lot of issues that have nothing to do with the service you are trying to deliver start to have an impact on the complexity of the program, this is incidental complexity (IC).
 
As your incidental complexity increases, complexity arises from those complexities, this is exponential incidental complexity (EIC). *To Illustrate, in [build-worlds-hottest-startups] (http://thenextweb.com/dd/2013/12/02/much-cost-build-worlds-hottest-startups/) it states to write a Facebook start-up would cost $500k, however according to [Facebook-Software-Engineer-Salaries] (http://www.glassdoor.com/Salary/Facebook-Software-Engineer-Salaries-E40772_D_KO9,26.htm) Facebook has spent more than $140M ( 300 times the start-up estimate) on engineering in only the last 2 years, this discrepancy is partly due to the exponential incidental complexity.*
More details on why: http://www.quora.com/Why-do-companies-like-Facebook-and-Uber-need-so-many-developers 
 
 
Total Incidental complexity could be expressed as 

	TIC = F1^(F2^IC + F3^UC)
	Where
		IC is Incidental Complexity.
		UC is User Count factor.
		F are factors specific to a particular solution.
 
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
| Performance complexity          | 1 core  | vs | 4 core | medium		  |
| Diversity complexity            | Native  | vs | Web    | high		  |
| Network performance complexity  | 2G      | vs | 3G/LTE | high		  |
| Endpoint trust complexity       | Internet| vs | LAN    | very high	  |

(this is a short and subjective list for illustration only )	

This can be called Complex Incidental Complexity (CIC)

As a result some language/ecosystems are known to be better choices for some problem domains, and It could be argued that all languages / platforms got started due to an attempt to reduce some unacceptably high complexity vector in another language. 
 

#A few Incidental complexity vectors in detail
	
##Endpoint trust Incidental complexity 

In a secure network you can write a simpler single client side application that can directly access the database, and be restricted only by database user credentials, in this environment you can trust (sort of) the client code not to be malicious. In an Internet application, you cannot trust the client environment, as a hacker can manipulate the code to either steal information (read only) or they can update information with dire consistences, thus the trust must be moved to the server, this has lead to coding the application is two distinct arias, namely server side and client side, often using vastly different technologies even embedding the generation of the client side code into the server application (like in PHP). Libraries and code reuse can help to simplify this but this is possibly the largest incidental complexity vector by far.

##Network performance Incidental complexity

The second most significant, is Network performance Incidental complexity, a developer is easily lulled into a false sense of accomplishment when testing an app in a high performance network, but if you expect your app to become vastly popular, then coping with network issues is going to add significant complexity to your app. Caching, parallel requests, demand for good battery life, all make for complex workarounds to a basic problem.

##Diversity Incidental complexity

Browser diversity / compatibility, has improved over the last few years, and popular frameworks do well to adapt to with screen side variations.

Native mobile device diversity is ever increasing not only in models of a platform, but in the platforms themselves. [Wiki](https://en.wikipedia.org/wiki/Mobile_operating_system) lists nearly twenty platforms. 

You can use an abstraction like Cardova for minimising Diversity Incidental complexity, at the cost of performance. The eagerly awaited React Native promises also another method to reduce the Diversity Incidental complexity.


##Performance Incidental complexity

[Low end, low cost, devices are very popular in parts of the world ](https://www.youtube.com/watch?feature=player_detailpage&v=5yFVYHXNBqM#t=92) , and if you don't consider the performance impact of your app you are going to limit your market, and give a competitor the opportunity to gain a foothold in your market. 

	
##Debugging and maintenance Incidental complexity

In [react-native] (https://www.youtube.com/watch?feature=player_embedded&v=KVZ-P-ZI6W4#t=868) , Tom Occhino states
"When we create our application using declarative code and when we structure our views declaratively, your code is significantly more predictable" and he goes on to state "I propose that declarative code is a lot easier to maintain and extend". 

##Others

Language syntax - I prefer braces for code blocks, but have had very enjoyable times in python's indentation blocks,
however I disliked PHP's syntax intensely. These are superficial differences which probably 
add very little incidental complexity.

----------------------------------------------

#Best practises going forward

Best practises has the benefit of reducing Incidental complexity, avoiding technical debt or at least measuring it.

Some legacy best practises may not be Best practises going forward, we need to identify what are fundamentals and what are side effects of legacy environments.

##Fundamental best practises

**Code reuse** - without libraries, modules, packages and components within applications, we would still be in the dark-ages. 
Sub issues are Discovery, Usability and Maintenance. Node through NPM is a great example of a very efficient solution. 

**one obvious way** - Python has a great meme: There should by one and only one obvious way of doing something, 
although a bit idealistic, this is a great principle well worth striving for.

**DRY** - Ruby has a principle: DRY - do not repeat yourself. I don't think I need to repeat the benefits of this. However it does have multiple meanings, [within code repetition is eliminated by using functions and other techniques ]  http://tacticstudios.blogspot.ca/2015/07/effective-coding-dont-repeat-yourself.html , but also often we have to copy over data attributes structures multiple times....XXX  Find more examples XXXX

**Declarative vs Imperative** - Only use imperative paradigm where a declarative paradigm is not possible.

**Separation of concerns** - There are many arguments at which point / angle concerns should be separated, I believe for the most practical benefit the separation should be based on human talent, i.e. separate programmers from designers and analysts (as the 3 talents are seldom found in one individual). The primary separation being Programmers from designers, The second separation should be on application code vs system code, application code is best written by programmers that have a thorough understanding of the business use case, whereas system programming very seldom is dependent on the use case and is very infrastructure driven. Thus by its very nature, there are three primary natural separations. I think this separation should be so severe that it must not be possible to mix the Application code, the design art and the system code at all.

**early optimization** - vs *premature optimization* - For most projects, there is a good chance you won't ever need to consider optimization, but if your app is busy going viral you will loose your window of opportunity as there will be no time to optimise. The best practise is early/design optimization, you need to choose the right base technology to scale, you need to design the architecture to scale, most importantly the language and architecture should make it easy to continuously write reasonably optimal code. Leaving optimisations until you need them is an anti-pattern.

**Quality is speed** - To put it simply, to write code fast, you need to have quality code. If you don't have quality code, you cannot be fast. 
In other words, if you cut corners to reach the first milestone as fast as possible, each successive milestone will become slower and slower, as the weight of the technical debt pulls you back! http://qph.is.quoracdn.net/main-qimg-5f29964e3a61ba96b6ddb27d2283cec5?convert_to_webp=true [Source] (http://engineering.quora.com/Moving-Fast-With-High-Code-Quality?share=1)

**choose the right tool** - Don't think of your applications one monolithic work, with everything written in the same language. I pledge allegiance to the irrefutable truth that there is [no best language for everything and everybody] (https://www.youtube.com/watch?feature=player_detailpage&v=2egL4y_VpYg#t=122) **and every part**. Bad architecture choice is rated as the largest contributor to technical debt. http://blog.sei.cmu.edu/assets/content/chart3_ranking_sources_technicaldebt.png [Source] (http://blog.sei.cmu.edu/post.cfm/field-study-technical-debt-208)

##Anti-establishment 

The above description is pretty straight forward, fairly self-evident and not really controversial, but it does start to create the mindset we need to look at the problem from a incidental complexity point of view. 

**Go against convention.** ["Conventional wisdom is bad. It is what the majority of the world follows and the majority of the world is in the big part of the bell shaped curve. Do things differently and you will end up with a very different result."] (https://www.quora.com/What-are-the-top-10-things-that-we-should-be-informed-about-in-life)

In a [keynote address at Curry ON Prague] (<https://www.youtube.com/watch?feature=player_detailpage&v=2egL4y_VpYg#t=399>, Bjarne Stousstrup describes the early days of C++ and how he had faced ridicule because of anti-establishment thinking. This is inevitable, if you do not get ridiculed you are not radical enough.

##Anti-Patterns of Fundamental best practises

**Loosing control** - You can't loose control, if you loose control to a "black box", that you cannot change or swap-out then you face the worst level of Incidental complexity - complete rewrite.

**choose what is popular** - 
[The software industry, contrary to what you might expect, is absolutely filled with people who hate progress, most of the software industry makes its decisions like a high school teenager: they obsessively check for what’s cool in their clique.](http://blog.circleci.com/it-really-is-the-future/) 

**test driven development** - **over emphasis** on testing is a artefact of a fragile unpredictable environment. You should be able to code with confidence that your app wont break because of some strange side effect.
https://www.youtube.com/watch?feature=player_detailpage&v=X6YbAKiLCLU#t=127


**GUI Tools** - tools are nice, they help when you are lost and don't know what to do or you just don't know where to start. However they have considerable drawbacks 1) Lack of, or weak support for source control, 2) Slower development - an experienced textual coder will out code any click-clicker by a mile. 3) Lack of flexibility - when using a GUI you can only use the features in the manner the publisher envisioned you would, you are TRAPPED by their insight. 4) Loosing control (see above), a GUI tool can be the worst possible anti-pattern.
Note: Some cite poorly generated or large chunks of boiler plate code as the worst aspect, but to me that is not so significant, after all, if you don't need to look at the code then who cares how big or how bad it is.


-----------------------

#Creating better solutions

The question then becomes how do we minimise the significant incidental complexity vectors for our specific problem domain of interest.

We need an application programming model, that is architecture agnostic i.e. focuses on the application problem domain not on the implementation problem domain, but can easily be compiled into constituent parts for making the application work on both the client and server side (or even multi tier).


##Step 1 - eliminate the client/server programming model 

Factors such as the historical and current diversity of client server architectures, Endpoint trust IC and Network performance IC have shaped the current programming paradigms, and fixed in our minds the client/server programming model. This model is far removed from objectives of the application we are trying to create, thus it results in huge amounts of incidental complexity as we try and fit the two together. 


##Step 2 - eliminate the database/code programming model

Once we realise that an architecture agnostic application programming model is possible and can compile into server and client side code, we can easily extend this concept to the next conceptual level up, and remove the database/code programming model.

The biggest contributor of incidental complexity by far is the notion that the "database" is separate from the application, thus the database records have to be loaded into memory, operated on and posted back. Paradigms like ORM is an attempt to make the database appear as part of the application code. the benefit of this is much reduced incidental complexity but at the expense of performance. The alternative is to move the application code into the database, which is unusual but not totally unheard of as often parts of an application is moved to the database as stored procedures, normally for performance or security reasons, but it is also possible to make this the primary code environment.


##Step 3 - enforce separation of application code from design art and systems level code.

Separate concerns to the extent that the code should not directly generate HTML or Native Objects but all rendering should all go through a "design art" engine.

Custom handling of input boxes etc. should not be possible in the application programming model, but must be moved to a systems level programming model.

"Write once run everywhere" is an unattainable ideal, but if we abstract the application programming model to a sufficiently high level we can force the removal of platform code out of the application level and place it into an design art level or systems level, thereby making it easier to port, and reuse consistently in various views.

Systems level code would be written in general purpose native or scripted languages, and would typically form a "Platform". If the  application programming model is sufficiently abstracted, it will not matter to the application how Incidental complexity vectors like Legacy, Diversity, Network performance and Endpoint trust are resolved by the underlying platform, and such issues would be able to be improved upon by system level developers without affecting the application code at all.


##Step 4 - enable declarative programming as far as possible.
At a sufficiently abstracted application programming level, it becomes more about what to do and not how to do it, and a declarative programming model, becomes a natural fit for "designing" applications rather than programming them. Provided the application programmer does not need to have custom systems level or design art built, development will be very efficient.

##Step 5 - Build proof of concept

All above is a pointless discussion if it cannot be put into practise, The outcome is a system with decreased complexity and improved performance, QualeQuest/SQL-MVC is the first platform built with this concept in mind.



This paper is the second in a series, to get us out of the TRAP, the next paper will tackle the problem from another angle, and by the end of the series, hopefully, at last we will be free of the TRAP.

If you would like to receive the next papers, send an email to redditsubscribe@qualequest.com in order to subscribe to the QualeQuest newsletter (Don't worry I don't spam).

My research project is [QualeQuest] (http://qualequest.com/) it is *"the search for the essential property"*,  and [QualeQuest/SQL-MVC] (https://github.com/quale-quest/sql-mvc), is the first working iteration with a [demo web application] (http://todomvc.sql-mvc.com/).

[About Lafras] (https://github.com/quale-quest/sql-mvc/blob/master/doc/Theory/About_Lafras.md)

Finally I am saying that there is a certain type of thinking, "new programming paradigm" , that exists but is almost completely unknown, and not being explored, and to dismiss it without thorough exploration is unwise.
	
Extra reading http://blog.sei.cmu.edu/post.cfm/field-study-technical-debt-208	
	

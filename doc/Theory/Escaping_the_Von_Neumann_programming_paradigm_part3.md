
This is part 3 of [Escaping the Von Neumann programming paradigm] (https://www.reddit.com/r/programming/comments/3e7avo/Escaping_the_Von_Neumann_programming_paradigm.md/),

#Putting it into practice - The Proof of concept (POC)

I have built a POC, a fully functional web app platform(alpha version).

It is possible to build the POC in any language, however I have combined the new programming paradigm with a few other concepts. Hence my odd choice of language.

SQL is a declarative language, and Procedural SQL adds an imperative paradigm, however it is mostly not seen as a programming language, rather just a way to store and query our data.

On contemplation a SQL database is a very close approximation of the "new architecture", and once we get the abstraction of the input, output and events correct, SQL becomes a excellent candidate to test the hypothesis of the "new programming paradigm" 

This example will use pseudo SQL(could be any language) with mark-up in  comments to produce a fully functional web app that counts your visits, allows you to enter your name and country, and click a counter on a button.

**Enough talk, lets code!**

	--:{OnEvent{route: "/Visitors"}}		
		select 				 				--:{as:Form,AutoInsert}
			id,		 						--:{primary_key,Hidden}
			name,							--:{Edit}
			country, 						--:{Edit}
			visit_count,					--:{View}
			click_count						--:{View}
			from visits[id=context.id];
		visits[id=context.id].visit_count++;

		button (title:"Increment")
			visits[id=context.id].click_count++;
		
Done 

WTF?/ROFL?, What happened here?

I pledge allegiance to the irrefutable truth that there is [no best language for every thing and everybody] (https://www.youtube.com/watch?feature=player_detailpage&v=2egL4y_VpYg#t=122) **and every part**.

Stop trying to build low level DISK/IO from a declarative/functional or imperative, high level application!

Stop moving DISK values in and out of temporary variables to manipulate them.

Stop seeing the problem through the "Von Neumann intellectual bottleneck".

The the host is responsible for:
)the IO, as directed by the declarative syntax in the comments --:{}
)the context in the form of a identifier context.id 
)the NVRAM model  - the  "visits[id=context.id]" is syntactic sugar for "from visits where id=context.id"

Most (full stack) developers, will immediately say, we know browser issues, we know network issues, we know scaling issues, we know what it takes to tweak the HTML/CSS/JS just right to get the UI effect we want....this wont work, it may work for a small project, but it won't scale, it is a toy. Programmers are pragmatic, we want to know how. When we are aware of the technical issues around the problem, it becomes hard or impossible to trust a HOST, we get trapped in the "Von Neumann intellectual bottleneck" out of necessity. 

This paper is the first in a series, to get us out of the TRAP, the next paper will tackle the problem from a whole new angle, and by the end of the series, hopefully, at last we will be free of the TRAP.

If you would like to receive the next papers, subscribe to the QualeQuest newsletter, send a email to redditsubscribe@qualequest.com , (I don't spam).


QualeQuest (the search for the essential property)is my research project, 
QualeQuest/SQL-MVC, is the first working iteration.

Please visit my home page <http://qualequest.com/> or the Github repository <https://github.com/quale-quest/sql-mvc> for some more detail on the platform, Or <http://todomvc.sql-mvc.com/> for a demo web application written using this "new programming paradigm".

[About Lafras] (https://github.com/quale-quest/sql-mvc/blob/master/doc/Theory/About_Lafras.md)

Finally I am saying that there is a certain type of thinking, "new programming paradigm" , that exists but is almost completely unknown, and not being explored, and to dismiss it without thorough exploration is unwise.



[1]: https://web.stanford.edu/class/cs242/readings/backus.pdf "Can Programming Be Liberated from the Von Neumann Style?"
[2]: http://ieeexplore.ieee.org/xpl/articleDetails.jsp?reload=true&arnumber=4063250
[3]: https://en.wikipedia.org/wiki/Content-addressable_memory
[4]: http://thoughts.davisjeff.com/2011/09/25/sql-the-successful-cousin-of-haskell/
[5]: https://en.wikibooks.org/wiki/Haskell/Simple_input_and_output
[6]: https://en.wikipedia.org/wiki/Von_Neumann_programming_languages
[7]: https://en.wikipedia.org/wiki/Von_Neumann_architecture


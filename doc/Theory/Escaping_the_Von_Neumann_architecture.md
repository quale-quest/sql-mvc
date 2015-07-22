#Introduction

In January 2015, I published a pretty cool open source project, but nobody seems to notice it between all the "noise" of new technologies. So I started to document the theory behind it. I actually had to discover what I invented and find a way to express it in a theoretical manner that would illustrate the benefits, this has been great and has lead to more abstract thinking and further evolution of the concepts - truly a Quest.

#Escaping the Von Neumann architecture (in web and app programming)

Firstly the definition of the Von Neumann architecture: "A design architecture for an electronic digital computer with parts consisting of a processing unit(1) containing an arithmetic logic unit and processor registers, a control unit containing an instruction register and program counter, a memory(2) to store both data and instructions, external mass storage(3), and input and output mechanisms(4)." [7]

Late 1930's researchers were searching for a means to implement a "Universal Turing machine", then in 1945, Von Neumann described a practical means by which this could be implemented using the very limited technology of that time,  the first successful run of a stored-program was made in 1948.  

The architecture of these 4 parts (CPU,RAM,DISK and IO) was simple enough to be practical in 1948 and robust enough to evolve into the foundation for today's mass computing phenomena.

"*A von Neumann language is any of those programming languages that are high-level abstract isomorphic copies of von Neumann architectures. As of 2009, most current programming languages fit into this description, likely as a consequence of the extensive domination of the von Neumann computer architecture during the past 50 years.*

*The differences between Fortran, C, and even Java, although considerable, are ultimately constrained by all three being based on the programming style of the von Neumann computer*" [6].

Consequently a A "von Neumann program" would be a program written in a von Neumann language using the von Neumann paradigm.

John Backus stated the Von Neumann architecture creates an intellectual bottleneck [1], this can be dubbed the "Von Neumann intellectual bottleneck"

##Variations in the Von Neumann architectures (that broadly comply to the above definitions) are :
**Harvard** or **adding caching and symmetrical multiprocessors**  - with varying implementation detail of program storage and number processing units.

**single instruction, multiple data (SIMD)**  optimisations with additional ALUs to perform concurrent identical computations.

**Dataflow architecture** : (also see below ), is a optimisation, combining some principles of Dataflow architecture to allow parallel or out of order execution of independent instructions.

**Massively Parallel Processors** -  Beowulf clusters, Hadoop, and chip scale types like [parallella] (https://www.parallella.org/), where each processor is still just a Von Neumann machine, running a von Neumann program.


##Alternatives  of the Von Neumann architecture :

**Functional programming** : John Backus introduces Functional programming as a non Von Neumann architecture [1].

**Dataflow architecture** :  (also see above) [" Dataflow architectures do not have a program counter, or (at least conceptually) the executability and execution of instructions is solely determined based on the availability of input arguments to the instructions, so that the order of instruction execution is unpredictable; no commercially successful general-purpose computer hardware has used a dataflow architecture"] (https://en.wikipedia.org/wiki/Dataflow_architecture),  although event driven(data arriving) programming is a common programming paradigm.

**Cellular automaton** :  no commercially successful general-purpose computer hardware has used a Cellular automaton architecture, however programmable gate arrays (FPGA) and VHDL has been used to implement application specific solutions [2]. 



#Trapped

All of mankind has been trapped in the "Von Neumann intellectual bottleneck", even those that can see there is a better solution fall back into it's trap.

I contend that even modern functional languages regress to the Von Neumann architecture in the form of IO monads because of the "Von Neumann intellectual bottleneck". This answer to a SO question exemplifies the "Von Neumann intellectual bottleneck":
[" The problem is that Haskell IO is based on monads, and IO is probably one of the first things you want to understand when learning a new language - after all, its not much fun to create programs which don't produce any output."] (http://stackoverflow.com/questions/44965/what-is-a-monad), [More on why and how to aviod monad thinking ] (https://noordering.wordpress.com/2009/03/31/how-you-shouldnt-use-monad/)

A further insistence on IO monads is perpetuated by by a desire to be the [best language for every thing and everybody] (https://www.youtube.com/watch?feature=player_detailpage&v=2egL4y_VpYg#t=122) **and every part**.


##Eliminating the artifacts of our technical limits from the architecture

Imagine how different our programming architecture would be today, if all computer memory right from the first bits in the first stored program computer to every QB today was directly accessible and non-volatile memory, imagine some or all of that memory being [content (or context) addressable memory] (https://en.wikipedia.org/wiki/Content-addressable_memory). Imagine if we could reach into that memory and observe and change it and trigger execution directly.

These technologies all exist today and can be used to create a new architecture.

The "new architecture" definition would be:
A design architecture for an electronic digital computer with parts consisting of a processing unit(1) or units containing an arithmetic logic unit or units, an event unit(2) that can start the execution of instructions within a context of an event (similar concept to an interrupt), a non-volatile memory(3) to store both data and instructions that is directly accessible by address or context and where the memory is associated with an external host or hosts providing mechanisms for input and output and event triggers.

Thus the architecture consists of 4 parts (CPU, EVENT-CONTEXT, NV-RAM, HOST) 

What is critical, is the notion that the input, output and events (with context) is provided by a host (likely programmed in an imperative language) and that no attempt be made in the language to provide those natively, but we can within the source file have some directives that can be used to specify what needs to be provided by the host. 

Notice there is no reference to a program counter, this is an implementation detail we don't need to deal with, functional programs can be compiled into imperative code to run on hardware using a program counter or imperative programs can be created by chaining together several functional code events to run on hardware without program counters.

Comparing a simple Haskell example [5]

	--traditional Haskell with monad
	main = do
	  putStrLn "Please enter your name:"
	  name <- getLine
	  putStrLn ("Hello, " ++ name ++ ".")

	--vs pseudo Haskell with HTML as IO directives

	<input name="name" placeholder="Please enter your name">
	<span name="message"></span>
	message = "Hello, " ++ name ++ "."

	--vs pseudo Haskell with HTML as IO directives
	--  and the database is considered part of non-volatile context addressable memory.
	
	<span name="message"></span>
	message = "Hello, " ++ context.name ++ "."
	
As demonstrated by this very simple example, this new model is very well suited to functional languages, eliminating the need to serialise input and output.

I don't suggest that it would be practical to build such hardware. The reason to imagine such a hypothetical and impractical architecture is to eliminate the  "Von Neumann intellectual bottleneck".

SQL is a functional language (that could be considered [the successful cousin of Haskell] (http://thoughts.davisjeff.com/2011/09/25/sql-the-successful-cousin-of-haskell/) ), it is very widely used and easily understood with human like language syntax, in contrast to most functional languages with algebraic syntax. On comparison a SQL database is a very close approximation of the "new architecture". Once we get the abstraction of the input, output and events correct, SQL becomes a candidate to test the hypothesis of the "new architecture" in the real world, hence my platform QualeQuest/SQL-MVC, which uses SQL to deliver a fully operational declarative / functional application language.

Please visit my home page <http://qualequest.com/> or the Github repository <https://github.com/quale-quest/sql-mvc> for some more detail on the platform.

[About Lafras] (https://github.com/quale-quest/sql-mvc/blob/master/doc/Theory/About_Lafras.md)

[1]: https://web.stanford.edu/class/cs242/readings/backus.pdf "Can Programming Be Liberated from the Von Neumann Style?"
[2]: http://ieeexplore.ieee.org/xpl/articleDetails.jsp?reload=true&arnumber=4063250
[3]: https://en.wikipedia.org/wiki/Content-addressable_memory
[4]: http://thoughts.davisjeff.com/2011/09/25/sql-the-successful-cousin-of-haskell/
[5]: https://en.wikibooks.org/wiki/Haskell/Simple_input_and_output
[6]: https://en.wikipedia.org/wiki/Von_Neumann_programming_languages
[7]: https://en.wikipedia.org/wiki/Von_Neumann_architecture


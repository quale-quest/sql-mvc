#Introduction

In January 2015, I published a pretty cool open source project, but nobody seems to notice it between all the "noise" of new technologies. So I started to document the theory behind it. I actually had to discover what I invented and find a way to express it in a theoretical manner that would illustrate the benefits, this has been great and has lead to more abstract thinking and further evolution of the concepts - truly a Quest.

#Escaping the Von Neumann programming paradigm


Firstly the definition of the Von Neumann hardware architecture: "A design architecture for an electronic digital computer with parts consisting of a 1) processing unit containing an arithmetic logic unit and processor registers, a control unit containing an instruction register and [program counter] (https://en.wikipedia.org/wiki/Program_counter), 2) a memory to store both data and instructions, 3) external mass storage, and 4) input and output mechanisms." [7]

Late 1930's researchers were searching for a means to implement a "Universal Turing machine", then in 1945, Von Neumann described a practical means by which this could be implemented using the very limited technology of that time,  the first successful run of a stored-program was made in 1948.  

The architecture of these 4 parts (CPU,RAM,DISK and IO) was simple enough to be practical in 1948 and robust enough to evolve into the foundation for today's mass computing phenomena.

Wikipdia states : "*A von Neumann language is any of those programming languages that are high-level abstract isomorphic copies of von Neumann hardware architectures.*", further "*The differences between Fortran, C, and even Java, although considerable, are ultimately constrained by all three being based on the programming style of the von Neumann computer*[6]", I agree this is the common use case, but I say it is not necessarily true for the language itself but rather its environment, thus I **define the "von Neumann programming paradigm" as a the paradigm used when a program is written following a abstract isomorphic copy of von Neumann hardware architecture.**

John Backus stated the Von Neumann hardware architecture creates an intellectual bottleneck [1], this can be dubbed the "Von Neumann intellectual bottleneck"

##Variations in the Von Neumann hardware architectures (that broadly comply to the above definitions) are :
**Harvard** or **adding caching and symmetrical multiprocessors**  - with varying implementation detail of program storage and number processing units.

**single instruction, multiple data (SIMD)**  optimisations with additional ALUs to perform concurrent identical computations.

**Dataflow architecture** : (also see below ), is a optimisation, combining some principles of Dataflow architecture to allow parallel or out of order execution of independent instructions.

**Massively Parallel Processors** -  Beowulf clusters, Hadoop, and chip scale types like [parallella] (https://www.parallella.org/), where each processor is still just a Von Neumann machine, running a von Neumann program.


##Alternatives  of the Von Neumann hardware architecture :

**an unnamed non-Von Neumann hardware architectures better suited to functional programming** : *if anyone knows of a name used by early researches please comment on the reddit thread*. - John Backus introduces Functional programming as a non Von Neumann hardware architecture [1], however implementations of Functional programs still run on hardware based on Von Neumann hardware architecture, to my knowledge no commercially successful general-purpose computer hardware implements a hardware architecture based on Functional programming, although this could be possible.

**Dataflow architecture** :  (also see above) [" Dataflow architectures do not have a program counter, or (at least conceptually) the executability and execution of instructions is solely determined based on the availability of input arguments to the instructions, so that the order of instruction execution is unpredictable; no commercially successful general-purpose computer hardware has used a dataflow architecture"] (https://en.wikipedia.org/wiki/Dataflow_architecture),  although event driven(data arriving) programming is a common programming paradigm.

**Cellular automaton** :  no commercially successful general-purpose computer hardware has used a Cellular automaton architecture, however programmable gate arrays (FPGA) and VHDL has been used to implement application specific solutions [2]. 



#Trapped

All of mankind has been trapped in the "Von Neumann intellectual bottleneck", even those that can see there is a better solution fall back into it's trap.

I contend that even modern functional languages regress to the "von Neumann programming paradigm" in the form of IO monads because of the "Von Neumann intellectual bottleneck". This answer to a SO question exemplifies the "Von Neumann intellectual bottleneck":
[" The problem is that Haskell IO is based on monads, and IO is probably one of the first things you want to understand when learning a new language - after all, its not much fun to create programs which don't produce any output."] (http://stackoverflow.com/questions/44965/what-is-a-monad), [More on why and how to aviod monad thinking ] (https://noordering.wordpress.com/2009/03/31/how-you-shouldnt-use-monad/)

A further insistence on IO monads is perpetuated by by a desire to be the [best language for every thing and everybody] (https://www.youtube.com/watch?feature=player_detailpage&v=2egL4y_VpYg#t=122) **and every part**.


##Eliminating the artifacts of our technical limits from the architecture

Imagine how different our programming paradigms would be today, if all computer memory right from the first bits in the first stored program computer to every QB today was directly accessible and non-volatile memory, imagine some or all of that memory being [content (or context) addressable memory] (https://en.wikipedia.org/wiki/Content-addressable_memory). Imagine if we could reach into that memory and observe and change it and trigger execution directly.

These technologies all exist today and can be used to create a new architecture.

The "new architecture" definition would be:
A design architecture for an electronic digital computer with parts consisting of a 1)processing unit or units containing an arithmetic logic unit or units, 2) an event unit that can start the execution of instructions within a context of an event (similar concept to an interrupt), 3) a non-volatile memory to store both data and instructions that is directly accessible by address or context and where the memory is associated with an 4) external host or hosts providing mechanisms for input and output and event triggers.

Thus the architecture consists of 4 parts (CPU, EVENT-CONTEXT, NV-RAM, HOST) 

What is critical, is the notion that the input, output and events (with context) is provided by a host (likely programmed in an imperative language) and that no attempt be made in the language to provide those natively, but we can within the source file have some directives that can be used to specify what needs to be provided by the host. The host would be responsible for data types and conversions, and possibly basic input validation.

Notice there is no reference to a program counter, this is an implementation detail we don't need to deal with, functional programs can be compiled into imperative code to run on hardware using a program counter or imperative programs can be created by chaining together several functional code events to run on hardware without program counters.

Now from this "new architecture" we can derive a "new programming paradigm" that eliminates external mass storage, and input and output. This does not set the stage for a imperative vs functional paradigms stand off, but rather both need to surrender those aspects of their language or libraries that provide for storage or input and output, remove all file, display and network io.


Comparing a simple Haskell example [5] (could just as well be a c++ example.)

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
	
As demonstrated by this very simple example, this "new programming paradigm" is very well suited to functional languages, eliminating the need to serialise input and output, but it equally applies to imperative languages.

I don't suggest that it would be practical to build such hardware. The reason to imagine such a hypothetical and impractical architecture is to eliminate the  "Von Neumann intellectual bottleneck".

SQL is a declarative language, it is very widely used and easily understood with human like language syntax. On comparison a SQL database is a very close approximation of the "new architecture". Once we get the abstraction of the input, output and events correct, SQL becomes a candidate to test the hypothesis of the "new programming paradigm"  in the real world, hence my platform QualeQuest/SQL-MVC, which uses SQL to deliver a fully operational declarative application language.

Please visit my home page <http://qualequest.com/> or the Github repository <https://github.com/quale-quest/sql-mvc> for some more detail on the platform, Or <http://todomvc.sql-mvc.com/> for a demo web application written using this "new programming paradigm".

[About Lafras] (https://github.com/quale-quest/sql-mvc/blob/master/doc/Theory/About_Lafras.md)

[1]: https://web.stanford.edu/class/cs242/readings/backus.pdf "Can Programming Be Liberated from the Von Neumann Style?"
[2]: http://ieeexplore.ieee.org/xpl/articleDetails.jsp?reload=true&arnumber=4063250
[3]: https://en.wikipedia.org/wiki/Content-addressable_memory
[4]: http://thoughts.davisjeff.com/2011/09/25/sql-the-successful-cousin-of-haskell/
[5]: https://en.wikibooks.org/wiki/Haskell/Simple_input_and_output
[6]: https://en.wikipedia.org/wiki/Von_Neumann_programming_languages
[7]: https://en.wikipedia.org/wiki/Von_Neumann_architecture


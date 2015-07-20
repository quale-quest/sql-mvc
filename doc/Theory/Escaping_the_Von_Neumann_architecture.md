#Von Neumann architecture


Firstly a definition of the Von Neumann architecture: "A design architecture for an electronic digital computer with parts consisting of a processing unit containing an arithmetic logic unit and processor registers, a control unit containing an instruction register and program counter, a memory to store both data and instructions, external mass storage, and input and output mechanisms." [7]

##Variations on Von Neumann (that broadly comply to the above Definition) are :
**Harvard** or **adding caching and symmetrical multiprocessors**  - Similar to the Von Neumann architecture with varying implementation detail of program storage and number processing units.

**Dataflow architecture** : (also see below ), In modern computers The Von Neumann architecture is optimised by combining some principles of Dataflow architecture to allow parallel or out of order execution of independent instructions.


##Alternatives  on Von Neumann are :
**Dataflow architecture** : no commercially successful general-purpose computer hardware has used a dataflow architecture, although event driven programming is a common similar paradigm.

**Cellular automaton** :  no commercially successful general-purpose computer hardware has used a Cellular automaton architecture, however programmable gate arrays (FPGA) and VHDL has been used to implement application specific solutions [2]. 

**Functional programming** : John Backus introduces a non Von Neumann architecture [2], he states the the Von Neumann architecture creates an intellectual bottleneck, and I content that all modern functional languages regress to the Von Neumann architecture in the form of MONADS because of this intellectual bottleneck.


#Trapped

All of mankind has been trapped in the Von Neumann architecture, even those that can see there is a better solution fall back into it's trap.


#Escaping the Von Neumann architecture.

Late 1930's researchers were searching for a means to implement a "Universal Turing machine", then in 1945, Von Neumann described a practical means by which this could be implemented using the very limited technology of that time,  the first successful run of a stored-program was made in 1948. The architecture was simple enough to be practical and robust enough to evolve into the foundation for today's mass computing phenomena.

The Von Neumann architecture is based on
1) processing unit containing an 
1a) arithmetic logic unit and 
1b) processor registers,
1c) a control unit containing an instruction register and
2) program counter, 
3) a memory to store both data and instructions, 
4) external mass storage, and 
5) input and output mechanisms.


"*A von Neumann language is any of those programming languages that are high-level abstract isomorphic copies of von Neumann architectures. As of 2009, most current programming languages fit into this description, likely as a consequence of the extensive domination of the von Neumann computer architecture during the past 50 years.*

*The differences between Fortran, C, and even Java, although considerable, are ultimately constrained by all three being based on the programming style of the von Neumann computer*" [6].

It is an over simplification, but it can be considered that Functional programming tries to eliminate the program counter, while still keeping memory, mass storage and input and output mechanisms as vital parts that have to be preserved and provided for within the language.

##Eliminating the artefacts of our technical limits from the architecture

Imagine how different our programming architecture would be today, if all computer memory right from the first bits in the first stored program computer to every QB today was directly accessible and non volatile memory, imagine some or all of that memory being content addressable memory [3]. Imagine if we could reach into that memory and observe and change it directly.

These technologies all exist today and can be used to create a new architecture.

In comparison to the Von Neumann Definition above it the new architecture Definition would be:
Definition : "A design architecture for an electronic digital computer with parts consisting of a processing unit or units containing arithmetic logic, instruction register(s) and program counter(s), and a common memory to store both data and instructions that is directly accessible by address or context, and where the memory is associated with an external host or hosts providing mechanisms for input and output to be stored in the memory, and where such a host can trigger a set of code to be executed in the processor within the context of an event."

What is critical, is the notion that the input, output and events is provided by a host (likely programmed in an imperative language) and that no attempt be made in the language to provide those natively, but we can within the source file have some markup can be used to specify what needs to be provided by the host. Comparing a simple Haskell example [5]



	--Haskell with monad
	main = do
	  putStrLn "Please enter your name:"
	  name <- getLine
	  putStrLn ("Hello, " ++ name ++ ", how are you?")

	--vs Haskell with new architecture where input, output and events is provided declarative by a host 

	<input name="name" placeholder="Please enter your name">
	<span name="message"></span>
	"Hello, " ++ name ++ ", how are you?" -> message

	--or 

	<select name from context>
	<span name="message"></span>
	"Hello, " ++ name ++ ", how are you?" -> message


As demonstrated by this very simple example, this new model is very well suited to functional languages eliminating impurities and the need to serialise input and output.

Now I don't suggest that it would be practical to build such hardware, but it certainly is possible to create such a virtual environment, or a language that compiles to such an environment.

SQL is a functional language (the successful cousin of Haskell [4]) and in fact a SQL database is a very close approximation of  the new architecture, Once we get the abstraction of the input, output and events correct, SQL becomes a candidate to test this hypothesis in the real world, hence our platform QualeQuest/SQL-MVC, which uses SQL to deliver a fully operational declarative / functional application language.

Please visit <https://github.com/quale-quest/sql-mvc> for some more detail on the platform.

[About Lafras] (https://github.com/quale-quest/sql-mvc/blob/master/doc/Theory/About_Lafras.md)

[1]: https://web.stanford.edu/class/cs242/readings/backus.pdf "Can Programming Be Liberated from the Von Neumann Style?"
[2]: http://ieeexplore.ieee.org/xpl/articleDetails.jsp?reload=true&arnumber=4063250
[3]: https://en.wikipedia.org/wiki/Content-addressable_memory
[4]: http://thoughts.davisjeff.com/2011/09/25/sql-the-successful-cousin-of-haskell/
[5]: https://en.wikibooks.org/wiki/Haskell/Simple_input_and_output
[6]: https://en.wikipedia.org/wiki/Von_Neumann_programming_languages
[7]: https://en.wikipedia.org/wiki/Von_Neumann_architecture


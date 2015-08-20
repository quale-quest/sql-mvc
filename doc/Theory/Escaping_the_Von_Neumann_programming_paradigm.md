Thanks for [all the input from the redditors who commented on my first draft] (https://www.reddit.com/r/programming/comments/3e7avo/escaping_the_von_neumann_architecture/), this is an almost complete rewrite, I hope I have made it better.



This paper is not ready for publication yet! If you do find it, please don't post it to Reddit or others.

#Escaping the Von Neumann programming paradigm

**This is not about the imperative vs functional programming paradigms.**

##Firstly the definitions

I am making use of the following verbose terms, with their corresponding definitions, to make sure readers from different backgrounds all have a common base of understanding.

**PC** - [program counter] (https://en.wikipedia.org/wiki/Program_counter) / Instruction pointer.

**CPU**  to facilitate the discussion herein I define the CPU as a  processing unit containing, arithmetic logic unit and a control unit only. Deliberately omitting the PC, and ignoring the internal/external nature of the registers and requirement for an instruction register.

**DISK** - any non-volatile storage outside of the CPU.

**IO** - any input and output mechanisms, including but not limited to terminal, network and DISK.

**hardware architecture**: - Actual real hardware implemented in circuits, or virtual hardware implemented in a computer program that may imperfectly emulate the hardware.

**Von Neumann hardware architecture**: "*A design architecture for an electronic digital computer with parts consisting of a 1) processing unit containing an arithmetic logic unit and processor registers, a control unit containing an instruction register and [program counter] (https://en.wikipedia.org/wiki/Program_counter), 2) a memory to store both data and instructions, 3) external mass storage, and 4) input and output mechanisms.*" [7] Thus (CPU & PC & RAM & DISK & IO)

**von Neumann language**: "*A von Neumann language is any of those programming languages that are high-level abstract isomorphic copies of von Neumann hardware architectures.*", further "*The differences between Fortran, C, and even Java, although considerable, are ultimately constrained by all three being based on the programming style of the von Neumann computer* [6]",

**von Neumann programming paradigm** is a the paradigm used when a program is written following an abstract isomorphic copy of von Neumann hardware architecture. **There is an important distinction between a von Neumann language and the von Neumann programming paradigm**.

**Pure Backus hardware architecture** : A hardware architecture ( example: [The Reduceron] (https://www.cs.york.ac.uk/fp/reduceron/) or  [The Non-Von] (http://www.chrisfenton.com/non-von-1/) ) ideally suited to the pure functional programming paradigm. Thus (CPU & RAM)

**Practical Backus hardware architectures** : A hardware architecture ideally suited to the impure functional programming paradigm. Thus (CPU & RAM & DISK & IO).

**the TRAP** or **Von Neumann intellectual bottleneck** : John Backus stated the Von Neumann hardware architecture creates an intellectual bottleneck [1]

##John Backus

The Von Neumann hardware architecture was a practical means by which to implement a [Universal Turing machine] (https://en.wikipedia.org/wiki/Universal_Turing_machine) using the very limited technology available in 1945, and  has been robust enough to evolve into the foundation for today's mass computing phenomena.

John Backus contemplating a minimal Von Neumann hardware architecture (CPU & PC & RAM), sees there a limitation in the architecture that creates a bottle neck in the "connecting tube" - between the CPU and RAM, he goes on to say: *"Surely there must be a less primitive way of making big changes in the store than by pushing vast numbers of words back and forth through the von Neumann bottleneck. Not only is this tube a literal bottleneck for the data traffic of a problem, but, more importantly, it is an intellectual bottleneck"* - Thus the "Pure Backus hardware architecture", could consist of a CPU instantly operating on massively parallel RAM  (CPU & RAM).

##The TRAP

Backus states : *"In seeking an alternative to conventional language we must first recognize that a system cannot be history sensitive (permit execution of one program to affect the behaviour of a subsequent one) unless the system has some kind of state (which the first program can change and the second can access). Thus a history-sensitive model of a computing system must have a state-transition semantics, at least in this weak sense. But this does not mean that every computation must depend heavily on a complex state, with many state changes required for each small part of the computation (as in von Neumann languages)."* - This is where Backus himself, in searching for a pragmatic solution, gets caught in the TRAP, as in 1945, technology like non-volatile RAM was not practical, and the only practical means to make a state persistent was to write it to external storage. - Thus the "Practical Backus hardware architecture", consist of a CPU instantly operating on massively parallel RAM, and means to perform DISK and IO operations (CPU & RAM & DISK & IO).


##Next: part 2 - [Eliminating the artefacts of our technical limits from the architecture] (https://github.com/quale-quest/sql-mvc/blob/master/doc/Theory/Escaping_the_Von_Neumann_programming_paradigm_part2.md/),


[1]: https://web.stanford.edu/class/cs242/readings/backus.pdf "Can Programming Be Liberated from the Von Neumann Style?"
[2]: http://ieeexplore.ieee.org/xpl/articleDetails.jsp?reload=true&arnumber=4063250
[3]: https://en.wikipedia.org/wiki/Content-addressable_memory
[4]: http://thoughts.davisjeff.com/2011/09/25/sql-the-successful-cousin-of-haskell/
[5]: https://en.wikibooks.org/wiki/Haskell/Simple_input_and_output
[6]: https://en.wikipedia.org/wiki/Von_Neumann_programming_languages
[7]: https://en.wikipedia.org/wiki/Von_Neumann_architecture


This is part 2 of [Escaping the Von Neumann programming paradigm] (https://github.com/quale-quest/sql-mvc/blob/master/doc/Theory/Escaping_the_Von_Neumann_programming_paradigm.md/),

##Eliminating the [artefacts] (http://grammarist.com/spelling/artefact-artifact/) of our technical limits from the architecture

Imagine how different our programming paradigms would be today, if all computer memory right from the first bits in the first stored program computer to every QB on every disk today was directly accessible and non-volatile memory, imagine some or all of that memory being [content (or context) addressable memory] (https://en.wikipedia.org/wiki/Content-addressable_memory). Imagine if we could reach into that memory and observe and change it and trigger execution directly.

These technologies all exist today and we can use them to create a new architecture.

The **"new architecture" definition** would be:
A design architecture for a computer with parts consisting of 1) directly connected or networked processing unit or units  containing an arithmetic logic unit or units,  2) an event unit or units that can trigger instructions within a context of an event - similar concept to an interrupt, 3) an infinite non-volatile memory to store both data and instructions that is directly accessible by address or context and, 4) external host or hosts that have direct access to the NVRAM and provides mechanisms for user interface.

Thus the architecture consists of 4 parts ( (CPU & NVRAM & EVENT-CONTEXT) + HOST), but the CPU does not directly operate with the HOST, Thus the CPU is idle, operates on the NV-RAM alone, when triggered by an event-context. The CPU may return a object in the event context at the end of the event, but it does not interact with the HOST during its execution like the CPU does with DISK and IO in the Von Neumann hardware architecture (or like IO monads in most functional languages). 

What is critical, is the notion that a HOST provides the user interface and events within a CONTEXT, a practical scheme for imperative hardware may consist of : 1) The CPU+PC sitting idle, 2) on an event such as a user action, network, timer or chained event, The HOST pushes the CONTEXT to the CPU stack , and sets the PC address to that of the code associated with that event, 3) The CPU can then run and alter the non-volatile state (NVRAM) based on the code and the CONTEXT, 4) at the end of the routine the CPU returns, this triggers the HOST to examine the NVRAM and handle any output to the user.

In order to avoid the trap, It is equally important that the CPU & NVRAM boundary not be confused or moved to the CPU & HOST boundary in order to try and emulate DISK or IO), even though the host is likely to emulate the NVRAM using DISK.

Notice, in the new architecture definition there is no reference to a program counter, this is an implementation detail we don't need to deal with, the new architecture, will work equally well with imperative or [functional] (https://www.cs.york.ac.uk/fp/reduceron/) suited processors.

I don't suggest that it would be economical to build such hardware for general purpose use. The reason to imagine such a hypothetical architecture is to escape the "Von Neumann intellectual bottleneck", when contemplating the programming paradigm.


#the "new programming paradigm"

At this point we switch from contemplating the hardware architecture, to contemplating the effects of removing the intellectual bottleneck has on our programming paradigms.

From this "new architecture" we can derive a "new programming paradigm" that eliminates external mass storage, input and output. 

The new programming paradigm is a style of programming, it is not a programming language.

The new programming paradigm is not an imperative vs functional paradigm stand-off, but rather, both need to surrender those aspects of their language or libraries that provide for storage or input and output - remove all file, display and network IO. For example currently I can write program in any imperative like C or Java, and  not use any DISK or IO (including display) functions, in which case I am following the new programming paradigm, however this program would have no practical use, unless I could control it from a debugger so I could read its completed state.

The objection now arises : *"When "read this file" is the task at hand, I don't see how I can avoid that thought."*. This exemplifies the TRAP, but it is simple to avoid. In a world built excursively on the "new architecture", that information in that file would already be in context in NVRAM, thus you would not need to read the file into memory and there would have been no means to write it out in the first place. In the real world where we do have files, it is the hosts responsibility to emulate that file being in context in NVRAM, as though it has always been there.

There is no IO in the new programming paradigm. There is no DISK in the new programming paradigm.

The new programming paradigm is not a universal best solution, like all other architectures, paradigms and languages, each has its strengths and there is no universal best solution, but within a certain number of problem domains, this new programming paradigm will be a better solution.

The new programming paradigm has a need for a notation/directive/mark-up of the boundary between the CPU and HOST. The language can, but, does not need to provide those natively, we can have directives in the source file to specify what the host must provide. However the moment you try to manipulate the HOST like you would IO or DISK, you have fallen back into the TRAP.

The new programming paradigm can be used to provide a useful and state-full model for pure functional programming that do not require monads to handle state transitions in either DISK or IO.

#Self criticism

There are probably more issues that what can be mentioned here.

**vague description** this is only an abstract introduction.

**Over reliance on a vague HOST** - Yes the scope of the host is vast and will still get its own paper, best is to think of the host as a combination of a database and a HTML document.




##Next: part 3 - [Putting it into practice - The Proof of concept (POC)] (https://github.com/quale-quest/sql-mvc/blob/master/doc/Theory/Escaping_the_Von_Neumann_programming_paradigm_part3.md/),


[1]: https://web.stanford.edu/class/cs242/readings/backus.pdf "Can Programming Be Liberated from the Von Neumann Style?"
[2]: http://ieeexplore.ieee.org/xpl/articleDetails.jsp?reload=true&arnumber=4063250
[3]: https://en.wikipedia.org/wiki/Content-addressable_memory
[4]: http://thoughts.davisjeff.com/2011/09/25/sql-the-successful-cousin-of-haskell/
[5]: https://en.wikibooks.org/wiki/Haskell/Simple_input_and_output
[6]: https://en.wikipedia.org/wiki/Von_Neumann_programming_languages
[7]: https://en.wikipedia.org/wiki/Von_Neumann_architecture


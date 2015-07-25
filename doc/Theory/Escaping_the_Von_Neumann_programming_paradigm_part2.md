This is part 2 of [Escaping the Von Neumann programming paradigm] (https://github.com/quale-quest/sql-mvc/blob/master/doc/Theory/Escaping_the_Von_Neumann_programming_paradigm.md/),

##Eliminating the [artefacts] (http://grammarist.com/spelling/artefact-artifact/) of our technical limits from the architecture

Imagine how different our programming paradigms would be today, if all computer memory right from the first bits in the first stored program computer to every QB on every disk today was directly accessible and non-volatile memory, imagine some or all of that memory being [content (or context) addressable memory] (https://en.wikipedia.org/wiki/Content-addressable_memory). Imagine if we could reach into that memory and observe and change it and trigger execution directly.

These technologies all exist today and we can use them to create a new architecture.

The **"new architecture" definition** would be:
A design architecture for an electronic digital computer with parts consisting of a 1)processing unit or units containing an arithmetic logic unit or units, directly connected or networked 2) event unit or units that can trigger instructions within a context of an event (similar concept to an interrupt), 3) an infinite non-volatile memory to store both data and instructions that is directly accessible by address or context and, 4) external host or hosts that have direct access to the NVRAM and provids mechanisms for input and output and event triggers.

Thus the architecture consists of 4 parts (CPU & NVRAM & EVENT-CONTEXT & HOST) 

What is critical, is the notion that a HOST provides the input, output and events (with context), a practical scheme for imperative hardware may consist of : 1) The CPU+PC sitting idle (PC stalled ), 2) on an event (user action, network, timer or chained event ) The HOST pushes the CONTEXT to the CPU stack , and sets the PC address of the code assigned to that event, 3) The CPU can then run and alter the non-volatile state (NVRAM) based on the code and the CONTEXT, 4) at the end of the routine the CPU returns, this triggers the HOST to examine the NVRAM and handle any output to the user.

In order to avoid the trap, It is equally important that the CPU & NVRAM boundary not be confused or moved to the CPU & HOST boundary, even though the host is likely to emulate the NVRAM using DISK.

Notice there is no reference to a program counter, this is an implementation detail we don't need to deal with, the new architecture, will work equally well with imperative or [functional] (https://www.cs.york.ac.uk/fp/reduceron/) suited processors.

I don't suggest that it would be practical to build such hardware. The reason to imagine such a hypothetical and impractical architecture is to escape the "Von Neumann intellectual bottleneck" in examining the programming paradigm.


#the "new programming paradigm"

At this point we switch from contemplating the hardware architecture, to contemplating the effects of removing the intellectual bottleneck has on our programming paradigms.

Now from this "new architecture" we can derive a "new programming paradigm" that eliminates external mass storage, input and output. 

The new programming paradigm is a style of programming, it is not a programming language.

The new programming paradigm is not an imperative vs functional paradigm stand-off, but rather, both need to surrender those aspects of their language or libraries that provide for storage or input and output - remove all file, display and network io. For example I can write a C program that does not use DISK and IO, in which case it is not following a von Neumann programming paradigm. Normally this program would have no practical use unless I could control it from a debugger to influence its starting state, and I could read its completed state.

The objection now arises : *"When "read this file" is the task at hand, I don't see how I can avoid that thought."*. This exemplifies the TRAP, but it is simple to avoid. In a world build excursively on the "new architecture", that information in that file would already be in context in NVRAM, thus you would not need to read the file into memory and there would have been no means to write it out in the first place. In the real world where we do have files, it is the hosts responsibility to emulate that file being in context in NVRAM.

The new programming paradigm is not a universal best solution, like all other architectures, paradigms and languages, each has its strengths and there is no universal best solution, but within a certain number of problem domains, this new programming paradigm will be a better solution.

The new programming paradigm has a need for a notation/directive/mark-up of the boundary between the CPU and HOST. The language does not need to provide those natively, but we can have directives in the source file to specify what the host must provide. However the moment you try to manipulate the HOST like you would IO or DISK, you have fallen back into the TRAP.



##Next: part 3 - [Putting it into practice - The Proof of concept (POC)] (https://github.com/quale-quest/sql-mvc/blob/master/doc/Theory/Escaping_the_Von_Neumann_programming_paradigm_part3.md/),


[1]: https://web.stanford.edu/class/cs242/readings/backus.pdf "Can Programming Be Liberated from the Von Neumann Style?"
[2]: http://ieeexplore.ieee.org/xpl/articleDetails.jsp?reload=true&arnumber=4063250
[3]: https://en.wikipedia.org/wiki/Content-addressable_memory
[4]: http://thoughts.davisjeff.com/2011/09/25/sql-the-successful-cousin-of-haskell/
[5]: https://en.wikibooks.org/wiki/Haskell/Simple_input_and_output
[6]: https://en.wikipedia.org/wiki/Von_Neumann_programming_languages
[7]: https://en.wikipedia.org/wiki/Von_Neumann_architecture


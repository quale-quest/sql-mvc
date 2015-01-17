#working make file for linux taken from 
#http://www.aolserver.cz/ -> http://www.aolserver.cz/download/UDF_fb_mhash-1.2.01.tgz

#CLI version
#sudo gcc -fPIC -Wall -w -I/opt/firebird/include -c  q_UDFLibC.c -o  q_UDFLibC.o
#sudo ld q_UDFLibC.o -o /opt/firebird/UDF/q_UDFLibC.so  -shared -lib_util

#old IBASE=		/opt/firebird
IBASE=		/usr/lib/firebird/2.5

# ---------------------------------------------------------------------
# General Compiler and linker Defines for Linux
# ---------------------------------------------------------------------
CC=		gcc
LINK=		gcc
LIB_LINK=	ld
CFLAGS=		-c -w -I$(IBASE)/include 
LIB_CFLAGS=	-fPIC $(CFLAGS)
LIB_LINK_FLAGS=	-shared -lib_util 
RM=		rm -f

.SUFFIXES: .o .c 


.c.o:
	$(CC) $< $(CFLAGS) $@



all:	q_UDFLibC

q_UDFLibC.o:q_UDFLibC.c 
	$(CC) $< $(LIB_CFLAGS) -o $@

q_UDFLibC: q_UDFLibC.o
	$(LIB_LINK) $@.o -o $@ $(LIB_LINK_FLAGS)
	@echo coping q_UDFLibC to $(IBASE)/UDF
	cp q_UDFLibC  $(IBASE)/UDF/q_UDFLibC.so
	ls -l $(IBASE)/UDF/q_UDFLibC.so

clean:
	$(RM) *.o   q_UDFLibC
	
sudo:
	sudo cp q_UDFLibC  $(IBASE)/UDF/q_UDFLibC.so
	ls -l $(IBASE)/UDF/q_UDFLibC.so


	
# --------------------------------------------------------------------
#eof
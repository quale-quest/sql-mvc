/*
 * q_UDFLibC - copyright (c) 2014 Lafras Henning
 */


#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <string.h>
#include "ibase.h"
#include "ib_util.h"


int Z$F_VERSION(void)
{
return (100);
}


void escapeJSON(const char* input,char* output)
{
    *output='"';output++;    
    while (*input)
    {
        switch (*input) {
            case '"':
                *output='\\';output++;
				*output='"';output++;
                break;
            case '/':
                *output='\\';output++;
				*output='/';output++;				
                break;
            case '\b':
                *output='\\';output++;
				*output='b';output++;				
                break;
            case '\f':
                *output='\\';output++;
				*output='f';output++;				
                break;
            case '\n':
                *output='\\';output++;
				*output='n';output++;				
                break;
            case '\r':
                *output='\\';output++;
				*output='r';output++;				
                break;
            case '\t':
                *output='\\';output++;
				*output='t';output++;				
                break;
            case '\\':
                *output='\\';output++;
				*output='\\"';output++;				
                break;
            default:
                *output=*input;output++;
                break;
        }
		input++;
    }
	*output='"';output++;    
	*output=0;output++;    
}

#define UNESCAPED 0
#define ESCAPED 1
void unescapeJSON(char* input,char* output)
{
    int s = UNESCAPED;
	int inlen=strlen(input)-1;
	
	//remove wrapping quotes it they exist
	
	if (*input=='"')
	    if (input[inlen]=='"') //len will be at least 1
	        {
			input[inlen]=0;
			input++;
			}			
	  
	while (*input)
    {
        switch(s)
        {
            case ESCAPED:
                {
                    switch(*input)
                    {
                        case '"':
                            *output = '\"';
                            break;
                        case '/':
                            *output = '/';
                            break;
                        case 'b':
                            *output = '\b';
                            break;
                        case 'f':
                            *output = '\f';
                            break;
                        case 'n':
                            *output = '\n';
                            break;
                        case 'r':
                            *output = '\r';
                            break;
                        case 't':
                            *output = '\t';
                            break;
                        case '\\':
                            *output = '\\';
                            break;
                        default:
                            *output = *input;
                            break;
                    }
                    output++;
                    s = UNESCAPED;
                    break;
                }
            case UNESCAPED:
                {
                    switch(*input)
                    {
                        case '\\':
                            s = ESCAPED;
                            break;
                        default:
                            *output = *input;
							output++;							
                            break;
                    }
                }				
        }
		input++;
    }
	*output=0;output++;
}


void escapeSQL(const char* input,char* output)
{
    *output='\'';output++;    
    while (*input)
    {
        switch (*input) {
            case '\'':
                *output='\'';output++;
				*output='\'';output++;
                break;
            default:
                *output=*input;output++;
                break;
        }
		input++;
    }
	*output='\'';output++;    
	*output=0;output++;    
}



char * Z$F_F2J (char * sz)     
{
  int len = strlen(sz);
  char * sz_result = (char *) ib_util_malloc (len*2+4);  
  escapeJSON(sz,sz_result);
  return sz_result;
}

char * Z$F_J2F (char * sz)     
{ 
  int len = strlen(sz);
  char * sz_result = (char *) ib_util_malloc (len);  
  unescapeJSON(sz,sz_result);
  return sz_result;
}


char * Z$F_F2SQL (char * sz)     
{
  int len = strlen(sz);
  char * sz_result = (char *) ib_util_malloc (len*2+4);  
  escapeSQL(sz,sz_result);
  return sz_result;
}



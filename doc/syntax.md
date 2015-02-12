
#Basic Syntax


##in BNF:

[]  ::= 0 or 1

{}  ::= 0 or more

Quic ::= { {html}{"<#"[quick_Command]{newline quick_Command}"/>"} }

newline ::= "\n"

quick_Command ::=  Command[command_parameters][query_line]{newline query_line}

Command ::= container|button|link|table|form .....

command_parameters ::= "(" json_like_object ")"	 

query_line ::= plain_SQL|noSQL|quicc_code

quicc_code ::=  [plain_SQL|noSQL]["--:" json_like_qualia | "--" json_like_extra_command_parameters]
      
json_like_qualia ::= "{" json_like_object "}"	  

json_like_extra_command_parameters ::= "{" json_like_object "}"	  
	  
noSQL ::= not currently defined

json_like_object ::= JSON syntax with the following adjustments
1. Quotes are either single (') or double (")
2. Quotes around keys and single word values are optional
3. Separators are either comma(,) or space or newline.
4. Short form object omit the  colon(:)  abc{def=123} 
5. non key:value pairs are arrays so  abc{def,123} is abc:{array:["def","123"]}
5. non key:value keys are switches set to "on" so abc{def,123} is abc:{def:"on","123":"on",array:{"def","123"}}





##Description:

The .quic file is a HTML fragment, any un-escaped text will be interpreted as HTML.
The escape is <# ../>
Commands start on a new line, and are optionally followed by command parameters in braces, 
and followed by query code which extend the next command.

each query line has a left part consisting of a SQL code separated with  "--:{}" from the right part 
which contains qualia. Extra command parameters can also be supplied with  --{}.






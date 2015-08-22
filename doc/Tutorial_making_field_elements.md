#Making field elements


## for new link types in Fields.quicc presume with tablestyle:"DT" and Newsubstyle
	element(DtNewsubstyleLinkFieldLink_Main)
	element(DtNewsubstyleLinkFieldLink_Div)
	element(DtNewsubstyleLinkFieldLink_Script)
	
use as --:{substyle:Newsubstyle, in quale	


Element translations functions
proper - converts CamelCase and Under_score text to Proper case text - useful for getting titles from field names
quotes - escape the text into one, single quoted string, converts new lines to spaces and single quotes to double
urlescape - escape a string suitable for passing as a uri
marked - escape markdown text to display as html

Thease translate functions can only run on static content,
To translate content from the database you must use softcodecs



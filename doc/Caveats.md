# Caveats

##Server

all parameters passed from command line get leading 0's stripped
	including usernames may not start with a 0
	
	



	
maximum script size at the moment is around 32k ..not sure why


##Compiler

SET TERM ^ ; or SET TERM ; ^ must have a space between the ^ ;	


##Language

in a button script, the code will execute in the reload of the page, thus
	local variables like :assign (var="lead_number='0'||substring(params.phone_number from 3)");
	will not be available as #lead_number#









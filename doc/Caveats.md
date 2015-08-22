# Caveats

##Features and changes still to be added to the docs

the drop-in package name prefix has changed from sql-mvc to sql-mvc-di
plug-ins are now called sql-mvc-*, and are manually configured under packages in the config file

We can now inherit config files in a chain, 
  or from the base install when we are in the super directory under a project name
example :
	{
		"config_inherit":"base" ,
		"db": {"database": "/var/lib/firebird/2.5/data/demo_db_gm1.fdb"}
	}

	
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









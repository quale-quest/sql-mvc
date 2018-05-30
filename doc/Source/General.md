# Genral Overview,

## WIP 

...

## Passing paramaters to the new page

by class:  example  --:{class:fordetaildiv,Action:Link,Type:Link,pass:{DivoutName:detaildiv},pointer:0}

	 
## How does run_procedure work?

    when a button with procedure is clicked,
		then run_procedure is set as a flag
		and the target form will execute a conditional code based on that value in the run procedure
		
	 page params passes		
		run_procedure 
		run_procedure_pk 
		run_procedure_param=''" + param 
			
	this is used in click code, links and pop up pages.

	
	
## How to develop in the source	
	




## TODO

* remove driver dependant sql from GUI
* separate sql drivers into separate files
* postgresql driver
* mysql documentation
* get config for db engines from alternate file - main config should be kept simple
* DB Engine Directive so wherever you can use alternate database specific code in the quicc source.




## Done

* fake_domains
* simple translations


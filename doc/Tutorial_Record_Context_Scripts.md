# Record context scripts

Every button can in addition to simply linking to another file (or updating the current)
also execute a script with the context of the record it was in.


The record must have a primary key, and this will be passed to the procedure as "run_procedure_pk",
which can be used as per this example.

Example
	
<#script(when:name_of_script)
UPDATE PRODUCT set UNIT=cast (UNIT as integer)+1
where ref=:run_procedure_pk
#>

<#Table 
Select 
'Increment',  --:{title:"Increment",Action:"Link",Type:"Link",execute:name_of_script}
ref           --:{as:pk}
...
#>	
	

	


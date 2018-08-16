# units_of_measure

Purpose - The unit of measure is to allow variable user text input that is sortable or searchable by range .
	example : for components, 1 the lengths can be captured as 300mm, 1m, and 3000mm, and correctly sort and filter(like with a 500mm to 2m range).
	example 2 : "1 mile"  returns 1609.344 m
	
Alternative Purpose - to allow the user to choose the unit of measure for display  - prefer Metric or Imperial, or choose uom per field	

Alternative Purpose - Even for displays allow the user to change preferred units (example metric vs imperial)
	
Implementation brief
	Requires an InputFieldName or DisplayFieldName that contains the text as input, and a optional hidden field for sorting and filtering

Documentation :	
	http://mathjs.org/docs/datatypes/units.html	


	
TODO:
-------------------------------------------------------


keywords: 
	uom:""		- unit of measure  - specify an input unit, or "" means any unit, 
	uod:""	    - unit of display  - specify system display or - "" means auto best fit/as per user interaction/ - "pref"-as per user settings
									will use the unit.toString() to convert/ prettify the input

Use as : 
	CREATE TABLE Product				--:{as:"Table"} 
	(
		SortUnits DOUBLE PRECISION, --:{Type:"Hide"} --the next field is stored here a sortable value as a unitless measure
		InputValue VARCHAR(20), --:{uom:"m",uod:"km" } -- this is the original input used as display value, can have range validation
	}	
	
		
...	
	










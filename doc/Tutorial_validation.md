# UX Validation (&& Assistance)
TODO:
Plan tutorial
	General concepts - possibly move to another file
	Quale concepts
	Using predefined validators in tables
	Defining your own simple validators
	Defining more complex validators
	Platfrom implementation and upgrading
	
	
	
-------------------------------------------------------
# Validation

Form validation helps us to ensure that users fill out forms in the correct format, 
making sure that submitted data will work successfully with our applications. 

We want to get the right data, in the right format — our applications won't work properly if our user's data is stored in the incorrect format, if they don't enter the correct information, or omit information altogether.

We want to protect our users' accounts — by forcing our users to enter secure passwords, it makes it easier to protect their account information.

We want to protect ourselves — there are many ways that malicious users can misuse unprotected forms to damage the application they are part of (see Website security).

Validation versus Codecs - Codecs translate user input and output, instead of strict validation, allow slacker validation and use a codec to transform to a more strict storage format.
	Best is to offer the user a transformed format - example codec converts 1.999 to 2.00 and says "only 2 decimal places allowed, do you want to use 2.00?"
	or "User name john" is already in use do you want to use "john100" - codec tests against db and offers an available alternative


https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation

Whitelist, or inclusive validation defines a set of valid characters while blacklist, 
or exclusive validation defines a set of invalid characters to try to remove.
The first concept of good input validation is whitelisting versus blacklisting. 
Blacklisting is useful and safe at the client UX level but is dangerous at the server side - best to avoid it both sides.

https://blog.securityinnovation.com/blog/2011/03/input_validation_using_regular_expressions.html#article

## Client and server side
Validation is specified either at the model, view or controller level. The actual validation specified is projected into both
 the client side code to give the user feedback on what he should be doing, and at the server side 
to avoid hacking attempts. The validation is as implementation independent as possible, 

-- Notice however practically some advance validations may require custom code or settings for the server and the client side. For example JS Regex and SQL Similar use different regex syntax, so we may have to specify both.

-- Notice currently it only implements Client side validation - server side must still be implemented

-------------------------------------------------------
W3C  understanding of how to create accessible rich internet applications.
https://www.w3.org/TR/wai-aria-practices-1.1/   

Todo more study...

-------------------------------------------------------
# Mechanism
Field validation vs Form validation
	Field validation is a lot simpler that form validation. UI can be fast and operates only on the field during editing, it does not change the stash.
	Form validation reloads the stash after changes - is much slower but still faster than DB exchanges.
	On the last field or when there is only one field, the field validation and form validation happens at the same time  - effectively is one validation 
	
	



Server SQL validation
	start transaction
	update all fields 
	run sql validation script, if fails, make error message for client, abort transaction
	produce new page
	Commit	
	-- uses different regex expressions to the client
	++ Validating/aborting within a transaction gives the highest level of protection.
	
	
JS Stash validation
	Update WIP changes to the stash(server and client side), and validate against the stach. 
			set flags in the stash and reload the page with the WIP stash.	
	++ Needs no SQL server cycles.
	++ uses same validation code server and client side
	++ if the server side fails it means the client side was compromised- warn some intrusion attempt detected.
			- server could discard silently.
	++ Dropdown list validation, will test both sides but server side protects against hacking on client side.			
	-- weakness, multi stash divs input could allow some sort of update on one stash and compromising another.
			the designer must be aware of this.

	
Server JS validation	
	Need the database field values in a javascript object stored server side before sending the stash to client.
	run js validation script, if fails, make error message for client
	++ uses same validation code server and client side

	
	

How does this get implemented in SQL-MVC ?
XXXX	Named validator classes are stored in memory, when they are used in the 
XXXX	model or the view then the field values out of the class is injected into the qualia of the field.
	
	The UI elements extract the qualia from the field to inject code into the HTML .
	The JS in the client validates and enables actions
		
-- Notice currently it only implements JS Stash validation(client and server) validation - SQL server validation must still be implemented



## Alternative Mechanism 3}
Update WIP changes to the stash, and validate against the stash. set flags in the stash and reload the page with the WIP stash.




## Optional extra Mechanism 
The change log can be stored in the client or server, allowing the user to review changes.
	- security risk!
	- must enable/disable system wide/user preferences/per instance
	- Must be able to flag fields like bank account# password# etc to not be logged or be masked
	- must be clearly visible
	- must clear on logout



## Expressions 
Evaluate against compile time const values
Evaluate against "Aggregate" values
defer: Evaluate against database const value
defer: Evaluate against page global elements
defer: Evaluate against record local elements


# UX validation vs codecs
http://mathjs.org/docs/datatypes/units.html
https://www.npmjs.com/package/convert-units
-------------------------------------------------------
# UX implementation

Changing a form to a table of forms must still work with validations
Multi-step forms, Use milestone submissions + always display a progress bar(With text also), Simple UI to build the multi screen form progress barr
Re-evaluate all the fields with each field change
Field Validation
	Field Validation while typing - after after 3 chars / 1.2 second delay	
	Alerts as “Validation Message/ colour” close to the error field while editing with Disabled submit buttons (save may still work but not submit).
		Validation messages are part of the field html/css structure
	Help Symbols (?), Dynamic help that pops up only after the user has not typed anything in a while ( 5 seconds),tool tip messages
	Error feedback did you mean "......" click able  for spelling mistakes suggestions  ...++database feedback same
	Positive feedback indicating good input Ok "name looks great"

Blocking
	Field by field Validation keep/capture focus on the field that has to be corrected - is this anti-pattern?
	
	Server side validation  - Alerts as a UI popup widget on submit.
		alerts as “Validation Summary” at the top on submit or while editing.	
	

## Field Blocking type
	Blocking is how validation affects the user interface
	block:
		None	-	simply highlight the field error - no blocking -Default
		message -	aggressively warn about the field error - no blocking - currently equivalent to none
		status  - 	prevents the status to change from editing to active
		warn	-	warn the user when saving or leaving the form- still saving
		form	-	block the user from saving or leaving the form - can navigate between fields - 
		field	-	prevent the user leaving the field - the field will not update to the database
		



	Field blocking disables the form navigation and submit. - clicking nav links should warn that invalid changes would be lost.
	Form blocking, when the user presses save, a pop-up warns it cannot be saved until errors are fixed.
				- alternative disable the save button
	Warn	when the user presses save, a pop-up warns of the errors but still allows the save .
	
	
validation conceptual settings: soft/temporal/strict/hard
	Form:
			Hard - block fields
			BlockForm - Strict - block form
			temporal - keep changes in tempry storage
			soft - keep changes in db, but flag record as invalid
	Field:
			Suggest	- does not fail the form - Give warning
			Advise	- does not fail the form - Give strong warning
			Demand  - inherit according to Form Blocking ..this should be the default 
			
			





-the problem with temporal storage is the pkref for a field will change for the same record,
	so the tempory changes has to be storded in the database, then for each query has to issue another query to get the temp chage calues
	ideally we want this to be kept at the client not the server
		- that means we should use a hash of the record pk instead of the pk_ref

	




	
	
	
	
	
	
	
## Status/Error update on editing	
	A form function that will update a hidden status field if the form saves with no errors
	A hidden error text field that  will write any validations fail messages to the record.
	
	
	


## UX scenario's
	1) creating a new from - fill in a form, save some stuff, come back later and update, finally when all is valid, sign of and submit / activate.
	2) update a 'live' form - a form that must never be invalid - when it is saved it must be valid, cannot come back and correct.
	3) Variation on live form, Deactivate a form, edit, reactivate.
	4) create a copy of a live form, when all is correct, copy over the changes. - example in the self create of cookie users	
	

## Typical simple work flow	
	Display simple empty form
	The user captures some fields, if not valid it won't let them save to the database, 
	The user aborts and all changes are lost

	
## Typical complex work flow
	Display -> "Job Step 1 of 6"
	The user captures some fields, when valid then show or enable buttons [Optional Page] [Next->]
	The next page loads and again progressively we complete the details.
	If we abort out at any time we can come back again and the earlier steps will have the data filled in, we can resume.
	

-------------------------------------------------------
# Syntax

unchangedok / MustChange   is a flag at either field or table level that allows it unchanged and still save or exit the reocrd without "aborting" the edit

Declaration
validator{
	name:"VALIDATORNAME",
		nullok,  																		-- indicates null is acceptable
		unchangedok,																	-- dont block if unchanged
		block:field 																	-- 
		pattern:"JS-REGEX" ,
		
		math:""  - expression using mathjs and stash field available - 
		length:[5,20]																	-- or length_min length_max  size_min	
		range:[3,99]		
		
		fails:"The email address must be valid",
		
		xxx similar:"SQL-REGEX",
		xxx jsscript:CDV_CHECK,
		xxx sqlscript:CDV_CHECK,
		--use math expression:"((Aggregate(Balance) + Aggregate(values)) > Aggregate(Limit))",		-- should be a boolean evaluation
		--use math expression:"(VALIDATORNAME & VALIDATORNAME | VALIDATORNAME)",					-- should be a boolean evaluation		
		xxx And:",,"																		-- ListOf other VALIDATORNAME's  could use & in expression
		xxx ??? Or:",,"																			-- ListOf other VALIDATORNAME's  could use || in expression
		xxx Assign:"max=Aggregate(Limit)-Aggregate(Balance)-Aggregate(values)" 				-- Updates the element max whenever the Aggregate change
		xxx Aggregate:AggregateName															-- the result is shared by this name
		        
		xxx pass:"The email address is valid",
		
		xxx blank:"Valid email",
		xxx placeholder:"Enter valid Email",
		xxx hint:"..."
		}
		


 
Use	
NAME,   --:{Action:Edit,pattern="[A-D]{3}",placeholder:"What needs to be done (tab to save)"}
EMAIL,   --:{Action:Edit,placeholder:"Email for regular updates",validator:EMAIL}
BUDGET,  --:{Action:Edit,placeholder:"Monthly Budget",max:1000}


better:
BUDGET,  --:{Action:Edit,placeholder:"Monthly Budget",max:Aggregate(Limit)}



button (title:"View all",Indicate='AggregateName')	 -- warn on button
button (title:"View all",Block='AggregateName')	     -- disable button 
button (title:"View all",Enable='AggregateName')	 -- enable button
	
 

 
validator will translate short format to long format that is easy to use in ui_elements
	such as "range" will be translated to valid_range_min and valid_range_max


-------------------------------------------------------
	
## Examples

Simple Named validations
	validator{name:"name",length:[5,20]}	-- or length_min length_max  size_min	
	validator{name:"age1",range:[1,140] }	
	validator{name:"age2",pattern:"(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}",Aggregate:Age}	
	validator{name:"age3",regex:/^[0-9]\d*$/}	
		
	validator{name:"Gender",range:['male','female']}	  -- better to use lists for this
	
Complex validations	
	validator{name:"CDV",script:CDV_CHECK}	

validator{name:"EMAIL",pattern:"^[a-zA-Z0–9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0–9](?:[a-zA-Z0–9-]{0,61} [a-zA-Z0–9])?(?:\.[a-zA-Z0–9](?:[a-zA-Z0–9-]{0,61}[a-zA-Z0–9])?)*$" 
                      ,fails:"The email address must be valid"
					  ,pass:"The email address is be valid",
					  ,blank:"Valid email",
					  placeholder:"Enter valid Email"}
validator{name:"TWEET",pattern:"^@[A-Za-z0-9_]{1,15}$",fails:"The twitter handle must be valid check https://help.twitter.com/en/managing-your-account/twitter-username-rules for more info "}
validator{name:"SMS",pattern:"^\+[0-9_]{1,15}$",pass:"The sms number must be a valid phone number "}
validator{name:"BLANK",pattern:"^$",pass:"This Field must be filled."}
validator{name:"NONBLANK",pattern:".+",pass:"This Field must be filled."}

wrong --:{validator:"OptionalIMContact",validate_any:"+BLANK,-EMAIL,-TWEET",fails:"Either a EMAIL or Twitter handle MUST be filled."}
wrong --:{validator:"MustHaveIMContact",validate_any:"+EMAIL,+TWEET",pass:"Either a EMAIL or Twitter handle can be filled in."}

validator{name:"Limit",expression:"((Aggregate(Balance) + Aggregate(values)) > Aggregate(Limit))",Aggregate:Limit}	



-------------------------------------------------------
# Research and comments

https://www.uxmatters.com/mt/archives/2006/07/label-placement-in-forms.php
	Must read
	it’s advisable to NOT use bold fonts for input field labels. 

https://designmodo.com/ux-form-validation/

https://www.ventureharbour.com/form-design-best-practices/
Insights:
	Multi-step forms out-perform single-step forms + Use milestone submissions + always display a progress bar(With text also)
	Avoid placing questions side-by-side.
	Clearly explain what’s next upon clicking the submit button
	For mobile  Question fields and buttons should be at least 48 pixels high. & All form labels & placeholder fonts should be above 16px
		 Use the right keyboard (to match the input data you need).
	
https://www.nngroup.com/articles/form-design-placeholders/	
Insights:
	Label for field should be fixed top - use placeholder as a suggestion of input format - Never use all caps, sentence case is better.
	
https://medium.com/@andrew.burton/form-validation-best-practices-8e3bec7d0549	
Use the holy trinity of colour change, message text, and icons for accessible validation	

https://www.smashingmagazine.com/2017/06/designing-efficient-web-forms/
Labels are not help text. Use succinct, short, descriptive labels (a word or two) 

https://www.uxmatters.com/mt/archives/2006/07/label-placement-in-forms.php


https://uxplanet.org/designing-more-efficient-forms-assistance-and-validation-f26a5241199d
https://developer.telerik.com/featured/form-validation-right-mobile-applications/

http://parsleyjs.org/doc/index.html#validators
	do not proceed with field validation when less than 3 chars have been input. Do not assault your users with error messages too soon!
	Quick error removal: when a field is detected and shown as invalid, further checks are done on each keypress to try to quickly remove error messages once the field is ok.
	One error at the time

https://codecraft.tv/courses/angular/forms/model-driven-validation/	
Insights:
	terms used: Validator, invalid, ,pristine , dirty(has been changed), touched(user click on field but left it unchanged)
				show error only when  invalid&&(dirty||touched)  // this conflicts with parsleyjs rule: 3 chars 
				show green only when  valid&&(dirty||touched)
	Angular is kak (code intensive)
	
https://www.culttt.com/2012/08/08/really-simple-inline-javascript-validation/	


https://itnext.io/https-medium-com-joshstudley-form-field-validation-with-html-and-a-little-javascript-1bda6a4a4c8c

	
-------------------------------------------------------

# Implementation strategy

## math funtions


input()      	: changed value for field under test
x()      	: original value for field under test
f(fld)      : value of another field in same record
fr(fld,rec) :
frt(fld,rec,tbl):
sum(fld,tbl) : 
count(tbl) 
p(indx)  : table/Field name passed as parameter 


F(abs_table_nr,abs_record_nr,abs_field_nr)
F(relative_record,abs_field_nr)
F(abs_field_nr)
F  - current field
Fq("stored_procedure(...)")				-- make query to server stored procedure, starting with ZZ$Public_xxxxxxx

sum(abs_table_nr,abs_field_nr)
length()

## Class
.validates  - a class on all fields that should be validated on save - used to iterate over validation fields

## Table and field referances in validators
Validators can access other fields of tables on the same page,
Each table can have a alias name that is used to refreance the table in code or validators.
We use a alias name as several quries may be from the same table or tables may be used multiple times.
...consider renaming the alies as query_name or similar
the tablealias.fieldname fromat can be used directly in the validator or may be used inderectly by
passing it/them as a paramater, the validator can then refer the field as p(n).




-------------------------------------------------------
Examples:
	
validator{name:"RegionalCompetentAge",
	uom:"years",
	range:[f(p(1)),99],
	fails:"You must be of competent age in your country."}	
	
--AGE,          --:{Action:Edit,validator:{RegionalCompetentAge:{preftable.CompetentAge}}}

Verify_password,--:{Action:Edit,validator:[MatchingInput:{.PASSWD}]}
-------------------------------------------------------

# Implementation strategy

implement the validator definition & storage

Simple UI - partly done

implement the validator evaluation with simple field validation  with mathjs / regex etc



update stash - display stash

implement the validator evaluation with form validation onto updated stash



Implement Units of Measure with mathjs 

Refnine Real UI for validation, assistance and units of measure


add Aggregates over stash



xxx implement Aggregate classes - consider client side codec's

xxx implement Update Aggregate targets


$('.box').css('opacity', '0.2');



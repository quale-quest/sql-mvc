#Elements  (Element_widget.js)

Elements are field level elements that can be free standing, or placed in a table, form or menu containers.
each element corresponds to a database (table,record and field).

An Element preforms one of four basic actions that operate on their field. 
	* Link
	* Edit
	* Hide
	* Display (any other type)

The four functions are augmented by styles for different situations like
	* Link
	* Button
	* Icon


Elements are defined in quicc files  Fields.quicc, Actions.quicc etc.
	element(name)
		MoustacheCode



	The name of the element is format
		 substyle+Type+"Field"+Action+"HTMLTYPE"	 
		example LinkFieldLink_Main
	
		"Link"  is the name
		"Field" is
		"Link"  is the action type, refers to action types as defined in action_widget.js or others.
		"_Main" /"HTMLTYPE" is the sub HTML part, as required Element_widget.js - "Main","Div","Script"


Depending on *_widget.js
	"Main",	- This is the inner most HTML
	"Div", - This is the HTML div wrapper
	"Script" - This is produces js scripts for executing after the page has loaded




# Hogan Moustache Code
{{}}  - Substituted at compile time with constant values such as qualia attributes.
[[]]  - Substituted at run time with live database values.


{{field.f.xxx}} - gains access to the qualia attributes of the field
{{pop}} nested container elements / widgets use {{pop}} for the inner / sub elements
{{QryOffset}} -- index to the field number for the element
inherit:xxxx		-- inherit all settings from another defined element 

[[0]] - is the field id index

# Debugging
sql-mvc\output\elements.quicc  - ouputs all available element styles

# Qualia values reserved for specific purpose
Currently part of user interface 1:

#Table level

* pagination
* Title


#Table field level

##Action:

* View
* Edit


##Type:

* View
* Hide
* Text
* Link
* Pick
* Gallery



##Link Styles

* Link
* Button
* Icon

##Qualia

* size
* width
* y
* placeholder
* autosave
* List


##substyle:

* Box (width=, y=)
* Lookup (List=)
* Radio (List=)
* Pick (List=)
* Datepicker
* Datetimepicker
* Slider  (min=, max=, step=, pxwidth=, orientation)
* Upload (width=, height=)
* Hide


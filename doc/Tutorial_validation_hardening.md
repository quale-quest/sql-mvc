# Malicious Data Validation
 this refers to Security, SQL, XSS hardening  - Form UX/Data validation - is covered elsewhere.

 
## Client and server side
Validation is specified either at the model, view or controller level. The actual validation specified is projected into both
at the client side code to give the user feedback on what he should be doing, and at the server side 
to avoid hacking attempts. The validation is as implementation independent as possible, 

-- Notice however practically some advance validations may require custom code or settings for the server and the client side. For example JS Regex and SQL Similar use different regex syntax, so we may have to specify both.

-- Notice currently it only implements Client side validation - server side must still be implemented
	
	
	
	
-------------------------------------------------------
Referances and comments
http://www.guidanceshare.com/wiki/Security_Design_Principles_-_Input/Data_Validation
https://websec.io/2015/02/10/Input-Validation-Strategies-Intro.html

Composing SQL, JSON and HTML data must always encode and decode the user input out of "code" space.
This is the #1 principle of integrity and safety.

When making changes to the platform #1 principle must always be applied to public facing code.
(In the compiler where we have safe input this can be relaxed)

Within the quicc source files all statements are always "prepared", even when it looks 
like it is just assembled and vulnerable 
to SQL attack it is actually prepared and hardened by the compiler.

Comment: Sanitizing apostrophes is an encoding scheme, and gets encoded on the input at the middle tier and then again decoded in the database,
and similarly on the way out - this is transparent and automatic to all IO and protects the integrity of the data or the system.




-------------------------------------------------------
	
	
	
	
	
	



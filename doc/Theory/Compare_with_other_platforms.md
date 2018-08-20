#Compare with other platforms

This particularly compares the current middle were with other platforms.
As mentioned elsewhere the middlewhere like rpc / web sockets, could all be swapped out for old style middle were like PHP and AJAX.



## https://roca-style.org/	 - very REST  focused
	SS Alternative 	
	1. Agreed on (stateless communication) :
	1. Disagree (Cached content is stored on both sides and references are exchanged in stateless communication)
	1. Disagree REST is old, stateless queries cost traffic - Web-sockets are faster, exchanging minimal data is faster, keeping states has many advantages (scalability is probably not one of them).
		further REST principles means security has to be explicitly implemented, keeping states implicitly improves security.
	2. Agreed.
	3. Disagree - Web-sockets are faster
	4. This may be a security issue, some pages can be published but security must be considered.
	5. Disagree - limited application, if you want to expose utilities, create a separate RESTful api.
	6. NA due to 5
	7. NA due to 5
	8. Agreed.
	9. Disagree  - states save traffic and processing. Can still use CDN to reduce server trafic.
	10. Agreed.
	
	CS
	1. even better the server returns JSON data only
	2. Agreed
	3. Agreed
	4. Not when using Web-sockets, alternative middlewere could do this 
	5. Partly Agree, Validation is  implemented redundantly on both sides, client side for good UI performance, server side for security.
	6. Partly Agree, server side first page rendering violates this but the user benefit is a big+ 
	7. Agreed (at run time) - to clarify - pre-compiled time does generate code, from templates other than  CoffeeScript or LESS.
	8. Agreed
	
	
	
.	
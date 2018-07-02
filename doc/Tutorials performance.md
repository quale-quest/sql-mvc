# SQL-MVC performance tutorials,

Using the following strategies we can reduce the sql server work load to that similar of high performance applications



## Some code can be moved to the client side,
The Quale application should be agnostic as to the implementation, but we could configure the platform to split workload

If we want to keep one database server at higher load than we need to more some non essential work to the middle tier,or even better to the CDN and client side.
Much simpler to have multiple middle tier servers with a single database than to have multiple databases.

## Application design tier
	Use divine sections to split the sections to make smaller queries.	
	Large number of editable fields (>1000) on a single page is bad for performance on the server and client.
	
## Server tier	
	produce static datasets only once for a connection
	produce static datasets only once for all connections where possible	
	
## Middle tier
	CID, PKF translations can be handled in memory by JS middle tier for many hundreds concurrent connections.
	caching static datasets between connections
	User preferences this. etc that is not needed on the sql server, but needs to be server side can be stored on a redis  server.
	Auto complete field suggestions queries do not have to be serverd by the SQL database - it is a out of bound AJAX that can be sent to a redis server that gets updated from time to time.

## CDN
	use CDN to serve static files
	use CDN to serve static datasets
	
	
## Client side
Control some moustache switches on the client side; like:
  enabling coulombs, 
  ordering coulombs, 
  filtering coulombs, 
  Switching to graph views
  caching static datasets
  
  The change log can also be stored in a cookie or on the server side rather than accepting partial changes on the server. finally accept only the final record in the SQL code. 
  OR store server side on a redis  server.

  
  
  



	




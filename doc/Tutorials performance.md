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

#Static Tables
Compile time Static static tables, lists and validation data, load as static_stash, as part of the hogan template files.


  
#Table Caching
Cached Table/List
	Tables that are fairly static and can be marked as cache-able,either per system or per user
	The Query-Cache stores  Query + QueryName+ hash_of_results + results,
	The if the underlying table changes, a trigger, a script or some manual operation invalidates the Query-Cache record by name
	The Page SQL checks the Query-Cache and if a valid record does not exist it will produce a valid record.
	If Page SQL just produced the record, it will include the contents in the JSON, else the Page SQL only places a placeholder-pointer and hash value 
	for the TableJson in the stash. And outputs the stash hash in the metadata.
	The client decodes the the stash, and locates all required TableCaches, 
		comparing their hash to the local cached hash, if changed it will then request an updated TableJson.
		
	Menu's and static buttons could also be produced in the same manner- as one all-round static valid record
	Complex buttons cannot be produced this manner - their links may contain context specific info that changes every time.	
	This optimisation could enable cheap complex pages that serve quickly to users.
		
	Z$PK_CACHE records	
		Simple links are also produced as valid  when the valid record is produced.
		Even edited tables can be used  this way? - if they are user specific and nothing was actually edited on previous views.
		Z$PK_CACHE records must be flagged to not be deleted, until the Cached Table is invalidated
		
	It is only beneficial to cache for larger tables, this decision can be made in the SP after the section of stach is produced
	
	in ZZ$procedures 
		if (exists select first 1 cache_id from Z$QRY_CACHE where name='hash')  -- and user_ref=....
			add cache_id to the output
		else
			execute the query - flag data as coming from a cached record
			if (octetlength(json)>1000) then 
				store in the Z$QRY_CACHE, get cache_id
				info='QRY_CACHE', or SESSION_QRY_CACHE
				suspend;
				add cache_id to the priority metadata output				
				add cache_id to the output				
			else
				add json to the output
			endif			
		endif
		
		.. in updates
		if (update from a cached query ) expire the cached query. expire the Z$PK_CACHE records.
		
	in Server JS
		store details in common memory or in SESSION_QRY_CACHE related by cache_id
		keep hit count, last access to manage when to expire in memory cache ... save to disk/redis - load back from database?
		if request for cache_id is not available read it from sql server/ redis/disk
	
		
	in client js
		find cache_id's in the priority metadata output
		if they dont exist locally request from server
  



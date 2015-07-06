# Saving updates

When fields are changed the changes are cached at the client side until saved.

The number of unsaved changes is indicated to the user in UI1 as a counter on a diskette Icon.

There are 4 ways to save the changes to the server.


##Navigating
Navigating of the page will save all the outstanding changes.

##The "Save" Button 
Pressing the diskette Icon in UI1, will save the changes and reload the current page.

##autosave:Yes
--:{Autosave:yes} qualia on a specific field will save all the outstanding changes when this field is changed, 
and also reload the current page with the refreshed values, including any scripts or visual changes that may be in effect due to the changes.

This option is quite resource intensive and not suitable for high tragic or high latency sites.

##autosave:push
--:{Autosave:push} qualia on a specific field will save all the outstanding changes when this field is changed,
but will not reload the page.

This option is very useful to make sure all changes save to the server with minimal overhead at the server side,
it has the benefit that the user can loose connection or the server may restart and the user will not loose the changes to the fields.


	


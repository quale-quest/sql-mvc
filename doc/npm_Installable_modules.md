# npm installable modules

a "npm installable module"  is a SQL_MVC feature (often 3rd party) that can be installed via NPM and may 
add additional features that are independently maintained and act as plug-ins.

Follow sql-mvc-signature_pad example. 
The folder structure follows similar to installable UI.

## If you have some example feature you want to create a plugin for,

Create in the folder client\static\others\signature_pad a demo app of the feature, together with it's css and js assets.
Image assets is under client\static\images - they can be served from a different CDN

The feature should be self contained, and be able to be initialised repeatedly and on the fly. It must have a signature_pad_init(); function.
The feature should be re-factored to avoid global variables, and only use one global object with the same name as the feature.

Once the feature demo is ready, it gets split info html_fragments (keep original demo) to be injected into the root view. 
check app.qhtml for where these html_fragment files are injected

sql-mvc-signature_pad\client\views\  - contains the links for loading of assets and code	
	script_link.html_fragment
	script_run_inline.html_fragment
	style_link.html_fragment
	and script_init.html_fragment - which is injected when a page that uses this feature is loaded

sql-mvc-signature_pad\client\templates\Widgets\
	signature_pad.html This html_fragment contains the code that will be compiled into the context where the app requires it.

sql-mvc\client\code\app\xxx_plugin.js
	Contains code run when executing the client side moustache

	
	
TODO:

	
	Plugin list has to be updated by compiler

	
done:	

started support for multiple npm installable widgets
Split client side plugin to driver and base 
rename fill_data with init_client_plugin_mt_functions



End Of File

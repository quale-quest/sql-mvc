# User Management


Login options in config.json/run:

	"login_first":
		false : does  first page render with guest user
			
	"cookie_guest":
		false : use common guest user
		true  : create a unique user per visitor based on a browser cookie
	
	
	"selfmanage" :
		true : allow the guest to create its own user
				
	"Guest_Landingpage":"Home/Guest", - Allow the guest page to be redirected without having to delete the demo pages
	
	"SelfCreate_Landingpage":"Home/User" - where self created users land up. 
	
	"Sysadmin_Password":"PasswordGen" - make sure sysadmin in demo installs don't come with a fixed public password
				
	
#Defaulting to recommended default user management
	cookie_guest:true
	login_first:false
	"selfmanage" :true,
	



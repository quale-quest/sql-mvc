# SQL-MVC Basic tutorial,

Prerequisite knowledge : SQL.

For an introduction, this basic tutorial covers the concepts in the most simplistic manner using only the default framework,
it does not show production quality code, so please don't draw a conclusion on capabilities or limitations of the platform based on this material.


##All in one, or separate

To start with and for small simple projects it is easiest to have your models, controllers and view in one file,
but as your projects grow it is important that the models and controllers be moved to 
their own files, so they can be reused between different views.


##Step one

First we create a model, the model will contain additional information about what the fields are supposed to 
be used for and  how they should be used (Qualia).

Presume a simple use case, like a list of todo items,

```
<#model
CREATE TABLE TODO_MVC				--:{as:Table} 
(
  REF VARCHAR(40),					--:{as:pk}
  NAME VARCHAR(100),				--:{as:Text,size:40,title:todo,onupdate:"owner=operator.id"}  
  OWNER VARCHAR(40),				--:{Type:Hide}
  STATUS VARCHAR(10) default ''    	--:{Type:Pick,List:Ticked,onupdate:"owner=operator.id"}  
);/>
```

We wrap the SQL create table statement in a <# .../> and in the comments (--) we add Qualia.
When a quale is set to a value other than a single word it must be wrapped in quotes, like the onupdate.

Each of the fields on the left gets their SQL definition like VARCHAR(40) and their additional model qualia after the '--'.

The qualia is explained as follows:

1. *as:"Table"* sets that this is a Table Model we are creating.
2. *as:pk* indicates the primary key, in order for a table to be update-able it must have a unique primary key.
3. *as:Text*  indicates the primary purpose of the field is a text field. You may set the size and title fields if it is  
to be different than the SQL field attributes.
4. *onupdate*  sets any additional information to be updated in the record, when a update (or insert) to a field occurs (like a mini trigger).
5. *Type:Pick* sets the type of widget that would be used as a "Pick list" i.e. user picks one from a predefined list.
6. *List:Ticked* sets the list that the Pick will use. Here a predefined "Ticked" list.
7. *Type:Hide* indicates the field is not intended to be visible to the operator.	B.t.w. the pk is hidden by default.		



##Step two

We create an experimental view, of what we want to do with the model, wrapped in <#view ... />

```
<#view
table()
	Select  --:{from:TODO_MVC,autoinsert:top}
	STATUS, --:{Action:Edit,autosave:yes}
	NAME,   --:{Action:Edit,"autosave":yes}
	REF	    --:{}
	From TODO_MVC 
	where (owner=operator.id and ( (here.todo_type='' and (status!='3' or status is null)) 
	or( (status='' or status is null) and here.todo_type='1')or(status='1' and here.todo_type='2')))
/>
```

The *table()* statement will compile a table view based on the query, the ,*autoinsert* adds a new record position to the top of the table.
The SQL code again is the left part of the *--* and the right part is the additional qualia.
The compiler will substitute the context variables (*operator.* and *here.*) with their runtime values, but other
than that, this code would execute directly in a SQL console. In fact when doing complex queries, with many joins,
it is often easier to write the query in your favourite interactive SQL console like [flamerobin](flamerobin.org) and then copy that query over to the
into the view, or copy it back out for testing.

Each field is stated on its own line, and the Qualia applies to that field only, each field's qualia is 
made up from the model qualia, and the local qualia. It is possible to override the model qualia by setting local qualia of the same name.
Each field *must have*  a qualia, even if no additional qualia is needed use *--:{}*, else you will get a field mismatch error.

Each table could have multiple models associated with it so in the first select statement we set {*from:TODO_MVC*} as the model from which the 
fields will inherit the model qualia. This will most often be the same as the table name in the SQL from clause.(later see advanced info on joins..)

*Action:Edit* sets the field to be editable.
*autosave:yes* sets the field changes to be saved immediately, creating an interactive experience as opposed to the clicking the save button on the page.

To be able to do updates, the select must include the primary key, in this case REF.

The SQL *where* clause will filter the records with context variables being substituted at runtime, in this case 
 for this example it's filtered according to the operator, and the *here.todo_type* context variable.

The *here.* context record is a virtual record that reflect the context of the current page for the current user. 
You can set the context variables with simple buttons like: [more on setting and updating context variables....](todo)


```
</
button(title:"View all") set here.todo_type='';
button(title:"Active")   set here.todo_type='1';
button(title:"Completed") set here.todo_type='2';
/>
```

In addition to simple set statements on the context variables,
 the button widget can execute any arbitrary SQL script.
So to 'Delete' completed items we can run a SQL script in the button:

```
button(title:"Clear Completed")
sql update todo_mvc set status='3' where owner=operator.id and (status='1')
```

To provide feedback to the user, we can print any text or query to screen, with a print statement and an embedded singleton select statement.
```
print There are ($select count(*) from todo_mvc where owner=operator.id and (status='' or status is null) $) items left
```


**Putting it all together**

```
<#view
table()
	Select  --:{Title:"Make new records",from:"TODO_MVC",autoinsert:"top",tablestyle:"Todo"}
	STATUS, --:{Action:"Edit",autosave:yes}
	NAME,   --:{Action:"Edit","placeholder":"What needs to be done (tab to save)","autosave":yes}
	REF	    --:{}
	From TODO_MVC 
	where (owner=operator.id and ( (here.todo_type='' and (status!='3' or status is null)) 
	or( (status='' or status is null) and here.todo_type='1')or(status='1' and here.todo_type='2')))

print There are ($select count(*) from todo_mvc where owner=operator.id and (status='' or status is null) $) items left	
button(title:"View all") set here.todo_type='';
button(title:"Active")   set here.todo_type='1';
button(title:"Completed") set here.todo_type='2';	
button(title:"Clear Completed") sql update todo_mvc set status='3' where owner=operator.id and (status='1')		
/>
```


##Step three

Now we see there are some operations that we are likely to be reused in the future on other views,
so it is best we move some them a controller.
The controllers are centralised repository of operations that can be performed on the model,

```
<#controller(todo.clear.button)
button(title:"Clear Completed")
sql update todo_mvc set status='3' where owner=session.id and (status='1');
/>

<#controller(todo.itemcount)
print There are ($select count(*) from todo_mvc where owner=operator.id and (status='' or status is null) $) items left	
/>
```

Here are two controllers, each wrapped in <# .../> , Each has a name, and use a naming convention of model.purpose.control.

So now in the view we can say :

```
use("todo.itemcount")
use(todo.clear.button)
```


##Finally
Our little app looks like this,

```
<#model
CREATE TABLE TODO_MVC				--:{as:Table} 
(
  REF VARCHAR(40),					--:{as:pk}
  NAME VARCHAR(100),				--:{as:Text,size:40,title:todo,onupdate:"owner=operator.id"}  
  OWNER VARCHAR(40),				--:{Type:Hide}
  STATUS VARCHAR(10) default ''    	--:{Type:Pick,List:Ticked,onupdate:"owner=operator.id"}  
);/>

<#controller(todo.clear.button)
button(title:"Clear Completed") sql update todo_mvc set status='3' where owner=session.id and (status='1');
/>

<#controller(todo.itemcount) 
print There are ($select count(*) from todo_mvc where owner=operator.id and (status='' or status is null) $) items left	
/>

<#view
table()
	Select  --:{Title:"Make new records",from:TODO_MVC,autoinsert:top,tablestyle:Todo}
	STATUS, --:{Action:Edit,debug:0,autosave:yes}
	NAME,   --:{Action:Edit,placeholder:"What needs to be done (tab to save)",autosave:yes}
	REF	    --:{Action:View,Type:Hide}
	From TODO_MVC 
	where (owner=session.id and ( (here.todo_type='' and (status!='3' or status is null)) 
	or( (status='' or status is null) and here.todo_type='1')or(status='1' and here.todo_type='2')))

use(todo.itemcount)

button(title:"View all") set here.todo_type='';

button(title:"Active")   set here.todo_type='1';

button(title:"Completed") set here.todo_type='2';

use(todo.clear.button)
/>
```

##Platform agnostic

As you can see from this example, it could compile just as easily into a native mobile app as a desktop web app, this is the principle of a Qualic system.


#Next

Next step...Tutorial basic 2 ....[more control]()



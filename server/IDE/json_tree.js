

//html and css from https://github.com/gurjeet/CSSTree
exports.max_depth=10;

var show_longstring = function (str) {
var siz=120;
if (str===undefined) return undefined;
if (typeof str !== 'string' ) str = '[OBJECT]';//JSON.stringify(str);
str=str.trim();
if (str.length>siz) return "["+str.substring(0,siz/2).replace(/\n/g,'\\n') + " ..." + (str.length) + " bytes... " + str.slice(-siz/2).replace(/\n/g,'\\n')+"]";
else return "["+str+ "] shown in full "+ (str.length) + " bytes... ";
}


exports.html = function(name,object,output,TreeMessage){
  
  var this_depth=0;
  function html_recur(name,object,output)
  {
    if (this_depth>=exports.max_depth) 
        {
        //console.log('to deep  ',object);
        output.push(name+" (to deep to go further):"+JSON.stringify(object));
        return;
        }
    this_depth++;
    
  	if (Array.isArray(object))
		{
        //console.log('array type ',object);
        //output.push(Array(this_depth*4).join(" ") +"+ "+name+":"+JSON.stringify(object));
        output.push("<div class='plus' ><li > + "+name+" -->"/*+show_longstring(JSON.stringify(object))*/+"</li></div>	<ul>");
       
        for (var index = 0; index < object.length; index ++){
            html_recur(name+'['+String(index)+']',object[index],output );     
            }
        output.push("</ul>");    
        }
    else    
    if (typeof object === 'object')   
       {       
        // loop over the keys
        //console.log('object type ',object);
        //output.push(Array(this_depth*4).join(" ")+ "* "+name+":"+JSON.stringify(object));
        output.push("<div class='plus' ><li > * "+name+" -->"/*+show_longstring(JSON.stringify(object))*/+"</li></div>	<ul>");
        for (var key in object){
          html_recur( key,object[key],output );          
          }       
        output.push("</ul>");      
       }
      else
       {
       //console.log('base type ',name+":",object);
       output.push("<li>"+name+":"+String(object)+"</li>");
       //output.push("<li>"+Array(this_depth*4).join(" ") +""+name+":"+String(object)+"</li>");
       }       
    this_depth--;
    } 
  
   
  // loop over the objects
  output.push("<div class='showtree' ><li >"+TreeMessage+"+ "+JSON.stringify(object).length +" Bytes</li></div>");
  output.push('<ul class="tree" id="tree">');
  html_recur(name,object,output);
  output.push('</ul>');
  // return the calculated size
  
  return ;

}




//var obj={abc:5,def:8,ghi:[123,567,870],klm:{qwery:5,yuiop:{poiuy:5}}};
//var output  = [];
//exports.html("root",obj,output);
//console.log('\n...........................................\n',output.join('\n'));
//process.exit(2);


	


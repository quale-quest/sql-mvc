//zxDeltaScriptFile.js
//Used to do operations on tables
// is included automatically just after gt body 
//  Record changes and submit them
//  colom sorting
//  Filling Select list with option when the edit gets the focus

var chg="";
var refresh=false;
var SubmitWindowRef;
var SubmitWindowRefreshCount;
var deltacount=0;




function SubmitChanges(by) {
if (refresh)
  {
  SubmitChangesModal(by);
  return;
  }


window.open(
  	"XXXSubmit?"
        +ThisPageRef +"&"+by+"&"+chg,
  	null,
  	""//"Top="+(screen.height-20)+",left="+(screen.width-20)
                );
chg="";
ClearTicks();
}

function showModal(Url) {


  window.showModalDialog(
    Url,
    null,
    ""//"Top="+(screen.height-20)+",left="+(screen.width-20)
    );
}



var timedSubmitFunction_By;

function timedReloadFunction() {
 
 SubmitWindowRefreshCount++;
 if ((SubmitWindowRef.closed)||(SubmitWindowRefreshCount>100)) //20 seconds
   { 
   location.reload();
   }
   else
   {
   setTimeout("timedReloadFunction()",200);
   }

}

function timedSubmitFunction() {

  var ss="Submit?"+ThisPageRef +"&"+timedSubmitFunction_By+"&"+chg;
  //alert(ss);      
  var PopUpWidth=300;
  var PopUpHight=300;
  
  var PopUpTop = (window.innerHeight-PopUpHight)/2;
  var PopUpLeft= (window.innerWidth-PopUpWidth)/2;
  var PopPar= 'width='+PopUpWidth+',height='+PopUpHight+',left='+PopUpLeft+',top='+PopUpTop+', wi=' + window.innerHeight;
  //alert(PopPar);	
	SubmitWindowRef = window.open(ss
  	,null,PopPar        );
   SubmitWindowRefreshCount = 0    ;
   setTimeout("timedReloadFunction()",300);        
}

function xSubmitChangesModal(by) {

  timedSubmitFunction_By=by;
  
  setTimeout("timedSubmitFunction()",300);
  
}

    
function ModalDoneFunction() {
  //alert('ss');      
  location.reload(); 
  //$('#basic-modal-content').close();
}	


function ModalReply(response, status, xhr) {
//alert(status);      
  if (status == "success") {
  	setTimeout("ModalDoneFunction()",300);
  	return;
  	}
  if (status == "error") {
    var msg = "Sorry but there was an error: ";    
    $("#Result").html(msg + xhr.status + " " + xhr.statusText+" " + response);
  }
}

function SubmitChangesModal(by) {
  $.ajaxSetup({ cache: false });
  
  var ss="Submit?"+ThisPageRef +"&"+by+"&"+chg;
  //alert(ss);      
  $('#basic-modal-content').modal();
  $("#Result").load(ss ,ModalReply );
}

function NavReply(response, status, xhr) {
//alert(status);      
  if (status == "success") {
  	//setTimeout("ModalDoneFunction()",300);
  	parent.location="Page?X="+ThisPageRef +"-"+timedSubmitFunction_By;
  	return;
  	}
  if (status == "error") {
    var msg = "Sorry but there was an error saving your changes: ";    
    $("#Result").html(msg + xhr.status + " " + xhr.statusText+" " + response);
  }
}


function NavSubmit(by) {
  //alert(by);      
  if (deltacount>0)
    {
    timedSubmitFunction_By=by;	
    //show box prompting for save	
    $.ajaxSetup({ cache: false });  
    var ss="Submit?"+ThisPageRef +"&Save&"+chg;
    //alert(ss);      
    $('#basic-modal-content').modal();
    $("#Result").load(ss ,NavReply );
    }
    else
  parent.window.location.href="Page?X="+ThisPageRef +"-"+by;
  /*parent.window.location.href="../dcs.exe/Page?X="+ThisPageRef +"-"+by;*/
}




function SubmitOkModal(by) {
showModal(
        "Submit?"
        +ThisPageRef +"&"+by+"&"+chg
         );
window.close();
}

function SubmitCancel(by) {
window.close();
}


function FindCell(e)
{
	var el;	
    if (!e) e = window.event;
  
    if (e.target) el = e.target;
    else if (e.srcElement) el = e.srcElement;
	else el = e;
  
    var valu=e.target.value;
    var typ=e.type;
    //console.log("FindCell:",e,el,e.target.value);
 
      
    var Parent=el;
    var row=-1;
    var cel=-1;
    var dir=0;
    var cid_id=-1;
    //console.log("Parent ",Parent.tagName,Parent);

    //this currently only looks for txy , but we may have other containers such as div or other text, we here we dont have xy but just x
    while (Parent.tagName!="BODY" && cid_id==-1) 
      {
      if (Parent.attributes.cid !== undefined)
          {
          cid_id=Parent.attributes.cid;
          break;
          }
      Parent=Parent.parentNode; 
      //console.log("Parent ",Parent.tagName,Parent.attributes.cid,Parent);
      }
      
    var o = {typ:typ,cid:cid_id.value,valu:valu,el:el};  
    //console.log("client-typ-container-pk-f-v",typ,cid_id,String(pkf),valu,o);  
    return o;
}

function zxd_checkbox(Cell,el) {
    
    var Parent=el;
    var val;
    //console.log("zxd_checkbox ",el);    
    while (Parent.tagName!="BODY") 
      {
      val=Parent.getAttribute("data-qqpickvalue");
      if ( val!=null)  break;      
      Parent=Parent.parentNode; 
      }
    //console.log("zxd_checkbox a:",el,val);      
    // add or remove the changed value  
    var items = val.split(",");
    if (val=="") items = [];
    var indx=items.indexOf(Cell.valu);
    
    //console.log("zxd_checkbox d:",Cell.valu,indx,items);
    
    if (el.checked)
        { if (indx<0) items.push(Cell.valu); }
    else
        {//removing
        if (indx>=0) 
            { items.splice(indx,1);}
        }        
   Cell.valu=items.join(",");
   Parent.setAttribute("data-qqpickvalue",Cell.valu);   
   //console.log("zxd_checkbox z:",Cell);      
}

function stripQ(val) { 
    if (val===undefined) return "";
	if ((val.substring(0,2)=='\\"')&&(val.slice(-2)=='\\"')) return val.slice(2,-2); 
    if ((val.substring(0,1)=='"')&&(val.slice(-1)=='"')) return val.slice(1,-1); 
     return val;	
}

function truish(input) { 
 var val=stripQ(input);
 console.log("truish :",input,val,val.substring(0,1));
 return (val!==undefined)&&(val!=0)&&(val!='')&&(val.substr(0,1).toLowerCase()!='n')&&(val.substr(0,1).toLowerCase()!='f')&&(val!='0');
}


function zxdelta_increment() { 
deltacount=deltacount+1;
$('#deltacounter1').text(deltacount);
$('#deltacounter2').text(deltacount);
}
function check_validity(Cell,el) {
	  var isValid = el.checkValidity();
	  var isValid2 = new RegExp(el.getAttribute("data-pattern2")).test(Cell.valu);
	  
      //console.log("change test:",el.pattern);   
	  //console.log("change valu:",Cell.valu);   
	  //console.log("res:",res,' isValid:',isValid);   
	  //console.log("change test:",el.parentNode);   
	  //el.parentNode.getElementsByClassName('validationhidden').className = 'validationshown';

	  console.log(' isValid:',isValid,' isValid2:',isValid2);   
/* not used yet
	  if (isValid || isValid2) {
		  let elementlist = el.parentNode.getElementsByClassName('validationshown');
		  while (elementlist && elementlist.length) elementlist[0].className = 'validationhidden';		  		  
		  console.log(' returning isValid || isValid2 ');
	  } else {
		  let elementlist = el.parentNode.getElementsByClassName('validationhidden');
		  while (elementlist && elementlist.length) elementlist[0].className = 'validationshown';		  		  
		  console.log(' returning');   
		  return;
	  }	
*/
}
function zxf(e) {	
	let Cell=FindCell(e); //get a new object for the element
	check_validity(Cell,Cell.el);	
	var r=Cell.el.dataset.touched;
	console.log("zxf(el) :",r); 
	Cell.el.dataset.touched = 1;
	
}
function zxd(e,pkf,pko) { //delta
var r;

  if (pko!==undefined) pkf=String(+pkf + (+pko));
  var Cell=FindCell(e); //get a new object for the element
  Cell.pkf = pkf;
  var el=Cell.el;
  delete Cell.el;
  //console.log("zxd :",Cell,el);  
  console.log("zxd Cell:",Cell);  
  console.log("zxd el:",el); 
  console.log("zxd el.pattern:",el.pattern);
  console.log("zxd el.data-pattern2:",el.getAttribute("data-pattern2"));
  console.log("zxd el.min:",el.min);
  if (Cell.typ=="change")  {
	  check_validity(Cell,el);
  }
  
  if (el.type=="checkbox")  zxd_checkbox(Cell,el); //returns updates in Cell
  zx_delta(Cell);
  zxdelta_increment();

 var autosave=$( el ).attr("data-autosave");
 var save=truish(autosave);
 console.log("zxd autosave :",autosave,' saveing:',save);  
 if (autosave=="push") {
         //alert("pushing data");
         var savecell={typ:"click",cid:Cell.cid,pkf:"-1"};
         zx_delta(savecell);
         return false;
     } else if (save)
     {
     var savecell={typ:"click",cid:Cell.cid,pkf:"0"};
     //console.log("autosave:",savecell);
     zx_delta(savecell);
     return false;
     }
   
return;
}


function zxnav(e,pkf,pko) {
  //alert(pkf+pko);   
  e.stopPropagation();  
  if (pko!==undefined) pkf=String(+pkf + (+pko));
  var Cell=FindCell(e);
  Cell.pkf = pkf;
  delete Cell.el;
  console.log("zxnav:",Cell);
  zx_delta(Cell);
  return false;

}



function deltaR(ref,val) {
delta(ref,val);
refresh =true;
}
function tick(ref,val) {
if (val.checked) val.value="ON";
else             val.value="OFF";
delta(ref,val);
}

function BubbleSort(Table,fromrow,oncol,dir) {
    var count=0;
    var more=1;
    
    
    
    while (more)
    {
    more=false;
    for (i=fromrow; i < Table.rows.length-1; i++) 
      {
      var compare;
      var val1;
      var val2;
      
      if (Table.rows(i).cells(oncol).pwsort==null)
        {
        val1=Table.rows(i).cells(oncol).innerText;
        }else val1 = Table.rows(i).cells(oncol).pwsort;
        
      if (Table.rows(i+1).cells(oncol).pwsort==null)
        {        
        val2=Table.rows(i+1).cells(oncol).innerText;
        }else val2 = Table.rows(i+1).cells(oncol).pwsort;
      
      
      if (dir==0)
            compare = (val1	> val2);
	  else  compare = (val2 > val1);
						
	  if (compare)	 
	    {//swap
	    more=true;
	    
	    for (j=0; j < Table.rows(i).cells.length; j++) 
            {
            var cella;
            cella=Table.rows(i+1).cells(j).innerHTML;
            Table.rows(i+1).cells(j).innerHTML = Table.rows(i).cells(j).innerHTML;
            Table.rows(i).cells(j).innerHTML = cella;
            if (Table.rows(i).cells(j).pwsort!=null)
                {
                cella = Table.rows(i+1).cells(j).pwsort;
                Table.rows(i+1).cells(j).pwsort = Table.rows(i).cells(j).pwsort;
                Table.rows(i).cells(j).pwsort = cella;
                }
            }   
	   }
     
      }
    }   
}     


function ColomSort()
{
var Parent=this.event.srcElement;
var row=0;
var cel=0;
var dir=0;
while (Parent.tagName!="TBODY") 
  {
  if ((Parent.tagName=="TD")||(Parent.tagName=="TH")) cel=Parent.cellIndex;
  if (Parent.tagName=="TR") row=Parent.rowIndex; 
  if (Parent.tagName=="IMG")
    {
    if (Parent.outerHTML.indexOf("own")!=-1) dir=1;
    }
  Parent=Parent.parentNode; 
  }
BubbleSort(Parent,row+1,cel,dir);
}


function FillList(e,SelListName)
{
  if (!e) e = window.event;  
  if (e.target) el = e.target;
  else if (e.srcElement) el = e.srcElement;
  
  var valu=e.target.value;
  var typ=e.type;
//  console.log("FillList:",e,el,e.target.value);

  var Cell=FindCell(e);
  Cell.pkf = 0;
  //console.log("FillList Cell:",Cell);    
  
  //console.log("SelList info:",SelListName,Cell.cid,qq_stache);
  //console.log("SelList:",qq_stache[Cell.cid][SelListName]);
  var SelList = qq_stache[Cell.cid][SelListName];
 // console.log("SelList:",SelList.length,SelList);

  
  var toSel = el;//document.getElementById(toName);
  if (toSel.length>1) return; //cant handle multi select yet
  var sidx=toSel.selectedIndex;  
  
  if (sidx===undefined) return;
  
  var cval=toSel.options[sidx].value;
  var ctxt=toSel.options[sidx].text;
  

  toSel.options.length=0 
  for (var k in SelList){
    if (SelList.hasOwnProperty(k)) {        
  //       alert("Key is " + k + ", value is" + SelList[k]);
        var SelVal = k;
        var SelTxt = SelList[k];
        if (SelTxt.substring(1,8)!="fblank:")
        {
            var newOpt = new Option(SelTxt,SelVal);
            toSel.options[toSel.length] = newOpt;
            //console.log("new Option:",SelTxt,SelVal,toSel.options[toSel.length-1]);
        }  
         
    }
    }
    
//console.log("FillList res-set Option:",cval);  
  var FromLength = toSel.length-1; 
  for(var i=0;i<=FromLength; i++)
    {
//    console.log("FillList compare:",i,toSel.options[i].value,cval);  
       if (toSel.options[i].value==cval)
         {
//         console.log("FillList res-set selectedIndex:",i);  
         toSel.selectedIndex=i;
         break;
         }
    }
}

function alt_FillList(e,SelListName) //depricate
{ //alternative method that does not remove the place holder
  if (!e) e = window.event;
  
  if (e.target) el = e.target;
  else if (e.srcElement) el = e.srcElement;
  
  var valu=e.target.value;
  var typ=e.type;
//  console.log("FillList:",e,el,e.target.value);
  

  var Cell=FindCell(e);
  Cell.pkf = 0;  
  //console.log("FillList Cell:",Cell);    
  
  //console.log("SelList info:",SelListName,Cell.cid,qq_stache);
  //console.log("SelList:",qq_stache[Cell.cid][SelListName]);
  SelList = qq_stache[Cell.cid][SelListName];
 // console.log("SelList:",SelList.length,SelList);
  var toSel = el;//document.getElementById(toName);
  if (toSel.length>1) return; //cant handle multi select yet
  var sidx=toSel.selectedIndex;  
  var cval=toSel.options[sidx].value;
  var ctxt=toSel.options[sidx].text;
  
  for (var k in SelList){
    if (SelList.hasOwnProperty(k)) {        
  //       alert("Key is " + k + ", value is" + SelList[k]);
        var SelVal = k;
        var SelTxt = SelList[k];
        if (SelTxt.substring(1,8)!="fblank:")
        {
        if (SelTxt!=ctxt)
          {
            var newOpt = new Option(SelTxt,SelVal);
            toSel.options[toSel.length] = newOpt;
//             console.log("new Option:",SelTxt,SelVal);
          }  
        }  
         
    }
    }
}

//=====================================================experimental>

function ToggleThroughTables(id)
{
//good exapmle http://www.filamentgroup.com/examples/charting_v2/index_2.php
//http://www.ajaxblender.com/amazing-jquery-visualize-plugin-accessible-charts-graphs-from-table-elements-using-html-5-canvas.html

wdth = $('#' + id).width() -90;
hght = (210*wdth)/410;


if ($('#btn' + id).text()=='Change to bar graph') 
  {
    $('#' + id).visualize({type: 'bar', height: hght+'px', width: wdth+'px'});
    $('#' + id).toggle();
    $('#btn' + id).text('Change to line graph');
    return true;
  }


   
if ($('#btn' + id).text()=='Change to line graph')
  {      
  $('.visualize').remove();
  $('#' + id).visualize({type: 'line', height: hght+'px', width: wdth+'px'}); 
 
  $('#btn' + id).text('Change to pie chart');  	 
  return true;    
  }   
   
if ($('#btn' + id).text()=='Change to pie chart')
  {      
  $('.visualize').remove();
  $('#' + id).visualize({type: 'pie', height: hght+'px', width: wdth+'px'}); 
 
  $('#btn' + id).text('Change to table');  	 
  return true;    
  }   
   
if ($('#btn' + id).text()=='Change to table')
  {
    $('#' + id).next().toggle();
    $('#' + id).toggle();
    $('.visualize').remove();
    $('#btn' + id).text('Change to bar graph'); 
    return true;    
  }	    
    

 
/*  */
 

 /*$('#$tid$').next().addClass('ElementHide');
 $('#$tid$').removeClass('ElementHide'); */
 return true;


}

//----------------------------------------------
var HexConverter = {
	hexDigits : '0123456789ABCDEF',

	dec2hex : function( dec )
	{ 
		return( this.hexDigits[ dec >> 4 ] + this.hexDigits[ dec & 15 ] ); 
	},

	hex2dec : function( hex )
	{ 
		return( parseInt( hex, 16 ) ) 
	}
}


//https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest/Sending_and_Receiving_Binary_Data
function load_binary_resource(url) {
  var req = new XMLHttpRequest();
  req.open('GET', url, false);
  //XHR binary charset opt by Marcus Granado 2006 [http://mgran.blogspot.com]
  req.overrideMimeType('text\/plain; charset=x-user-defined');
  req.send(null);
  if (req.status != 200) return '';
  return req.responseText;
}


function capture_enter() {	
//http://stackoverflow.com/a/27545387/1500195
// Map [Enter] key to work like the [Tab] key
// Daniel P. Clark 2014

// Catch the keydown for the entire document
$(document).keydown(function(e) {

  // Set self as the current item in focus
  var self = $(':focus'),
      // Set the form by the current item in focus
      form = self.parents('form:eq(0)'),
      focusable;

  // Array of Indexable/Tab-able items
  focusable = form.find('input,a,select,button,textarea,div[contenteditable=true]').filter(':visible');

  function enterKey(){
	//alert('pressed'+String(e));   
    if ((e.keyCode === 81 ) && e.ctrlKey === true ) //ctrl-q
       {
        //alert('pressed 81 - ctrl-q'); 
        zx_switch_key();
       }
      // alert('pressed'+String(e));    
    
    if (e.which === 13 && !self.is('textarea,div[contenteditable=true]')) { // [Enter] key

      // If not a regular hyperlink/button/textarea
      if ($.inArray(self, focusable) && (!self.is('a,button'))){
        // Then prevent the default [Enter] key behaviour from submitting the form
        e.preventDefault();
      } // Otherwise follow the link/button as by design, or put new line in textarea

      // Focus on the next item (either previous or next depending on shift)
      focusable.eq(focusable.index(self) + (e.shiftKey ? -1 : 1)).focus();

      return false;
    }
  }
  // We need to capture the [Shift] key and check the [Enter] key either way.
  if (e.shiftKey) { enterKey() } else { enterKey() }
});
}

//eof
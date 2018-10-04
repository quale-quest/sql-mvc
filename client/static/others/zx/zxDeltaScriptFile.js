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
var deltawipcount=0;




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



function FindCell(e,level)
{
	var el;	
    if (!e) e = window.event;
  
    if (e.target) el = e.target;
    else if (e.srcElement) el = e.srcElement;
	else el = e;  
    var valu='';
	if (e.value) valu=e.value;
	if (e.target) if (e.target.value) valu=e.target.value;
    var typ=e.type;	

	var els = el.id.match( /(.+)-(.+)-(.+)/ )||[];
	//console.log("FindCell els:",els);
	//console.trace("FindCell els:");
    var pki = els[2]||'';
	var pkt = pki.slice(-100,-7);	
	var pko = els[3]||'';
	var pkio = +pki + +pko;
	var pki = pki.slice(-7);	
    var Parent=el;
    var row=-1;
    var cel=-1;
    var dir=0;
    var cid_id=-1;
    //console.log("Parent ",Parent.tagName,Parent);

    //this currently only looks for txy , but we may have other containers such as div or other text, we here we dont have xy but just x
	level=+(level||'0');
	//console.log("FindCell req:",level);
    while (Parent.tagName!="BODY") // && cid_id==-1) 
        {
		//console.log("FindCell tagName:",{level:level,tagName:Parent.tagName,cid:Parent.attributes.cid});
        if (Parent.attributes.cid !== undefined)
          {			
			cid_id=Parent.attributes.cid.value;
		    //console.log("FindCell :",{level:level,cid_id:cid_id});
			level--;
			
			if (level<0) {				
				break;
			}
          }
      Parent=Parent.parentNode; 
      //console.log("Parent ",Parent.tagName,Parent.attributes.cid,Parent);
      }
	//console.log("qq_static_stash:",qq_static_stash);	
    var o = {typ:typ,cid:cid_id,valu:valu,el:el,pk:{t:pkt,i:pki,f:pko,tif:pkio}};  
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
	if (typeof val === 'number') return val;
	if ((val.substring(0,2)=='\\"')&&(val.slice(-2)=='\\"')) return val.slice(2,-2); 
    if ((val.substring(0,1)=='"')&&(val.slice(-1)=='"')) return val.slice(1,-1); 
     return val;	
}

function truish(input) { 
 //console.log("truish a:",input);
 if (typeof input === 'number') return input;
 var val=stripQ(input);
 //console.log("truish :",input,val,val.substring(0,1));
 return (val!==undefined)&&(val!=0)&&(val!='')&&(val.substr(0,1).toLowerCase()!='n')&&(val.substr(0,1).toLowerCase()!='f')&&(val!='0');
}


function zxdeltawip(ok) { 
deltawipcount=ok?1:0;
$('#deltacounter1').text(deltacount+deltawipcount);
$('#deltacounter2').text(deltacount+deltawipcount);
}

function zxdelta_increment() { 
deltacount=deltacount+1;
deltawipcount=0;
$('#deltacounter1').text(deltacount+deltawipcount);
$('#deltacounter2').text(deltacount+deltawipcount);
}



function math_eval(str,unit) {
	var r=0.0;
	var u,un;
	try {
		//console.log('\r\n\r\n\r\n\r\ncoder a:', [str,unit]  );
		//un = math.unit(str);
		//console.log('coder un:', un  );
		
		u = math.eval(str);
		if ( typeof(u) == 'number') {
			//console.log('coder number:', typeof(u)  );
			if (unit=="") return {val:u,display:u,error:''};
			
			return {val:u,display:u+unit,error:''};
			
		} else {
			//console.log('coder u:', u  );
			try {
				r = math.number(u, unit);
				//console.log('coder typeof:', typeof(r)  );
				return {val:r,display:u.toString(),error:''};
			} catch (err) { //expecting : Units do not match
				//console.log('coder unit err:', err.message  );
				//console.log('coder catch:',u.units[0].unit.name  );

				try {
						r = math.number(u, u.units[0].unit.name );
						return {val:r,display:str,error:err.message};
						
					} catch (errx) { //expecting : Units do not match
						//console.log('coder catch2:',errx  );		
					}			
			}
		}
		

		//console.log('coder b:', r  );
	} catch (err) { //cannot do basic eval - expecting  'Undefined symbol z'
		//https://stackoverflow.com/questions/1183903/regex-using-javascript-to-return-just-numbers
		var NUMERIC_REGEXP = /[-]{0,1}[\d]*[\.]{0,1}[\d]+/g;
		var arr=str.match(NUMERIC_REGEXP)||['0'];
		var num = arr[0];
		//console.log('coder NUMERIC_REGEXP:',arr,+num  );	

		return {val:+num ,display:str,error:err.message};
	}

	return {val:0 ,display:str,error:'unknown error'};
}

function Get_Validation(pk){
	//pk.parm = {};
	pk.validators =[];	
	pk.table_validators =[];	
	if (qq_static_stash) {
		//console.log("qq_static_stash      :",qq_static_stash   );		
		var table_pointer = qq_static_stash.TablesIndex['t'+pk.t];
		//console.log("qq_static_stash table:",pk.f,table_pointer   );		
		if (table_pointer) {
			//console.log("qq_static_stash field:",qq_static_stash.TablesIndex['t'+pk.t][pk.f]   );
			//console.log("qq_static_stash validator:",pk.f,table_pointer['validator']   );		
			if (table_pointer['validator']) {
				pk.table_validators  = table_pointer['validator']||[];
			}

			if (table_pointer[pk.f]) {
				pk.validators = table_pointer[pk.f].validator;
			}
		}
	}
}

function check_math(validator_math,Cell,pk,validator_rec){			
	//console.log("check_math Cell.valu :",Cell.valu);
	if (typeof math_scope === "undefined")	{
		//console.log("check_validator create new math_scope :");
		math_scope={}; //global
		math_scope.debug   = function (s) {console.log("math_scope debug:",s); return s;}				
		math_scope.length = function (s) {if (!s) return 0; return s.toString().length;}
		math_scope.eval   = function (s) {return math.eval(s ,math_scope);}				
		math_scope.input  = function () {return math_scope.Cell_valu;}
		
		math_scope.p      = function (par) {/*console.log("math_scope p:",math_scope.validator_rec[+par]);*/ return math_scope.validator_rec[+par];}
		
		math_scope.x      = function () {//console.log("math_scope x:",[math_scope.data['t'+math_scope.pk.t][+math_scope.pk.i][+math_scope.pk.f+1],math_scope.pk]);
										 return math_scope.data['t'+math_scope.pk.t][+math_scope.pk.i][+math_scope.pk.f+1];
										}
																													 
		math_scope.f      = function (fld) {return math_scope.data['t'+math_scope.pk.t][+math_scope.pk.i][+fld];}
		math_scope.fr     = function (fld,rec) {return math_scope.data['t'+math_scope.pk.t][+math_scope.pk.i + +rec][+fld];}
		
		math_scope.frt    = function (fld,rec,tbl) {return math_scope.data['t'+tbl][+rec][+fld];}
		math_scope.sum    = function (fld,tbl) {var sum=0;for(var rec=0;rec<math_scope.data['t'+tbl].length;rec++) {sum+= math_scope.data['t'+tbl][+rec][+fld];}return sum;}
		math_scope.count  = function (tbl) {return math_scope.data['t'+tbl].length;}
		//math_scope.call = function (s) {...} //ZZ$Public stored procedure or server side js proc	
		math_scope.cid=-1;
	}
	if (math_scope.cid!=Cell.cid) {
			//console.log("check_validator updated math_scope :");
			math_scope.data	 = qq_stache[Cell.cid];
			math_scope.cid=Cell.cid;					
							
		} else {
			//console.log("check_validator used cached math_scope :");					
	}
	math_scope.validator_rec = validator_rec;
	math_scope.Cell_valu=Cell.valu;	
	math_scope.pk=pk;
	return math.eval(validator_math,math_scope);	
}			

function check_blocking(pk,pk_validators,Cell, level) {
	var r={
		block_at_field : false,
		block_at_form : false,
		AllowUnchanged : false
	};
	//any of the validators may be true
	if (pk_validators) pk_validators.forEach(function(validator_rec) { 
		var validator_name=validator_rec[0];
		var validator  = qq_static_stash.Validators[validator_name];			
		//console.log("check_blocking :",validator_name,validator);
		if (validator) {
            if ((level==0) && 
				 ((validator.block=='inherit')||(validator.block==undefined))
				) 
			{
				let r2 = check_blocking(pk,pk.table_validators,Cell, 1);
				r.block_at_field|=r2.block_at_field;
				r.block_at_form |=r2.block_at_form;
				r.AllowUnchanged |=truish(r2.AllowUnchanged);
			}
			r.block_at_field |=(validator.block=='BlockField');
			r.block_at_form  |=(validator.block=='BlockForm');
			r.AllowUnchanged |=truish(validator.AllowUnchanged);
		}
	});
	return r;
}

function check_validator(validator_name,validator,Cell,pk,validator_rec,block) {
	var res={isValid:null};	
	//console.log("check_validator value :",Cell.valu,' validator: ',validator);
	var general_fail_msg="";
	//console.log("check_validator validator.length :",validator.length);
	//console.log("check_validator value keys:",qq_stache);//.keys());	
	//console.log("check_validator validator.AllowBlank:",validator.AllowBlank);
	res.validator_name = validator_name;
	res.Cell_valu = Cell.valu;
	try {
		res.msg = validator.fails;
		res.helps = validator.helps;
		//console.log("check_validator helps:",res.msg,res.helps);
		if (validator.pattern){
			res.pattern = validator.pattern;
			res.isValid = new RegExp(validator.pattern).test(Cell.valu);
			general_fail_msg = "Must be valid input";
			console.log("check_validity pattern ",Cell.valu," : ",res.isValid); 
		}
		if (validator.match){
			res.match = validator.match;
			let field = check_math(validator.match,Cell,pk,validator_rec);
			//console.log("check_validity match   :",validator.match , field);
			let wth	= qq_stache[Cell.cid][field[0]][+pk.i][field[1]+1];			
			res.isValid = (wth==Cell.valu);
			console.log("check_validity match input ",Cell.valu," == ",wth," : ",res.isValid); 
			general_fail_msg = "Inputs must match" ;
		}		
		if (validator.length){
			res.length = validator.length;
			var low  = +check_math(validator.length[0],Cell,pk,validator_rec);
			var high = +check_math(validator.length[1],Cell,pk,validator_rec);			
			//console.log("check_validity length   :",low , Cell.valu.length , high); 
			res.isValid =   (low <= Cell.valu.length) && (  Cell.valu.length <=high);
			general_fail_msg = "Must be " + low + " to " + high +  "characters long" ;
		}	
		if (validator.range){
			res.range = validator.range;
			var val = math_eval(Cell.valu,validator.uom);
			//console.log("check_validity range   :",+validator.range[0] , val , +validator.range[1]); 
			if (val.error)  {
				res.isValid = false;
				res.msg = val.error;
				return res;
			}
			var frm = math_eval(validator.range[0],validator.uom);
			var upto = math_eval(validator.range[1],validator.uom);
			//console.log("check_validator range xb :",frm,val.val,upto);	console.log("check_validator range xc :",frm.display,upto.display);
			res.isValid =   (frm.val <= val.val) && ( val.val <= upto.val);			
			general_fail_msg = "Must be in range " +frm.display + " to " +upto.display  ;
		}

		if (validator.math){
			res.math = validator.math;
			res.isValid = check_math(validator.math,Cell,pk,validator_rec);
			//console.log("check_validator math.eval :",res);
			//console.log("check_validator res.isValid :",validator.math,'  ',res.isValid);
			//if (!debug)	general_fail_msg = 'must be a valid value';		
		}		

		if (!block.AllowUnchanged) console.log("validator.AllowUnchanged FALSE:",validator_name,block);	
		if (validator.AllowUnchanged||block.AllowUnchanged) {
			res.AllowUnchanged = validator.AllowUnchanged||block.AllowUnchanged;
			//can accept unchanged inputs even if they are invalid
			//if (typeof math_scope === "undefined")	{
				
			//console.log("validator.AllowUnchanged b4:",[Cell.valu,Cell,pk,validator_rec]);				
			let field = check_math("x()",Cell,pk,validator_rec);
			//console.log("validator.AllowUnchanged :",[field,Cell.valu,Cell,pk,validator_rec]);			
			
			if (Cell.valu==field) {
				res.isUnchangedAndAllowedToBeUnchanged = true;
			}
			//console.log("validator.AllowUnchanged after:",res);				
		}

		if (!res.msg && !res.isValid) {
			res.msg = general_fail_msg ;
		}		

	} catch (e) {
		res.isValid = false;
		res.msg = JSON.stringify(e);
		console.log("check_validator catch :",res.msg,e); 
	}
	if (res.isValid==null) res.isValid=false; //was not tested so should not be or'ed to the result
	return res;
}







function check_validity_array(pk,pk_validators,Cell) {
	var r={
		isValid : false,
		isUnchangedOrValid : false,
		msg:"",
		helps:"", 
		Tested:false
	};
	var dbg=[];
	let block = check_blocking(pk,pk_validators,Cell, 0);
	r.block_at_field = block.block_at_field;
	r.block_at_form  = block.block_at_form;
	r.AllowUnchanged = block.AllowUnchanged;
	//console.log("check_validity_array r:",r);
	//console.log("check_blocking ar:",pk_validators,block);
	
	//console.log("check_validity check  :",[Cell.valu]); 
    //console.log("check_validity with   :",pk); 
	//console.log("check_validity pk.validators:",pk_validators); 
	//console.log("check_validity pk.table_validators:",pk.table_validators); 
	
	//any of the validators may be true
	if (pk_validators) pk_validators.forEach(function(validator_rec) { 
		var validator_name=validator_rec[0];
		//console.log("pk validator_name forEach :",validator_name,r.isValid ,r.Tested);
		var validator  = qq_static_stash.Validators[validator_name];			
		//console.log("pk validator_name :",validator_name,validator);
		if (validator) {
			let val_result = check_validator(validator_name,validator,Cell,pk,validator_rec,block);
			//console.log("pk validator_name :",validator_name,validator,r.isValid,val_result.isValid);
			dbg.push(val_result);
			r.isValid |= val_result.isValid;
			r.isUnchangedOrValid |=  val_result.isValid||val_result.isUnchangedAndAllowedToBeUnchanged;
			//console.log("check_validity_array isUnchangedOrValid :",[validator_name,r.isUnchangedOrValid,val_result.isValid,val_result.isUnchangedAndAllowedToBeUnchanged]);
			if (!val_result.isValid) {
				if (val_result.msg) {
					if (r.msg!="") r.msg = r.msg + " or "  ;
					r.msg = r.msg + val_result.msg + " " +val_result.isUnchangedAndAllowedToBeUnchanged;
					}
				
				if (val_result.helps) {
					console.log("pk validator_name helps :",[val_result.helps,r.helps]);
					if (r.helps!="") r.helps = r.helps + " or "  ;
					r.helps = r.helps + val_result.helps;
					}
				
			}			
		}
		r.Tested = true;
	});
	//console.log("pk validator_name xxx :",isValid ,r.Tested);
	if (!r.Tested) {
		r.isValid = true;
		r.isUnchangedOrValid=true;
		}
	//if (r.isValid) r.block_at_field = false;
	console.log("check_validity_array :",dbg,r);//pk_validators
	return r;
}

function hashCode2(str){
	var hash = 0;
	if (str.length == 0) return hash;
	for (i = 0; i < str.length; i++) {
		char = str.charCodeAt(i);		
		hash = ((hash<<5)-hash)+char;		
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

function check_validity(Cell,el,check_only) {
	var pk = Cell.pk;
	Get_Validation(pk);
	//console.log("check_validity check  :",[Cell.valu]); 
	//any of the validators may be true
	var r= check_validity_array(pk,pk.validators,Cell);
	
	if (!check_only) {
		var originalvalue = qq_stache[Cell.cid]['t'+pk.t][+pk.i][+pk.f+1];
		if (originalvalue== Cell.valu) zxdeltawip(false); else zxdeltawip(r.isValid);

		if (r.helps) r.msg = r.msg + " [...Help]"	
		if (r.helps=="") r.helps = r.msg;
		let s1 = '$("#container-n").notify("create", "sticky",{ title:"Help:",text:"'+r.helps+'"},{ })';
		let innerHTML = "<span onclick='"+s1+"'>"+r.msg+'</span>';
		let hideshow = r.isValid?'validationhidden':'validationshown';
		let hash=hashCode2(hideshow + innerHTML);

		let validations  = el.parentNode.getElementsByClassName('validationshown');
		if (!(validations && validations.length)) validations = el.parentNode.getElementsByClassName('validationhidden');

		if (validations && validations.length) {
			if (validations[0].getAttribute('data-err-hash') != hash) {
				validations[0].setAttribute('data-err-hash',hash);
				validations[0].innerHTML =innerHTML;
				validations[0].className = hideshow; //must be set last as it is a live list			
				}
		}
	}
	
	//
	return r;
}

var button_delay_timeout = null;
const button_delay = function (e) {
	//console.log('button_delay :', e);
	clearTimeout(button_delay_timeout);
	button_delay_timeout = setTimeout(function () {        
		let Cell=FindCell(e);
		//console.log('button_delay done:', Cell.valu);
		check_validity(Cell,Cell.el,false);
		if (r.isValid) hold_focus_at = null;  //global 
    }, 700);
	
}


function zxf(e) {
/*	
	let Cell=FindCell(e); //get a new object for the element
	check_validity(Cell,Cell.el,false);	
	var r=Cell.el.dataset.touched;
	var el=Cell.el;
	delete Cell.el;
	el.onkeyup =  button_delay;	
*/	
}
var hold_focus_at = null;
function zxd(e,pkf,pko) { //delta
var r;
  //console.log("zxd start:"); 
  
  var isValid = true;
  if (pko!==undefined) pkf=String(+pkf + (+pko));
  var Cell=FindCell(e); //get a new object for the element
  Cell.pkf = pkf;
  var pk=Cell.pk;
  var el=Cell.el;
  delete Cell.el;
  //console.log("zxd :",Cell,el);  
  console.log("zxd Cell:",Cell);  
  console.log("zxd el:",el); 
  //console.log("zxd pk:",pk); 
  //console.log("zxd el.pattern:",el.pattern);
  //console.log("zxd el.data-pattern2:",el.getAttribute("data-pattern2"));
  //console.log("zxd el.min:",el.min);
  
  if (el.type=="checkbox")  zxd_checkbox(Cell,el); //returns updates in Cell
  var originalvalue = qq_stache[Cell.cid]['t'+pk.t][+pk.i][+pk.f+1];
  if (originalvalue== Cell.valu) {
      zxdeltawip(false);
	  console.log("zxd unchanged:");	
	  return;
  }
  if (Cell.typ=="change")  {
	  resValid = check_validity(Cell,el,false);  
	  if (resValid.block_at_field) 
	  {
		  if (!resValid.isValid) {
			console.log("zxd keeping in focus:");
			hold_focus_at = el;
			el.focus();
			return;
		  }
		  else
			hold_focus_at = null;
	  } 
	  //console.log("zxd making changes:");		
  
	  qq_stache[Cell.cid]['t'+pk.t][+pk.i][+pk.f+1] = Cell.valu;
	  zx_delta(Cell);
	  zxdelta_increment();

	  if (resValid.isValid) {
		var autosave=$( el ).attr("data-autosave");
		var save=truish(autosave);
		console.log("zxd autosave :",autosave,' saveing:',save);  
		if (autosave=="push") {
				//alert("pushing data");
				var savecell={typ:"click",cid:Cell.cid,pkf:"-1"};
				zx_delta(savecell);
				return false;
			} else if (save) {
			    var savecell={typ:"click",cid:Cell.cid,pkf:"0"};
			    //console.log("autosave:",savecell);
			    zx_delta(savecell);
			    return false;
			}
	    }
  }
return;
}


function zxsave(e,pkf,pko,level) {
  if (pko!==undefined) pkf=String(+pkf + (+pko));
  var Cell=FindCell(e,level); //zxsave
  Cell.pkf = pkf;
  delete Cell.el;
  console.log("zxsave:",Cell);
  zx_delta(Cell);
  return false;
}

function validate_form(check_only) {
	var r={
		isValid : true,
		block_at_form : false,
		isUnchangedOrValid : true
	}
	
	var validator_ele = document.getElementsByClassName('validator');
	for (var i = 0; i < validator_ele.length; ++i) {
		var ve = validator_ele[i];
		let Cell=FindCell(ve);//zxnav
		var pk=Cell.pk;
		var el=Cell.el;
		var resValid = check_validity(Cell,el,check_only);  
		console.log("zxnav[i] result:",ve.title,resValid,r.isValid,r.isUnchangedOrValid);
		r.isValid &= resValid.isValid;
		r.isUnchangedOrValid &= resValid.isUnchangedOrValid;
		r.block_at_form |= resValid.block_at_form;		
	}		
	return r;
}

function zxnav(e,pkf,pko,level) {
	if (e.stopPropagation) e.stopPropagation();  
	
	if (hold_focus_at) {
	    if (!confirm("You cannot save a invalid field!,\n save the other valid fields and continue ?")) {
			return;
		}
	}

	var r = validate_form(true);
	if (r.block_at_form && !r.isUnchangedOrValid) {
		validate_form(false);
		$("#container-n").notify("create", "sticky",{ title:"Warn:",text:"You must fix the errors before you can save!"},{ });
		return;
	}

    
	zxsave(e,pkf,pko,level);
}

function zxmodalclose() {
	//closes the popup, saves changes and reloads parent
	var e = window.event;	
    console.log('zxmodalclose on e ' + e.target);	
	e.preventDefault();
	$(".simplemodal-close").trigger("click");
	$("#MainSaveButton").trigger("click");
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
  //console.log("SelList:",qq_stache[Cell.cid]);
  if (!qq_stache[Cell.cid]) { //dropdown list not available on first page render
	  //console.log("SelList:",qq_stache);
	  console.log("Error missing qq_stache[Cell.cid] for:",Cell.cid);
	  //console.log("Error missing qq_stache[Cell.cid] for:",SelListName);
	  return;
  }
  var SelList = qq_stache[Cell.cid][SelListName];
 // console.log("SelList:",SelList.length,SelList);

  
  var toSel = el;//document.getElementById(toName);
  if (toSel.length>1) return; //cant handle multi select yet
  if (!SelList) return; //missing List in stache
  
  var sidx=toSel.selectedIndex;  
  //console.log("SelList sidx:",sidx,SelList.length,SelList);
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

console.log("zxDeltaScriptFile version V154"); 

//eof


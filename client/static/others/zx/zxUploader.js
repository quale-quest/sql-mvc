
//http://stackoverflow.com/questions/8006715/drag-drop-files-into-standard-html-file-input
//   this last post  has an example of showing a preview in the page 


var last_message='';

function ajaxComplete () {
  //document.getElementById('cancelbutton').style.display = "none";
  document.getElementById('submitbutton').style.display = "none";
  if (last_message=="Server Complete")
    {
      //log_message("Complete"); 
      document.getElementById('UploadProgressIndicator').value=document.getElementById('UploadProgressIndicator').max;
  //NavSubmit(0);
      //.....what to do.... 
      //TODO sql-mvc we dont want to relogin....but we want to nav some where....
    //  setTimeout(function(){window.location.reload();}, 2000);
      
    }   
    else
    {
      log_message("Failed");       
      alert("Upload failed - please check the progress box for possible reasons");//OSXWarning($);
    }
}

function doClear()
{
    if (document.getElementById("divProgress")===null) return;
    document.getElementById("divProgress").innerHTML = "";
    document.getElementById('UploadProgressIndicator').value=0;
    //document.getElementById('progbar').value=0;
    //document.getElementById("progtext").innerHTML = '';
    document.getElementById('submitbutton').style.display = "none";
    //document.getElementById('cancelbutton').style.display = "none";
}
 
function log_message(message)
{
    document.getElementById("divProgress").innerHTML += message + '<br />';
}

    
// progress on transfers from the server to the client (downloads)
function updateProgress (oEvent) {
  if (oEvent.lengthComputable) {
    var percentComplete = oEvent.loaded / oEvent.total;
    //log_message("Upload progress" oEvent.loaded + " " + oEvent.total );
    document.getElementById('UploadProgressIndicator').max=oEvent.total ;
    document.getElementById('UploadProgressIndicator').value=oEvent.loaded ;

  } else {
    // Unable to compute progress information since the total size is unknown
    document.getElementById('UploadProgressIndicator').value=document.getElementById('UploadProgressIndicator').value+1;    
    
  }
}

     

function transferComplete(evt) {
  //alert("The transfer is complete.");
  zxdelta_increment();
}

function transferFailed(evt) {
  alert("An error occurred while transferring the file.");
}

function transferCanceled(evt) {
  alert("The transfer has been cancelled by you.");
}


  
function AJAXSubmit (e,pkf,pko) {
  console.log("AJAXSubmit from zxUploader."+pkf+pko);
  
   //alert("AJAXSubmit from zxUploader."+pkf+pko);
  e.stopPropagation();  
  if (pko!==undefined) pkf=String(+pkf + (+pko));
  var Cell=FindCell(e,pkf);    
  var el=Cell.el;
  delete Cell.el;
  console.log("AJAXSubmit from zxUploader.",Cell);

  console.log("zxd :",Cell,el); 
  var form = el.form;
  console.log("form :",form); 
  //alert(form.action);
  
  document.getElementById('cid').value = Cell.cid;   
  document.getElementById('pkf').value = Cell.pkf;
  
  doClear();
  if (!window.XMLHttpRequest) {
        log_message("Your browser does not support XMLHttpRequests.");
        return false;
    }
  
  document.getElementById('submitbutton').style.display = "none";
  //document.getElementById('cancelbutton').style.display = "initial";
     

     
  if (!form.action) { return false; }
  console.log("AJAXSubmit proceed.");
  var oReq = new XMLHttpRequest();  
  var MaxProgress = 0;
  
   function zx_canceling() {
        //detach();
        oReq.abort();
        log_message("User Cancelled"); 
        ajaxComplete();        
    }
  
  //document.getElementById('cancelbutton').addEventListener('click', zx_canceling, false);
  
  oReq.onload = function() { 
         if (last_message!="Server Complete")
            log_message(oReq.responseText); 
         ajaxComplete();
         };
  oReq.onreadystatechange = function(){
        //log_message('onreadystateChanged to '+oReq.readyState);
        try
        {
            if (oReq.readyState > 2)
            {
                var new_response = oReq.responseText.substring(oReq.previous_text_len);
                oReq.previous_text_len = oReq.responseText.length;
                //log_message(oReq.previous_text_len);
                //log_message(new_response);
                var result = JSON.parse( new_response );                        
                if (result.message)
                  log_message(result.message);
                  last_message=result.message;
                  
                if (result.progress)
                  {
                  //log_message(result.progress);                  
                  //document.getElementById("progtext").innerHTML = '(' + result.progress + ' of ' + MaxProgress + ' records)';
                  //document.getElementById('progbar').value = result.progress;   
                  }
                if (result.totalprogress)
                  {
                  document.getElementById('UploadProgressIndicator').value=document.getElementById('UploadProgressIndicator').max;    
                  MaxProgress = result.totalprogress;
                  document.getElementById('progbar').max = result.totalprogress;   
                  
                  }
                  
                  
                
                
            }  
        }
        catch (e)
        {
            //log_message("<b>[XHR] Exception: " + e + "</b>");
        }
  }
  //document.getElementById("progtext").innerHTML = '';
  oReq.upload.addEventListener("progress", updateProgress, false);
  oReq.upload.addEventListener("load", transferComplete, false);
  oReq.upload.addEventListener("error", transferFailed, false);
  oReq.upload.addEventListener("abort", transferCanceled, false);
  
  oReq.previous_text_len = 0;

  if (form.method.toLowerCase() === "post") {
    oReq.open("post", form.action, true);
    oReq.send(new FormData(form));
    log_message("Starting to send the upload....");
  } else {
    var oField, sFieldType, nFile, sSearch = "";
    for (var nItem = 0; nItem < form.elements.length; nItem++) {
      oField = form.elements[nItem];
      if (!oField.hasAttribute("name")) { continue; }
      sFieldType = oField.nodeName.toUpperCase() === "INPUT" ? oField.getAttribute("type").toUpperCase() : "TEXT";
      if (sFieldType === "FILE") {
        for (nFile = 0; nFile < oField.files.length; sSearch += "&" + escape(oField.name) + "=" + escape(oField.files[nFile++].name));
      } else if ((sFieldType !== "RADIO" && sFieldType !== "CHECKBOX") || oField.checked) {
        sSearch += "&" + escape(oField.name) + "=" + escape(oField.value);
      }
    }
    oReq.open("get", form.action.replace(/(?:\?.*)?$/, sSearch.replace(/^&/, "?")), true);
    oReq.send(null);
  }
}

function eventFire(el, etype){
  if (el.fireEvent) {
   (el.fireEvent('on' + etype));
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}
function FileSelectHandler(e) {
    doClear();
    //document.getElementById('submitbutton').style.display = "initial";
    
    document.getElementById('upload_hide').style.display = "block";
    eventFire(document.getElementById('submitbutton'),'click');
    //$('#submitbutton').on('click');
    //var el = document.getElementById('submitbutton');
    //(el.onclick || el.click || function() {})();
    
    
    //alert("file selected");
    
}



//usage

function zxUploaderInit() {
    

//alert("zxUploaderInit1 ");   
if (document.getElementById("fileselect")===null) return;
//alert("zxUploaderInit2 ");
log_message("zxUploaderInit");
//alert("zxUploaderInit3 ");
doClear();
//document.getElementById('dbid').value = dbid;   
//alert("zxUploaderInit ");    

document.getElementById('fileselect').addEventListener("change", function() {FileSelectHandler(this.value)}, false);
//document.getElementById('file_upload_ref').value=BatchRef ;
}


//eof
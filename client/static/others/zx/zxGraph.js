function SeriesXML( func, from,skip,step,last,series,tags,TagCount,seriesattribute,vline,seriesind  ){
                         
                         
                var XML=""; 
                var vlines = parseInt(from[2]);                  

                var i=0;
                var c=0;
                var vlw=0;
                var vlc=0;
                var vlValues="";
                var cnt=0;
                for(i=+skip;i<+last; i+=+step)
  		  {  
  		   if (seriesind==1)
  		   {  		  
  		   if (vlw==0)
  		     {
  		        if (vlc>=vlines)
  		          {vlw=9999999;}
  		          else
  		          {  		          				
				vlw        = parseInt(from[3+vlc*2]) - cnt; 
				vlValues   = from[3+vlc*2+1]; 
				vlc++;
//XML = XML + "[  vlw:" +vlw + " " + last + " vl:" +vlValues + "]\n"; 
		          }    		        
    		     }   
    		     
  		   if (vlw==1)
  		       {
  		       XML = XML + "<vLine "+vlValues+" />\n";
  		       }
  		   vlw--;    
  		   }  
//XML = XML + "  <" + func + vlw +"w c" +vlc + " "+tags+" " ;
  		   XML = XML + "  <" + func + " " ;
                   for(c=0;c<TagCount; c+=1)
     		      {
     		      	var Attribs=tags[c].split("=");
     		      	var At=parseInt(Attribs[1]);
  		        var Tag = tags[c];
  		        if (Tag!="")
  		          {
  		             var indx = (+i)+(+At);
  		             var Valx = ""; //indx + " # " + skip + " " + i +" x " +  step+ " : lst " + last + " tc="+ TagCount +" +"+c ;//from[skip + i * step +c];
  		             var Val = from[indx]+Valx;
  		    	     XML = XML + Attribs[0] + "='" + Val + "' ";
  		    	  }
  		       }
  		   XML = XML + " " + seriesattribute + " />\n";
                   cnt++;
		  }  		
//XML = XML + "[ vli:" + i + "  " + skip + " " + step +" ]"; 
		return XML;      
}



function datasetXML( from,skip,step,last,series,vline  ){
  var SeriesTxt  = from[series];
  var index      = skip;
  var XML 	 = "";
  
  var p = SeriesTxt.indexOf(",");  
  var SeriesName   = SeriesTxt.substr(0,p); 
  var SeriesValues = SeriesTxt.substr(p+1); 
  var SeriesArray  = SeriesValues.split(",");
  var SeriesCount  = SeriesArray.length ;

  
 //document.write("xx2 " + SeriesValues + " | " + SeriesCount+ " | " + SeriesArray);                  		     
  //XML = XML + "%"; 
    
  if ((SeriesName=="label")&&(SeriesTxt.indexOf("value")<0))          
      {//this is a multi series label
      XML = XML + "\n\n<categories " + from[+series+1] + ">\n" + SeriesXML("category", from,index,step,last,SeriesValues,SeriesArray,SeriesCount,from[+series+2],vline,1) + "</categories>\n";    
      }
    else
      {  
      if (SeriesName=="label")
        {//this is a single series label and data
        XML = XML + SeriesXML("set", from,index,step,last,SeriesValues,SeriesArray,SeriesCount,from[+series+2],vline,1) + "\n";     
        }
      else
        { // multi series dataset
        SeriesName = "seriesName='" + SeriesName + "' "+ from[+series+1];
        XML = XML + "\n\n<dataset " + SeriesName + " >\n" + SeriesXML("set", from,index,step,last,SeriesValues,SeriesArray,SeriesCount,from[+series+2],vline,0) + "</dataset>\n";    
        }  
      }  
  //XML = XML + "$";     
return XML;
}
      
      



function graphXML( from  ){
      
      var XML =    "";
      var vlines = parseInt(from[2]);                  
      
      var SeriesAt= 3+ vlines*2 ;	
      var series  = parseInt(from[SeriesAt]);      
      
      var DataAt  = 1 + 3 + (+vlines*2) + 3*series ;	
      var step    = parseInt(from[DataAt]);
      
      var last    = from.length-1;      
      var trends  = +last - parseInt(from[last]);
      
      var FromLength = from.length-1;
//XML = XML + "[vl:" + vlines + " seriesAt:" + SeriesAt + " series:" + series +" dataAt:" + DataAt+" step:" + step + "]";
      XML = XML + "\n\n<chart " + from[1] + ">";
      var i=0;
      for(i=0;i<series; i++)
  	{
//	document.write("ppp " + series + " | " + step+ " | =" + " | " + last);                  		 
  	XML = XML +  datasetXML( from,+DataAt +1,step,trends,+SeriesAt+1+3*i,vlines,i ) ;
  	}
//trendlines  	
//      for(i=0;i<from[trends]; i++)
//  	{
//  	trends+1
//  	XML = XML + datasetXML( from,4+series,step,last,3+i );
//  	}
  	XML = XML + "</chart>\n\n";
  	//XML = XML.replace("<", "[");
  	//XML = XML.replace(">", "]");
  	//XML = escape(XML);
  	
  	//DML = XML.replace(/</gi, "	&lt;");  	
  	//document.write("<pre>" + DML.replace(/>/gi, "&gt;")+ "</pre>");
  	//alert(XML);
     return XML; 
}



 function MakeChart( chartdiv ,from ,type,debug ){
   	document.write("<div class='zxGraph' id=\"" + chartdiv + "\" style='margin-left: auto;margin-right: auto;height:70%;width:90%;center;' >Chart will load here</div>");		   
        var DML =graphXML( from  );
	var chart = new FusionCharts(type, chartdiv +"Id", "100%", "100%", "0", "0");
	chart.setXMLData(DML);
	chart.render(chartdiv);
			   
        if (debug!="0")
          { 			   
            DML = DML.replace(/</gi, "&lt;");  	
  	    document.write("<pre>" + DML.replace(/>/gi, "&gt;")+ "</pre>");		   
  	  }  
  	}


"use strict";
/*jshint node: true */


var program = require('commander');
//var XLSX =  require('xlsx');
var fs = require('fs');
var path = require('path');
var zx = require('../compiler/zx.js');

 var casematched = function (str,ary) {      
    while (1) {
       // console.log('---------------');
    var  i;
    var  first=999999999;
    var  first_fn=-1;
    for(i=0;i<ary.length;i+=3)
    {
        var matched = str.match(ary[i]);
        
        //console.log('input:', matched);
        if (matched) {
            if (matched.index<first) {
                first = matched.index;
                first_fn=i;
                //console.log('found matched at:', first_fn);
            }                
        }
    }    
    
    if (first_fn===-1)  return;
    
    //console.log('final matched at:', first_fn);
    matched = str.match(ary[first_fn]);
    //console.log('input:', matched);
    str=str.substring(matched.index+matched[0].length);
    //console.log('then str:', str);
    
    
    matched = str.match(ary[first_fn+1]);    
    str=str.substring(matched.index+matched[0].length);
    //console.log('then matched:', matched);
    ary[first_fn+2](matched[1],str);
    
     
    
    }
 }
 

 var subfieldname = function (str) { 
     str=str.toUpperCase();
    if (str==='VALUE') str = 'VALU';
    if (str==='MIN') str = 'MINIMUM';
    if (str==='MAX') str = 'MAXIMUM';
    if (str==='YEAR') str = 'YEAR_NUMBER';
    if (str==='TIME') str = 'AT_TIME';
    if (str==='DATE') str = 'AT_DATE';
    
    
    return str;
 }
 
 var rpadx = function (str) { 
    str=subfieldname(str);
     while (str.length < 33)
        str = str + ' ';
    return str
 }
 
//console.log('converter started');
var fileContents = fs.readFileSync('Quale/Standard/Home/Guest/Models/model.rb').toString();
var str=fileContents;

console.log('<#model');

var loops=1;
var mode="root";
var table,field;
var indxi=1;

//while (loops++<4)
    {
    
   
    var tfc=0;    
    casematched(str,
            [/create_table\s+\"/, /(\w+)/, function (par) {
                table = par;   
                console.log('');
                console.log('create table ', table.substring(0,30), '--:{as:"Table"} ');
                console.log('(');
                console.log('      '+rpadx('ID')+'  PK                                 --:{as:pk} ');   
                },
                
                
             /t.datetime\s+\"/, /(\w+)/, function (par) {
                field = par;
                console.log('    ,', rpadx(field) , " TIMESTAMP     default '2000/01/01' --:{as:timestamp}");            
                },
             /t.string\s+\"/, /(\w+)/, function (par) {
                field = par;
                console.log('    ,', rpadx(field) , " VARCHAR(40)   default ''           --:{as:text40}");            
                },                
             /t.float\s+\"/, /(\w+)/, function (par) {
                field = par;
                console.log('    ,', rpadx(field) , ' FLOAT         default 0.0          --:{as:float}');            
                },
             /t.integer\s+\"/, /(\w+)/, function (par) {
                field = par;
                var tn=field.match(/(\w+)_id/);
                if (tn)
                        console.log('    ,', rpadx(field) , " FK            default ''           --:{as:fk,to:"+tn[1]+"s} ");            
                    else 
                        console.log('    ,', rpadx(field) , ' INTEGER       default 0            --:{as:int} ');           
                },                
             /t.text\s+\"/, /(\w+)/, function (par) {
                field = par;
                console.log('    ,', rpadx(field) , " VARCHAR(320)  default ''           --:{as:textbox}  ");            
                },      
             /t.hstore\s+\"/, /(\w+)/, function (par) {
                field = par;
                console.log('    ,', rpadx(field) , " VARCHAR(320)  default ''           --:{as:textbox}  ");            
                },                      
                
             /add_index\s+\"/, /(\w+)/, function (par,str) {
                table = par;
                var flds = str.match(/(\[[\"\w,\s]+\])/);    
                //console.log('    table:',table,' flds:',flds, 'orgstr',str); 
                if (flds)
                    { var flda=flds[0];
                     str=str.substring(flds.index+flds[0].length);
                     var indxm = str.match(/:name\s*=>\s*"(\w+)/);    
                     var indxname=indxm[1];
                     //CREATE INDEX IDX_ME1 ON user_table_name (user_pk_field);
                     var fld_a=eval(flda);
                     var fstr ='',fi;
                     for(fi=0;fi<fld_a.length;fi++) fstr += ','+fld_a[fi];
                     indxname = indxname
                     console.log('CREATE INDEX ',indxname.substring(0,28)+indxi++,' ON ', table.substring(0,30) , '  (',fstr.substring(1),'); ');            
                    }  
                },                       
                
                
                
             /end\s/,, function (par) {
                console.log(');');            
                console.log('~CREATE INDEX ',(table+'_ID').substring(0,28),' ON ', table.substring(0,30) , '  (ID); ');            
                }                   
                
            ]);
        
    
    }
console.log('#>');
//eof

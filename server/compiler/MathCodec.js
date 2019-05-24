
var math = require('mathjs');


var math_eval = function (str,unit) {
	var r=0.0;
	var u,un;
	try {
		console.log('\r\n\r\n\r\n\r\ncoder a:', [str,unit]  );
		//un = math.unit(str);
		//console.log('coder un:', un  );
		
		u = math.eval(str);
		if ( typeof(u) == 'number') {
			console.log('coder number:', typeof(u)  );
			if (unit=="") return {val:u,display:u,error:''};
			
			return {val:u,display:u+unit,error:''};
			
		} else {
			console.log('coder u:', u  );
			try {
				r = math.number(u, unit);
				console.log('coder typeof:', typeof(r)  );
				return {val:r,display:u.toString(),error:''};
			} catch (err) { //expecting : Units do not match
				//console.log('coder unit err:', err.message  );
				console.log('coder catch:',u.units[0].unit.name  );


				try {
						r = math.number(u, u.units[0].unit.name );
						return {val:r,display:str,error:err.message};
						
					} catch (errx) { //expecting : Units do not match
						console.log('coder catch2:',errx  );		
					}			
			}
		}

		//console.log('coder b:', r  );
	} catch (err) { //cannot do basic eval - expecting  'Undefined symbol z'
		//https://stackoverflow.com/questions/1183903/regex-using-javascript-to-return-just-numbers
		var NUMERIC_REGEXP = /[-]{0,1}[\d]*[\.]{0,1}[\d]+/g;
		var arr=str.match(NUMERIC_REGEXP)||['0'];
		var num = arr[0];
		console.log('coder NUMERIC_REGEXP:',arr,+num  );	

		return {val:+num ,display:str,error:err.message};
	}

	return {val:0 ,display:str,error:'unknown error'};
}

var unit_test = function () {

/*
const a = math.unit(45, 'cm')  



console.log('a:',a);
console.log('a:',a.units);


const d = a.to('m')  

console.log('m:',a.to('m').toString()   );
console.log('mm:',a.to('mm').toString()   );
console.log('nm:',a.to('nm').toString()   );


console.log('mm:', math.eval('9s * 100mm/s').to('mm').toString()   );

console.log('mm3:', math.eval('9 * 100m').to('mm').toString()   );


console.log('m:', math.eval('1nm').to('m').toString()   );

console.log('math.number m:', math.number(math.eval('1nm'), 'm')   );
console.log('math.number m:', math.number(math.eval('1'), 'm')   );

console.log('math.number m:',typeof( math.number(math.eval('1nm'), 'm') ) )  ;
*/
console.log('coder returned:', coder('23*1000.1','') );
console.log('coder returned:', coder('5 * 0.01','m'));

/*
console.log('coder returned:', coder('1nm','m'));

console.log('coder returned:', coder('23000*1.00 mile','m'));
console.log('coder returned:', coder('23*1000.1 kg','m'));


console.log('coder returned:', coder('23*1000.1 z','m'));
console.log('coder returned:', coder('z','m'));

//console.log('coder returned:', coder('23*1000.1',''));
*/

console.log(' returned:',math.eval('1<2'));
console.log(' returned:',math.eval('1>2'));
console.log(' returned:',math.eval('(5<=x) and (x<10)',{x:5}));
console.log(' returned:',math.eval('(5<=x) and (x<10)',{x:50}));
let scope = {
	x:50
}


console.log(' returned:',math.eval(['a=fn()','a+1'],scope) );

/*
scope.f = function (fld,rcrd,tbl) {return p;} //lookup field
scope.sum = function (fld,tbl) {...}
scope.ave = function (fld,tbl) {...} 
scope.count = function (fld,tbl) {...}
scope.length = function (s) {return s.length;}
scope.call = function (s) {...} //ZZ$Public stored procedure or server side js proc
scope.math_eval = function (str,uom) {return math_eval(str,uom).val}; //math_eval defined in ...
*/

console.log(' returned:',math.eval(['a=length(fn("555"))','a+1'],scope) );

}

//unit_test();

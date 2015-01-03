


    var cal = new CalendarPopup();
    //cal.showNavigationDropdowns();
	cal.setReturnFunction("zx_cal_ReturnFunction");

function zxCalendar(i) { 
//alert('XXX Use ');
NewCssCal(i,'yyyymmdd','arrow',false);
return false;}

function zxTimeStamp(i) { 
NewCssCal(i,'yyyymmdd','arrow',true);
return false;}



function zx_cal_ReturnFunction(y,m,d) {
if (window.CP_targetInput!=null) {
		var dt = new Date(y,m-1,d,0,0,0);
		if (window.CP_calendarObject!=null) { window.CP_calendarObject.copyMonthNamesToWindow(); }
		window.CP_targetInput.value = formatDate(dt,window.CP_dateFormat);
		window.CP_targetInput.onchange();
		}
	else {
		alert('Use setReturnFunction() to define which function will get the clicked results!'); 
		}
	}




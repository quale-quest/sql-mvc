# UX Aggregate classes

TODO:

UX Aggregate classes or "AggregateFuntions" is a user side concept developed out of validation concepts, but is useful for many UX features.

Like the Rule #1 - it is transparent to the application programmer if the actual implementation sits on the Client or on the server.


Named AggregateFuntions is set either on a model field, or on a table/form field.

On the client side it adds a class to each of the elements produced by the model.

When ever needed, we can refer to that class Named, to perform runtime validation operations.

Example: Customer record with balance, Limit and transaction ItemsValues in a cart


CREATE TABLE CUSTOMER				--:{as:"Table"} 
(
  ...
  BALANCE DECIMAL(12,2),			--:{as:dollar,Aggregate:Balance}  
  LIMIT   DECIMAL(12,2),			--:{as:dollar,Aggregate:Limit}
  ...
);	
CREATE TABLE TRANS_DETAIL				--:{as:"Table"} 
(
  ...
  ITEMS   DECIMAL(12,2),			--:{as:quantity,Aggregate:Items}  
  VAL     DECIMAL(12,2),			--:{as:dollar,Aggregate:values}  
  ...
);	


In custom js code we can use as follows
	Aggregate(NamedAggregate,NamedProperty||'Value',AggregateFuntion||'Sum',ExpresionCallBack);
	NamedProperty : Value,valid,invalid, allvalid, onevalid
	AggregateFuntion : Sum, Min, Max, Ave, first, last, or, and
	ExpresionCallBack(elms):elms is an array of the elements on the same record as the one being iterated.
	
	if ((Aggregate(Balance) + Aggregate(values)) > Aggregate(Limit)) alert ('exceeded credit limit - from custom js code')	
	
	sumproduct: Aggregate(ItemCount,(elms)=>{elms.ItemCount*elms.Item})	-- matches elements(elms) by record
	Or special function AggregateSumProduct(NamedAggregate,NamedAggregate);

In app we can code as follows
...
	
	

End Of File

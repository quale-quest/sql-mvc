CREATE OR ALTER PROCEDURE Z$$integer (
    @action INTEGER,
 @pki VARCHAR(40),
 @bintype VARCHAR(40),
 @bini VARBINARY(max),
 @thumbtype VARCHAR(40),
 @thumb VARCHAR(8000),
 @name VARCHAR(250),
 @filename VARCHAR(250),
    @typo VARCHAR(40) out,
    @bino VARBINARY(max) out,
    @pko VARCHAR(40) out )
AS
BEGIN
SET NOCOUNT ON;    
	
	if (@action=0) begin
	select 
		{{#thumbtype}}typo = {{/thumbtype}} {{#thumbtype}}{{thumbtype}},{{/thumbtype}}
		{{#thumbnail}}bino = {{/thumbnail}} {{#thumbnail}}{{thumbnail}},{{/thumbnail}}
		@pko = {{pkf}}  
		from {{table}} where  {{pkf}}=@pki ;
	End 	
	if (@action=1) begin
	select 
		{{#blobtype}}typo  = {{/blobtype}}   {{#blobtype}}{{blobtype}},{{/blobtype}}
		{{#blobfield}}bino = {{/blobfield}} {{#blobfield}}{{blobfield}},{{/blobfield}}
		@pko = {{pkf}}
		from {{table}} where  {{pkf}}=@pki;
	End 	
	if (@action=2) begin
	update {{table}} set 
		{{#blobtype}}{{blobtype}}  =@bintype,{{/blobtype}}
		{{#blobfield}}{{blobfield}}=@bini,{{/blobfield}}
		{{#thumbtype}}{{thumbtype}}=@thumbtype,{{/thumbtype}}
		{{#thumbnail}}{{thumbnail}}=@thumb,{{/thumbnail}}
		{{#namefield}}{{namefield}}=@name,{{/namefield}}
		{{#filefield}}{{filefield}}=@filename,{{/filefield}}
		
		{{pkf}}=@pki 
		where {{pkf}}=@pki;
	End 

END;
	


CREATE or ALTER PROCEDURE Z$$integer (
    action INTEGER,
	pki VARCHAR(40),
	bintype VARCHAR(40),
	bini BLOB,
	thumbtype VARCHAR(40),
	thumb VARCHAR(8000),
	name VARCHAR(250),
	filename VARCHAR(250)
	)
RETURNS (
    typo VARCHAR(40),
    bino BLOB,
    pko VARCHAR(40) )
AS
BEGIN    
	
	if (action=0) then
	select 
		{{#thumbtype}}{{thumbtype}},{{/thumbtype}}
		{{#thumbnail}}{{thumbnail}},{{/thumbnail}}
		{{pkf}}
		from {{table}} where  {{pkf}}=:pki into 
		{{#thumbtype}}:typo,{{/thumbtype}}
		{{#thumbnail}}:bino,{{/thumbnail}}
		:pko;
		
	if (action=1) then
	select 
		{{#blobtype}}{{blobtype}},{{/blobtype}}
		{{#blobfield}}{{blobfield}},{{/blobfield}}
		{{pkf}}
		from {{table}} where  {{pkf}}=:pki into 
		{{#blobtype}}:typo,{{/blobtype}}
		{{#blobfield}}:bino,{{/blobfield}}
		:pko;
		
	if (action=2) then
	update {{table}} set 
		{{#blobtype}}{{blobtype}}=:bintype,{{/blobtype}}
		{{#blobfield}}{{blobfield}}=:bini,{{/blobfield}}
		{{#thumbtype}}{{thumbtype}}=:thumbtype,{{/thumbtype}}
		{{#thumbnail}}{{thumbnail}}=:thumb,{{/thumbnail}}
		{{#namefield}}{{namefield}}=:name,{{/namefield}}
		{{#filefield}}{{filefield}}=:filename,{{/filefield}}
		
		{{pkf}}=:pki 
		where {{pkf}}=:pki;
	else
		suspend;

END;
	

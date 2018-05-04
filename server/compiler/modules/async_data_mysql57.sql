CREATE PROCEDURE Z$$integer (
    in action INTEGER,
	in pki VARCHAR(40),
	in bintype VARCHAR(40),
	in bini BLOB,
	in thumbtype VARCHAR(40),
	in thumb VARCHAR(8000),
	in name VARCHAR(250),
	in filename VARCHAR(250),
    out typo VARCHAR(40),
    out bino BLOB,
    out pko VARCHAR(40) )
BEGIN    
	
	if (action=0) then
	select 
		{{#thumbtype}}{{thumbtype}},{{/thumbtype}}
		{{#thumbnail}}{{thumbnail}},{{/thumbnail}}
		{{pkf}} into 
		{{#thumbtype}}typo,{{/thumbtype}}
		{{#thumbnail}}bino,{{/thumbnail}}
		pko
		from {{table}} where  {{pkf}}=pki ;
	End if;	
	if (action=1) then
	select 
		{{#blobtype}}{{blobtype}},{{/blobtype}}
		{{#blobfield}}{{blobfield}},{{/blobfield}}
		{{pkf}} into 
		{{#blobtype}}typo,{{/blobtype}}
		{{#blobfield}}bino,{{/blobfield}}
		pko
		from {{table}} where  {{pkf}}=pki;
	End if;	
	if (action=2) then
	update {{table}} set 
		{{#blobtype}}{{blobtype}}=bintype,{{/blobtype}}
		{{#blobfield}}{{blobfield}}=bini,{{/blobfield}}
		{{#thumbtype}}{{thumbtype}}=thumbtype,{{/thumbtype}}
		{{#thumbnail}}{{thumbnail}}=thumb,{{/thumbnail}}
		{{#namefield}}{{namefield}}=name,{{/namefield}}
		{{#filefield}}{{filefield}}=filename,{{/filefield}}
		
		{{pkf}}=pki 
		where {{pkf}}=pki;
	End if;

END;
	

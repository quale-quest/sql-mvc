//place holder for future microsoft sql generator
/*
speed/memory performance  is not important
ease of use is important
 */

//http://en.wikipedia.org/wiki/Stored_procedure

//general info about porting, differences and features
//http://www.firebirdsql.org/manual/migration-mssql-syntax.html
//http://www.ispirer.com/products/interbase-firebird-to-sql-server-migration

//http://www.paragoncorporation.com/ArticleDetail.aspx?ArticleID=28

//http://msdn.microsoft.com/en-us/library/dn133186.aspx
//http://msdn.microsoft.com/en-us/library/dn133184.aspx
//ms sql  Stored procedures that only reference memory-optimized tables can be natively compiled into machine code
// optimal back-end storage of links are important -
//  currently we use basic tables -- this will be optimised - to "in memory" or GTT or redis type tables.
//  remember these tables may have a very short life....as soon as we move to the next page they are gone.....

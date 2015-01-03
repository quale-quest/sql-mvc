
DECLARE EXTERNAL FUNCTION Z$F_VERSION
RETURNS INTEGER BY VALUE
ENTRY_POINT 'Z$F_VERSION' MODULE_NAME 'q_UDFLibC';
--select Z$F_VERSION() from RDB$DATABASE

DROP EXTERNAL FUNCTION Z$F_F2J;
declare external function Z$F_F2J
  cstring(256)
  returns cstring(256) free_it
  entry_point 'Z$F_F2J' module_name 'q_UDFLibC';
--select Z$F_F2J(NULL)||','||Z$F_F2J('ab"cd') from RDB$DATABASE

DROP EXTERNAL FUNCTION Z$F_J2F;
declare external function Z$F_J2F
  cstring(256)
  returns cstring(256) free_it
  entry_point 'Z$F_J2F' module_name 'q_UDFLibC';
--select Z$F_F2J(NULL)||','||Z$F_F2J('ab"cd') from RDB$DATABASE

DROP EXTERNAL FUNCTION Z$F_F2SQL;
declare external function Z$F_F2SQL
  cstring(256)
  returns cstring(256) free_it
  entry_point 'Z$F_F2SQL' module_name 'q_UDFLibC';
--select Z$F_F2SQL(NULL)||','||Z$F_F2SQL('ab'cd') from RDB$DATABASE

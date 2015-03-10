// Parse commands from '' binary
// There will be other commands in the future

exports.process = function(program) {
  switch (program.args[0]) {

    // Create a new project
    case 'new':
    case 'n':
      return require('./generate').generate(program);
    case 'patch':
    case 'p':
      return require('./generate').patch(program);      
    case 'post_script':
      return require('./generate').post_script(program);            
    case 'patchhost':
    case 'ph':
      return require('./generate').patchhost(program);         
    case 'forever':
    case '4e':
      return require('./generate').forever(program);            
    case 'udf':
      return require('./generate').udf(program);       
    case 'check':
      return require('./generate').check(program);        
    default:
      return console.log('Type "sql-mvc new <projectname>" to create a new application');
  }
};

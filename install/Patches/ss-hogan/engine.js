// Hogan Template Engine wrapper for SocketStream 0.3

var fs = require('fs'),
    path  = require('path'),
    hogan = require('hogan.js');

exports.init = function(ss, config) {

  // Send Hogan VM to the client
  var clientCode = fs.readFileSync(path.join(__dirname, 'client.js'), 'utf8');
  ss.client.send('lib', 'hogan-template', clientCode);

  return {

    name: 'Hogan',

    // Opening code to use when a Hogan template is called for the first time
    prefix: function() {
      return '<script type="text/javascript">(function(){var ht=Hogan.Template,t=require(\'socketstream\').tmpl;'
    },

    // Closing code once all Hogan templates have been written into the <script> tag
    suffix: function() {
      return '}).call(this);</script>';
    },

    // Compile template into a function and attach it to ss.tmpl
    process: function(template, path, id) {

      var compiledTemplate;

      try {
        compiledTemplate = hogan.compile(template, {asString: true});
      } catch (e) {
        var message = '! Error compiling the ' + path + ' template into Hogan';
        console.log(String.prototype.hasOwnProperty('red') && message.red || message);
        throw new Error(e);
        compiledTemplate = '<p>Error</p>';
      }

      return 't[\'' + id + '\']=new ht(' + compiledTemplate + ');';    
    }
  }
}
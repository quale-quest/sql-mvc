// SQL-MVC 0.0
// ----------------

//require('colors');

// Get current version from package.json
var version = JSON.parse(fs.readFileSync(__dirname + '/../../package.json')).version;

// Set root path of your project
var root = exports.root = process.cwd().replace(/\\/g, '/'); // replace '\' with '/' to support Windows

// Warn if attempting to start without a cwd (e.g. through upstart script)
if (root == '/') throw new Error("You must change into the project directory before starting your SocketStream app");

//todo the rest is still socket stream

// Set environment
var env = exports.env = (process.env['SS_ENV'] || 'development').toLowerCase();

var api = {};

// Only one instance of the server can be started at once
var serverInstance = null; 

// Public API
var start = function(httpServer) {


  return api;
};

// Ensure server can only be started once
exports.start = function(httpServer) {
  return serverInstance || (serverInstance = start(httpServer));
};

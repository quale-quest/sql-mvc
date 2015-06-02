// Serve Views
// -----------
// Extend Node's HTTP http.ServerResponse object to serve views either from a cache (in production)
// or by generating them on-the-fly (in development)
// Note: Even though this is exactly what Express.js does, it's not best practice to extend Node's native
// objects and we don't be doing this in SocketStream 0.4
'use strict';

var cache, fs, http, pathlib, res, view, log;

require('colors');

fs = require('fs');

pathlib = require('path');

http = require('http');

view = require('./view');

log = require('../utils/log');

// Cache each view in RAM when packing assets (i.e. production mode)
cache = {};

// Get hold of the 'response' object so we can extend it later
res = http.ServerResponse.prototype;

module.exports = function(ss, clients, options) {

  // Append the 'serveClient' method to the HTTP Response object  
  res.serveClient = function(name,post_process_cb) {
    var client, fileName, self, sendHTML;
    self = this;
    sendHTML = function(html, code) {
      if (!code) {
        code = 200;
      }
      /*
        self.writeHead(code, header) removed to allow connect.compress() perform static HTML files compression.
        Before it was work only for static asserts because of response header overwriting.
        Instead we do set response status and header with two separate methods  self.statusCode and self.setHeader(name, value);
       */
      if (post_process_cb) html = post_process_cb(html); 
      self.statusCode = code;
      self.setHeader('Content-Length', Buffer.byteLength(html));
      self.setHeader('Content-Type', 'text/html; charset=UTF-8');
      self.end(html);
    };
    try {
      client = typeof name === 'string' && clients[name];
      if (!client) {
        throw new Error('Unable to find single-page client: ' + name);
      }

      // Load packed HTML file      
      if (options.packedAssets) {

        // Return from in-memory cache if possible        
        if (!cache[name]) {
          fileName = pathlib.join(ss.root, options.dirs.assets, client.name, client.id + '.html');
          cache[name] = fs.readFileSync(fileName, 'utf8');
        }

        // Send to browser
        return sendHTML(cache[name]);
      } else {
        // Generate View from scratch in development         
        return view(ss, client, options, sendHTML);
      }
    } catch (e) {
      // Never send stack trace to the browser, log it to the terminal instead      
      sendHTML('Internal Server Error', 500);
      log.error('Error: Unable to serve HTML!'.red);
      return log.error(e);
    }
  };

  // Alias res.serveClient to keep compatibility with existing apps  
  res.serve = res.serveClient;
  return res.serve;
};

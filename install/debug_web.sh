#!/bin/bash
#not working yet
cd ..
cd -P .
pwd
#sudo socat TCP-LISTEN:3004,reuseaddr,fork,su=nobody TCP:127.0.0.1:3002 &
node-debug -p 3012 app.js -p 3000


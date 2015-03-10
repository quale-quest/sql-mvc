#!/bin/bash

sudo apt-get install -y firebird2.5-classic firebird-dev
sudo service firebird2.5-classic start
sudo chmod o+r /etc/firebird/2.5/SYSDBA.password

node server\compiler\compile.js app Home/Guest all

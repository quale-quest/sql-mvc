#!/bin/bash

#todo we need a naming convention to remove all files of plugins not only the SignaturePad 
ls -la output
ls -la client/views
ls -la client/static/others/signature_pad
ls -la client/code/app
ls -la client/templates/Widgets


rm events.log
rm -R output
rm -R client/static/others/signature_pad
rm -R client/code/app/signature_pad_plugin.js
rm    client/views/app.html
rm    client/code/app/plugins.js
rm    client/templates/Widgets/SignaturePad.html
rm    client/templates/Widgets/signature_pad.html









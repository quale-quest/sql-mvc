#!/bin/bash

#todo we need a naming convention to remove all files of plugins not only the SignaturePad 

rm -R client/views
ls -la client/views

rm -R client/static/others/signature_pad
ls -la client/static/others/signature_pad


rm client/templates/Widgets/SignaturePad.html
rm client/templates/Widgets/signature_pad.html

rm -R client/code/app/signature_pad_plugin.js
echo 5 files only
ls -la client/code/app/








#!/bin/bash
rm -r ../client/templates/Home
rm -r  ../server/compiler/output
rm -r  /var/log/sql-mvc
cd ../server/udf
make clean

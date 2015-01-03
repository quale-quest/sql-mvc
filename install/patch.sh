#!/bin/bash
zxPatch ()
	{
	    echo "==============Patching $3 in $1" ;
	    pushd $cwd/install/Patches/$2/
		diff -u $3 new_$3 >$3.patch
		popd
		pushd $cwd/$1/
		patch -N < $cwd/install/Patches/$2/$3.patch
        rm $cwd/install/Patches/$2/$3.patch
		popd
	}
    
##should be run from the install directory    
cd ..    
cwd=`pwd` 
zxPatch node_modules/ss-hogan/node_modules/hogan.js/lib ss-hogan compiler.js
zxPatch node_modules/ss-hogan ss-hogan client.js 
zxPatch node_modules/ss-hogan ss-hogan engine.js
zxPatch node_modules/marked/lib marked marked.js 
zxPatch node_modules/emoji/lib emoji emoji.js


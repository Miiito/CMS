#!/bin/bash

dir=$(basename $(pwd))
git submodule update --init && composer install --prefer-dist && php setup.php development && php testsetup.php "noreply@mito.hu" "/cirunner/$dir"
ec=$?
if [ $ec -ne 0 ]; then
	exit $ec
fi
cd tests
../vendor/bin/codecept build && ../vendor/bin/codecept run
ec1=$?
cd ..

npm install mocha-phantomjs
node_modules/.bin/mocha-phantomjs "http://mito:mito@playground/cirunner/$dir/tests/web/index-test.php"

npm install glob-stream through2
node phpcs.js
ec2=$?

if [ $ec1 -ne 0 ] || [ $ec2 -ne 0 ]; then
	exit 1
fi
exit 0

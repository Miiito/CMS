#!/bin/sh

dir=$(basename $(pwd))
git submodule update --init && composer install --prefer-dist && npm install && gulp postinstall --environment="development" --email="noreply@mito.hu" && gulp testroot --testroot="/cirunner/$dir"
ec=$?
if [ $ec -ne 0 ]; then
	exit $ec
fi
gulp test
ec1=$?
gulp phpcs
ec2=$?

if [ $ec1 -ne 0 ] || [ $ec2 -ne 0 ]; then
	exit 1
fi
exit 0

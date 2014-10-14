#!/bin/sh

dir=$(basename $(pwd))
git submodule update --init && composer install --prefer-dist && npm install && grunt postinstall --environment="development" --email="noreply@mito.hu" && grunt testroot --testroot="$dir"
ec=$?
if [ $ec -ne 0 ]; then
	exit $ec
fi
grunt test
ec1=$?
grunt phpcs
ec2=$?

if [ $ec1 -ne 0 ] || [ $ec2 -ne 0 ]; then
	exit 1
fi
exit 0

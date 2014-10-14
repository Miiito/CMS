#!/bin/sh

git submodule update --init
composer install --prefer-dist
npm install
grunt postinstall --environment="development" --email="noreply@mito.hu"
grunt testroot --testroot=/me/yii2/basic
grunt test
grunt phpcs

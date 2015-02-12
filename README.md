Yii 2 Basic Application Template
================================

[![build status](http://gitlab-ci.mito.hu/projects/1/status.png?ref=master)](http://gitlab-ci.mito.hu/projects/1?ref=master)

Yii 2 Basic Application Template is a skeleton Yii 2 application best for
rapidly creating small projects.

The template contains the basic features including user login/logout and a contact page.
It includes all commonly used configurations that would allow you to focus on adding new
features to your application.


DIRECTORY STRUCTURE
-------------------

      assets/             contains assets definition
      commands/           contains console commands (controllers)
      config/             contains application configurations
      controllers/        contains Web controller classes
      mail/               contains view files for e-mails
      models/             contains model classes
      runtime/            contains files generated during runtime
      tests/              contains various tests for the basic application
      vendor/             contains dependent 3rd-party packages
      views/              contains view files for the Web application
      web/                contains the entry script and Web resources



REQUIREMENTS
------------

The minimum requirement by this application template that your Web server supports PHP 5.4.0.


INSTALLATION
------------

If you do not have [Composer](http://getcomposer.org/), you may install it by following the instructions
at [getcomposer.org](http://getcomposer.org/doc/00-intro.md#installation-nix).

After cloning the repository, run:

~~~
composer global require "fxp/composer-asset-plugin:1.0.0-beta4"
composer install
npm install
~~~

To choose an environment, run:

~~~
gulp setup
~~~

To be able to run the tests, you have to set up the base URL of your appplication with this command:

~~~
gulp setup:testroot
~~~

Enter the path of your application's web root without the domain and without the "web" directory.
For example, if your application can be reached at "http://dev.mito.hu/me/yii2/basic/web", then enter "me/yii2/basic".
To change the domain, edit `/tests/codeception/acceptance.suite.yml` and `/tests/config.json`.
To use WebDriver instead of PhpBrowser, edit `/tests/codeception/acceptance.suite.yml`.
To change the Selenium server, edit `/tests/config.json` and `/tests/codeception/acceptance.suite.yml`.
You can now run the tests with the `gulp test` command.


CONFIGURATION
-------------

### Database

Create the file `config/development/common.php` with real data, for example:

```php
return [
    'components' => [
        'db' => [
            'dsn' => 'mysql:host=localhost;dbname=yii2sample',
            'username' => 'php',
            'password' => 'phppass',
        ]
    ],
];
```

**NOTE:** Yii won't create the database for you, this has to be done manually before you can access it.

Also check and edit the other files in the `config/` directory to customize your application.

GULP
-----

The following commands are available:

* setup : choose environment
* phpcs : run php codesniffer on source code
* jscs : run js codesniffer on source code
* hint : run jshint on javascript files; will use .jshintrc files
* watch : watch scss files for changes and regenerate css files; starts a livereload server on a random port
* build : generate minified js, css, optimize images and copy fonts; will run hint and abort if it fails

To use the livereload server over ssh, forward the random port selected by the watch command to localhost:35729, e.g.:
    ssh -L 35729:localhost:39307 dev.mito.hu

Some directories are excluded from the phpcs task (views, migrations, configs etc.). Check the gulpfile for details.

ASSETS
------

Asset bundles should extend from `\mito\assets\AssetBundle` and should be placed in `app\assets` or the module's assets directory.
The assets directory should contain a `bundles.php` file, which should return an array of classnames of all asset bundles.
The build process will build these assets.
In the development environment `devPath` is used as the base path for publishing assets; `distPath` is used in production, and
the build process will output files there.
Any array elements in `devJs` will be combined and minified into the js file specified by the element's key.
If `scssPath` is specified, all files found inside that directory will be compiled to a file with the same name under the css diretory.
If `imgPath` is specified, all files found inside that directory will be optimized and copied to a directory with the same name under the dist path.
If `fontPath` is specified, all files found inside that directory will be copied to a directory with the same name under the dist path.

To get the baseUrl of an asset bundle, use the baseUrl property of the registered asset instance:
    $assetUrl = AppAsset::register($this)->baseUrl;

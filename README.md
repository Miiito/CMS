Yii 2 Basic Application Template
================================

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
composer install
npm install
~~~

Run `grunt setup` to choose an environment.


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

GRUNT
-----

The following commands are available:
* setup : choose environment
* phpcs : run php codesniffer on source code
* hint : run jshint on javascript files; will use .jshintrc files
* watch : watch scss files for changes and regenerate css files; starts a livereload server on a random port
* build : generate minified js, css, optimize images and copy fonts; will run hint and abort if it fails

To use the livereload server over ssh, forward the random port selected by the watch command to localhost:35729, e.g.:
    ssh -L 35729:localhost:39307 dev.mito.hu

Some directories are excluded from the phpcs task (views, migrations, configs etc.). Check the gruntfile for details.

ASSETS
------

Asset bundles should extend from `app\components\AssetBundle` and should be placed in `app\assets` or the module's assets directory.
The assets directory should contain a `bundles.php` file, which should return an array of classnames of all asset bundles.
The build process will build these assets.
In the development environment `devPath` is used as the base path for publishing assets; `distPath` is used in production, and
the build process will output files there.
Any array elements in `devJs` will be combined and minified into the js file specified by the element's key.
If `scssPath` is specified, all files found inside that directory will be compiled to a file with the same name under the css diretory.
If `imgPath` is specified, all files found inside that directory will be optimized and copied to a directory with the same name under the dist path.
If `fontPath` is specified, all files found inside that directory will be copied to a directory with the same name under the dist path.

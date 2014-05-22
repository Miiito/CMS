<?php

namespace tests\unit\models;

use Yii;
use yii\codeception\TestCase;
use yii\helpers\Json;
use mito\assets\PackagesController;


class PackagesControllerTest extends TestCase
{
    protected $tempPath='';

    public function setUp()
    {
        parent::setUp();
        $this->tempPath = Yii::getAlias('@runtime/test_packages');
        $this->createDir($this->tempPath);
    }

    public function tearDown()
    {
        $this->removeDir($this->tempPath);
        parent::tearDown();
    }

    /**
     * Creates directory.
     * @param $dirName directory full name
     */
    protected function createDir($dirName)
    {
        if (!file_exists($dirName)) {
            mkdir($dirName,0777,true);
        }
    }

    /**
     * Removes directory.
     * @param $dirName directory full name
     */
    protected function removeDir($dirName)
    {
        if (!empty($dirName) && is_dir($dirName)) {
            \yii\helpers\FileHelper::removeDirectory($dirName);
        }
    }

    /**
     * @return \mito\assets\PackagesController packages controller instance
     */
    protected function createPackagesController()
    {
        $module = $this->getMock('yii\\base\\Module', ['fake'], ['console']);
        $packagesController = new PackagesController('packages', $module);
        $packagesController->interactive = false;

        return $packagesController;
    }

    /**
     * Return a mock PackagesController with a custom config
     * @param array $config custom config
     * @return \mito\assets\PackagesController packages controller instance
     */
    protected function createMockPackagesController(array $config)
    {
        $module = $this->getMock('yii\\base\\Module', ['fake'], ['console']);
        $packagesController = $this->getMock('mito\\assets\\PackagesController', ['loadConfigFile'], ['packages', $module]);
        $packagesController->interactive = false;
        $packagesController->expects($this->any())
            ->method('loadConfigFile')
            ->will($this->returnValue($config));

        return $packagesController;
    }

    /**
     * Emulates running of the packages controller.
     * @param  string $actionId id of action to be run.
     * @param null|array $config configuration to use in mock config loader
     * @param array $args controller shell arguments
     * @return string controller output
     */
    protected function runPackagesControllerAction($actionId, $config = null, array $args = [])
    {
        if ($config === null) {
            $controller=$this->createPackagesController();
        } else {
            $controller=$this->createMockPackagesController($config);
        }
        ob_start();
        ob_implicit_flush(false);
        $controller->run($actionId, $args);
        return ob_get_clean();
    }

    /**
     * Data provider for testLoadConfig
     */
    public function loadConfigProvider()
    {
        return [
            [null, null],
            [['name' => 'testapp'], 'testapp']
        ];
    }

    /**
     * @param array configuration
     * @return string|null full path to config file
     */
    public function createConfigFile($config)
    {
        if ($config === null) {
            return null;
        }
        $configFile = $this->tempPath . '/main' . md5(microtime()) . '.php';
        $fileContent = '<?php return ' . var_export($config,true) . ';';
        file_put_contents($configFile, $fileContent);
        return $configFile;
    }

    /**
     * creates all the required files for the test
     * @return array config
     */
    public function createFiles()
    {
        $globalPackages = [
            'nocompile' => [
                'name'=>'NocompileAsset',
                'namespace'=>'app\assets',
                'type'=>'\mito\assets\FallbackAssetBundle',
                'sourcePath'=>'@app/assets/nocompile/src',
                'devJs'=>['js/test.js'],
                'js'=>['js/test.min.js'],
            ],
            'compile' => [
                'name'=>'CompileAsset',
                'namespace'=>'app\assets',
                'type'=>'\mito\assets\AssetBundle',
                'devPath'=>"@app/assets/compile/src",
                'distPath'=>"@app/assets/compile/dist",
                'devJs'=> ['js/combined1.js'=>['js/file1.js', 'js/file2.js'], 'js/nocombine.js'],
                'js'=>['js/combined1.js', 'js/nocombine.js'],
                'scssPath'=>'scss',
                'imgPath'=>'img',
                'fontPath'=>'fonts',
                'css'=>['css/screen.css','css/print.css','css/main.css','css/form.css'],
            ],
        ];

        $modulePackages = [
            'test' => [
                'test' => [
                    'name'=>'TestAsset',
                    'namespace'=>'app\modules\test\assets',
                    'type'=>'\mito\assets\AssetBundle',
                    'devPath'=>"@app/modules/test/assets/test/src",
                    'distPath'=>"@app/modules/test/assets/test/dist",
                    'devJs'=> ['js/combined1.js'=>['js/file1.js', 'js/file2.js'], 'js/nocombine.js'],
                    'js'=>['js/combined1.js', 'js/nocombine.js'],
                    'scssPath'=>'scss',
                    'imgPath'=>'img',
                    'fontPath'=>'fonts',
                    'css'=>['css/screen.css','css/print.css','css/main.css','css/form.css'],
                ],
            ],
            'nametest' => [
                'test' => [
                    'name'=>'TestAsset',
                    'namespace'=>'app\modules\nametest\assets',
                    'type'=>'\mito\assets\AssetBundle',
                    'devPath'=>"@app/modules/nametest/assets/test/src",
                    'distPath'=>"@app/modules/nametest/assets/test/dist",
                    'devJs'=> ['js/combined1.js'=>['js/file1.js', 'js/file2.js'], 'js/nocombine.js'],
                    'js'=>['js/combined1.js', 'js/nocombine.js'],
                    'scssPath'=>'scss',
                    'imgPath'=>'img',
                    'fontPath'=>'fonts',
                    'css'=>['css/screen.css','css/print.css','css/main.css','css/form.css'],
                ],
            ],
        ];

        $packageAttributes = [
            'devJs',
            'js',
            'sourcePath',
            'devPath',
            'distPath',
            'scssPath',
            'imgPath',
            'fontPath',
            'css',
        ];

        $mainAssets = $this->tempPath . '/assets';
        $modulesDir = $this->tempPath . '/modules';

        $this->createDir($mainAssets);
        $mainFile = $mainAssets . '/bundles.php';
        $mainBundles = [];

        foreach ($globalPackages as $package) {
            $class =
"<?php
namespace " . $package['namespace'] . ";
class " . $package['name'] . " extends " . $package['type'] . "
{
";
            foreach ($packageAttributes as $attr) {
                if (array_key_exists($attr, $package)) {
                    $class .= 'public $' . $attr . ' = ' . var_export($package[$attr], true) . ';';
                    $class .= "\n";
                }
            }
            $class .= "}";
            $fileName = $mainAssets . '/' . $package['name'] . '.php';
            file_put_contents($fileName, $class);
            $mainBundles[] = $package['namespace'] . '\\' . $package['name'];
        }

        $fileContent = '<?php return ' . var_export($mainBundles, true) . ';';
        file_put_contents($mainFile, $fileContent);

        $modules = [];

        foreach ($modulePackages as $module => $packages) {
            $moduleAssets = $modulesDir . '/' . $module . '/assets';
            $this->createDir($moduleAssets);

            $moduleBundles = [];

            foreach ($packages as $package) {
                $class =
"<?php
namespace " . $package['namespace'] . ";
class " . $package['name'] . " extends " . $package['type'] . "
{
";
                foreach ($packageAttributes as $attr) {
                    if (array_key_exists($attr, $package)) {
                        $class .= 'public $' . $attr . ' = ' . var_export($package[$attr], true) . ';';
                        $class .= "\n";
                    }
                }
                $class .= "}";
                $fileName = $moduleAssets . '/' . $package['name'] . '.php';
                file_put_contents($fileName, $class);
                $moduleBundles[] = $package['namespace'] . '\\' . $package['name'];
            }

            $fileContent = '<?php return ' . var_export($moduleBundles, true) . ';';
            file_put_contents($moduleAssets . '/bundles.php', $fileContent);
            $modules[$module] = ['basePath' => '@app/modules/' . $module ];
        }

        $this->createDir($modulesDir . '/parent/assets');
        $this->createDir($modulesDir . '/child/assets');

        $modules['parent'] = [
            'basePath' => '@app/modules/parent',
            'modules' => [
                'child' => [
                    'basePath' => '@app/modules/child',
                ]
            ],
        ];

        // use class to find path
        $this->createDir($modulesDir . '/classtest/assets');
        file_put_contents($modulesDir . '/classtest/ClassTestModule.php', '<?php namespace app\modules\classtest; class ClassTestModule extends \yii\base\Module {}');
        $modules['class_test'] = [
            'class' => 'app\modules\classtest\ClassTestModule'
        ];

        return ['modules' => $modules];
    }

    /**
     * Tests loading of a config file
     * @dataProvider loadConfigProvider
     */
    function testLoadConfig($configFile, $expectedName)
    {
        if ($expectedName === null) {
            $expectedName = Yii::$app->name;
        }
        $controller = $this->createPackagesController();
        $controller->configPath = $this->createConfigFile($configFile);
        $config = $controller->loadConfigFile();
        $this->assertArrayHasKey('name', $config);
        $this->assertEquals($expectedName, $config['name']);
    }

    /**
     * Tests mock loadConfigFile
     */
    function testLoadMockConfig()
    {
        $mockConfig = ['name' => 'test mock app'];
        $controller = $this->createMockPackagesController($mockConfig);
        $config = $controller->loadConfigFile();
        $this->assertEquals($mockConfig, $config);
    }

    /**
     * Tests getPaths with no modules
     * @depends testLoadMockConfig
     */
    function testGetPathsNoModules()
    {
        $config = [
            'modules' => [],
        ];
        $alias = Yii::getAlias('@app');
        Yii::setAlias('@app', $this->tempPath);

        $controller = $this->createMockPackagesController($config);
        $paths = $controller->getPaths();
        $expected = [
            '_app' => Yii::getAlias('@app'),
        ];

        foreach ($expected as $name => $path) {
            $this->assertContains([
                'path' => $path,
                'module' => $name,
            ], $paths, 'Expected module missing from paths');
        }
        $this->assertCount(count($expected), $paths);

        Yii::setAlias('@app', $alias);
    }

    /**
     * Tests getPaths with missing module
     * @depends testLoadMockConfig
     */
    function testGetPathsMissingModule()
    {
        $config = [
            'modules' => [
                'doesnotexist' => [
                    'class' => 'app\modules\doesnotexist\DoesNotExistModule'
                ],
            ],
        ];
        $alias = Yii::getAlias('@app');
        Yii::setAlias('@app', $this->tempPath);

        $controller = $this->createMockPackagesController($config);
        $paths = $controller->getPaths();
        $expected = [
            '_app' => Yii::getAlias('@app'),
        ];

        foreach ($expected as $name => $path) {
            $this->assertContains([
                'path' => $path,
                'module' => $name,
            ], $paths, 'Expected module missing from paths');
        }
        $this->assertCount(count($expected), $paths);

        Yii::setAlias('@app', $alias);
    }

    /**
     * Tests getPaths with basePath
     * @depends testLoadMockConfig
     */
    function testGetPathsBasePath()
    {
        $basePath = $this->tempPath . '/modules/basepath';
        $this->createDir($basePath);
        $config = [
            'modules' => [
                'basepath' => [
                    'basePath' => $basePath
                ],
            ],
        ];
        $alias = Yii::getAlias('@app');
        Yii::setAlias('@app', $this->tempPath);

        $controller = $this->createMockPackagesController($config);
        $paths = $controller->getPaths();
        $expected = [
            '_app' => Yii::getAlias('@app'),
            'basepath' => $basePath,
        ];

        foreach ($expected as $name => $path) {
            $this->assertContains([
                'path' => $path,
                'module' => $name,
            ], $paths, 'Expected module missing from paths');
        }
        $this->assertCount(count($expected), $paths);

        Yii::setAlias('@app', $alias);
    }

    /**
     * Tests getPaths
     * @depends testLoadMockConfig
     */
    function testGetPaths()
    {
        $config = $this->createFiles();
        $alias = Yii::getAlias('@app');
        Yii::setAlias('@app', $this->tempPath);

        $controller = $this->createMockPackagesController($config);
        $paths = $controller->getPaths();
        $expected = [
            '_app' => Yii::getAlias('@app'),
            'test' => Yii::getAlias('@app/modules/test'),
            'nametest' => Yii::getAlias('@app/modules/nametest'),
            'parent' => Yii::getAlias('@app/modules/parent'),
            'child' => Yii::getAlias('@app/modules/child'),
            'class_test' => Yii::getAlias('@app/modules/classtest'),
        ];

        foreach ($expected as $name => $path) {
            $this->assertContains([
                'path' => $path,
                'module' => $name,
            ], $paths, 'Expected module missing from paths');
        }

        Yii::setAlias('@app', $alias);
    }

    /**
     * Tests that the comand returns a json
     * @coversNothing
     */
    function testReturnsJson()
    {
        $output = $this->runPackagesControllerAction('index');
        $decoded = Json::decode($output);
        $this->assertNotNull($decoded, 'Returned json is invalid');
    }

    /**
     * Tests main action
     * @depends testReturnsJson
     * @depends testLoadMockConfig
     */
    function testActionIndex()
    {
        $config = $this->createFiles();
        $alias = Yii::getAlias('@app');
        Yii::setAlias('@app', $this->tempPath);

        $output = $this->runPackagesControllerAction('index', $config);

        $decoded = Json::decode($output);
        $this->assertNotNull($decoded, 'Returned json is invalid');
        $this->assertArrayHasKey('packages', $decoded, 'Returned json is missing packages');

        $toTest = [];
        foreach ($decoded['packages'] as $config) {
            $this->assertArrayHasKey('sources', $config);
            $this->assertArrayHasKey('dist', $config);
            $this->assertArrayHasKey('module', $config);
            $toTest[] = [
                'sources' => $config['sources'],
                'dist' => $config['dist'],
                'module' => $config['module'],
            ];
        }
        $expected = [
            '_app' => [
                'yes' => ['compile'],
                'no' => ['nocompile'],
                'path' => Yii::getAlias('@app'),
            ],
            'test' => [
                'yes' => ['test'],
                'path' => Yii::getAlias('@app/modules/test'),
            ],
            'nametest' => [
                'yes' => ['test'],
                'path' =>  Yii::getAlias('@app/modules/nametest'),
            ],
        ];

        foreach ($expected as $name => $config) {
            $path = $config['path'];
            foreach ($config['yes'] as $package) {
                $this->assertContains([
                    'sources' => $path . '/assets/' . $package . '/src',
                    'dist' => $path . '/assets/' . $package . '/dist',
                    'module' => $name,
                ], $toTest, 'Expected package missing from packages');
            }
        }

        Yii::setAlias('@app', $alias);
    }
}

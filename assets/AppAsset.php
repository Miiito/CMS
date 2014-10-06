<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace app\assets;

/**
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class AppAsset extends \mito\assets\AssetBundle
{
    public $devPath = '@app/assets/main/src';
    public $distPath = '@app/assets/main/dist';
    public $imgPath = null;
    public $cssSourcePaths = ['scss'];
    public $css = [
        'css/site.css'
    ];
    public $devJs = [
        'js/combined.js' => [ 'js/someplugin.js', 'js/site.js' ],
    ];
    public $js = [
        'js/combined.js',
    ];
    public $depends = [
        'yii\web\JqueryAsset',
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapAsset',
    ];
}

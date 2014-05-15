<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace app\assets;

use app\components\AssetBundle;
use yii\helpers\Html;
use yii\helpers\Json;
use yii\web\View;

/**
 * This asset bundle provides the [jquery javascript library](http://jquery.com/)
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class JqueryAsset extends AssetBundle
{
    public $sourcePath = null;
    public $devJs = [ '//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.js' ];
    public $js = [ '//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js' ];
    public $fallback = null;
    public $check = null;

    /**
     * {@inheritdoc}
     */
    public function registerAssetFiles($view)
    {
        parent::registerAssetFiles($view);
        if ($this->fallback !== null && $this->check !== null) {
            $fallback = $view->getAssetManager()->getBundle($this->fallback);
            $scripts = '';
            foreach ($fallback->js as $js) {
                if (strpos($js, '/') !== 0 && strpos($js, '://') === false) {
                    $scripts .= Html::jsFile($fallback->baseUrl . '/' . $js, [], $fallback->jsOptions);
                } else {
                    $scripts .= Html::jsFile($js, [], $fallback->jsOptions);
                }
            }

            $position = isset($fallback->jsOptions['position']) ? $fallback->jsOptions['position'] : View::POS_END;
            $view->jsFiles[$position][] = Html::script(
                $this->check." || document.write(" . Json::encode($scripts) . ");",
                ['type' => 'text/javascript']
            );
        }
    }
}

<?php

namespace app\components;

class AssetBundle extends \yii\web\AssetBundle
{
    public $devJs = [];
    public $devPath = null;
    public $imgPath = null;
    public $fontPath = null;
    public $scssPath = null;
    public $distPath = null;

    /**
     * {@inheritdoc}
     */
    public function init()
    {
        if (YII_ENV_DEV) {
            $this->js = array();
            foreach ($this->devJs as $name => $scripts) {
                if (is_array($scripts)) {
                    $this->js = array_merge($this->js, $scripts);
                } else {
                    $this->js[] = $scripts;
                }
            }
            if ($this->devPath !== null) {
                $this->sourcePath = $this->devPath;
            }
        } else {
            if ($this->distPath !== null) {
                $this->sourcePath = $this->distPath;
            }
        }
        parent::init();
    }
}

<?php

namespace app\components;

class AssetBundle extends \yii\web\AssetBundle
{
    public $devJs = [];
    public $devPath = null;
    public $imgPath = null;
    public $scssPath = null;

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
        }
        parent::init();
    }
}

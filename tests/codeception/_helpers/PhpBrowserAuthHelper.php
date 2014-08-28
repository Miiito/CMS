<?php
namespace Codeception\Module;

class PhpBrowserAuthHelper extends PhpBrowser
{
    public function _before(\Codeception\TestCase $test)
    {
        parent::_before($test);
        $this->goutte->setAuth($this->config['auth'][0], $this->config['auth'][1]);
    }
}

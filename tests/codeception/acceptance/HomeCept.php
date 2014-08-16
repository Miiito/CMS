<?php

$I = new AcceptanceTester($scenario);
$I->wantTo('ensure that home page works');
$I->amOnPage(Yii::$app->homeUrl);
if (method_exists($I,'resizeWindow')) {
    $I->resizeWindow(800, 600);
}
$I->see('My Company');
$I->seeLink('About');
$I->click('About');
$I->see('This is the About page.');

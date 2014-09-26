<?php

$finder = Symfony\CS\Finder\DefaultFinder::create()
    ->exclude('node_modules')
    ->notName('AcceptanceTester.php')
    ->notName('UnitTester.php')
    ->notName('FunctionalTester.php')
    ->notName('requirements.php')
    ->in(__DIR__)
;

return Symfony\CS\Config\Config::create()
    ->fixers(['psr2', 'ordered_use', 'short_array_syntax', 'unused_use', 'operators_spaces', 'new_with_braces'])
    ->finder($finder)
;

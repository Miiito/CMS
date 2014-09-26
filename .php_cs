<?php

$finder = Symfony\CS\Finder\DefaultFinder::create()
    ->exclude('node_modules')
    ->exclude('runtime')
    ->notName('c3.php')
    ->notName('AcceptanceTester.php')
    ->notName('UnitTester.php')
    ->notName('FunctionalTester.php')
    ->notName('requirements.php')
    ->in(__DIR__)
;

return Symfony\CS\Config\Config::create()
    ->fixers(['psr2', 'ordered_use', 'short_array_syntax', 'unused_use', 'operators_spaces', 'new_with_braces', 'concat_with_spaces'])
    ->finder($finder)
;

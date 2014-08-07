<?php

return [
    'components' => [
        'mail' => [
            'as dryrun' => [ 'class' => 'app\components\MailerDryRun' ],
        ],
    ],
];

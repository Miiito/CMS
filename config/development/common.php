<?php

return [
    'components' => [
        'mailer' => [
            'as dryrun' => [ 'class' => 'app\components\MailerDryRun' ],
        ],
    ],
];

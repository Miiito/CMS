<?php

class Setup
{
    protected static $serverWritablePaths = array(
        'runtime',
        'web/assets',
    );

    protected static $defaultServerGroup = 'apache';

    protected static $_baseDir;

    public static function run($args)
    {
        if (!is_array($args) || count($args) < 2) {
            echo "Missing parameter: environment name\n";
            return;
        }

        $server_group = self::getGroupName(count($args) > 2 ? $args[2] : self::$defaultServerGroup);
        if ($server_group === false) {
            return;
        }

        self::setupWritablePaths($server_group);
        self::writeEnv($args[1]);
        self::installHooks();
    }

    protected static function getGroupName($grpName)
    {
        $grp_info = @posix_getgrnam($grpName);
        if ($grp_info === false) {
            echo "Group $grpName not found\n";
            return false;
        }
        return $grp_info['name'];
    }

    protected static function writeEnv($env)
    {
        $baseDir = self::getBaseDir();

        $env_config = $baseDir . '/config/' . $env;

        if (!is_dir($env_config)) {
            echo "Warning: no configuration found for environment: $env\n";
        }

        file_put_contents($baseDir.'/config/ENV', $env);
    }

    protected static function setupWritablePaths($server_group)
    {
        $baseDir = self::getBaseDir();

        foreach (self::$serverWritablePaths as $path) {
            if (!is_dir($baseDir.'/'.$path)) {
                mkdir($baseDir.'/'.$path, 02775);
            }
            chgrp($baseDir.'/'.$path, $server_group);
            chmod($baseDir.'/'.$path, 02775);
        }
    }

    protected static function installHooks()
    {
        $baseDir = self::getBaseDir();

        $hookDir = $baseDir . '/hooks';
        $gitHookDir = $baseDir . '/.git/hooks';
        if (is_dir($hookDir) && is_dir($gitHookDir)) {
            $files = scandir($hookDir);
            foreach ($files as $file) {
                if ($file == '.' || $file == '..') {
                    continue;
                }
                copy($hookDir.'/'.$file, $gitHookDir.'/'.$file);
                chmod($gitHookDir.'/'.$file, 0775);
            }
        }
    }

    protected static function getBaseDir()
    {
        if (self::$_baseDir === null) {
            self::$_baseDir = dirname(__FILE__);
        }
        return self::$_baseDir;
    }
}

Setup::run(isset($_SERVER['argv']) ? $_SERVER['argv'] : array());

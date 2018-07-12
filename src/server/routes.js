import express from 'express';
const app = express();
import logger from '../logger';
import {
    shutdownVmWithTimeout,
    copyVm,
    checkVmCopiedCorrectly,
    deleteOldestVmOverLimit,
    startVm,
} from '../commands';

import config from '../config';

let currentStatus = 'Idle';

app.get('/', (req, res) => {
    res.json({
        currentStatus
    });
});

app.get('/backup', (req, res) => {
    res.json({
        status: 'backup instruction received'
    });

    (async function doBackup(){
        currentStatus = 'Beginning backup';
        const vmName = req.query.vmName || config.vmName;
        const vmFileName = req.query.vmFileName || config.vmFileName;
        const checkInterval = req.query.interval || 5;
        const timeout = req.query.timeout || 180;
        const srcDirectory = req.query.srcDir;
        const destDirectory = req.query.destDir;

        currentStatus = 'Waiting for shutdown';
        await shutdownVmWithTimeout(vmName, checkInterval, timeout);

        currentStatus = 'Starting copy';
        const newName = await copyVm(vmFileName, srcDirectory, destDirectory);

        currentStatus = 'Checking copy';
        await checkVmCopiedCorrectly(vmFileName, newName, srcDirectory, destDirectory);

        currentStatus = 'Deleting old';
        await deleteOldestVmOverLimit(vmName, 2, destDirectory);

        currentStatus = 'Restarting vm';
        await startVm(vmName);

        currentStatus = 'Idle';
    })();
});

app.get('/shutdown', (req, res) => {
    res.json({
        status: 'shutdown instruction received'
    });

    (async function shutdown(){
        const vmName = req.query.vmName || config.vmName;
        const checkInterval = req.query.interval || 5;
        const timeout = req.query.timeout || 180;

        await shutdownVmWithTimeout(vmName, checkInterval, timeout);

    })();
});

app.get('/start', (req, res) => {
    res.json({
        status: 'startup instruction received'
    });

    (async function start(){
        const vmName = req.query.vmName || config.vmName;

        await startVm(vmName);

    })();
});

app.listen(3000, () => logger.info('Virtualbox backup listening on port 3000!'));


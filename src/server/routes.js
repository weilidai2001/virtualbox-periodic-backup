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

        currentStatus = 'Waiting for shutdown';
        await shutdownVmWithTimeout(vmName);

        currentStatus = 'Starting copy';
        const newName = await copyVm(vmFileName);

        currentStatus = 'Checking copy';
        await checkVmCopiedCorrectly(vmFileName, newName);

        currentStatus = 'Deleting old';
        await deleteOldestVmOverLimit(vmName);

        currentStatus = 'Restarting vm';
        await startVm(vmName);

        currentStatus = 'Idle';
    })();
});

app.listen(3000, () => logger.info('Virtualbox backup listening on port 3000!'));


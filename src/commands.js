import path from 'path';
import logger from './logger';
import {
    isRunningVm,
    forceShutdown,
    softShutdown,
    startVm as start,
    copyFile,
    isFilesIdentical,
    getAllFilesFromDirectory,
    deleteFile,
} from './shell';

import {
    replaceAll,
    now,
} from "./util";

import config from './config';

const periodicallyCheckIsVmRunningUntilNotRunning = (sleepInSec, vmName) => {
    return new Promise((res) => {
        isRunningVm(vmName).then(isVmRunning => {
            if (isVmRunning) {
                setTimeout(() => {
                    res(periodicallyCheckIsVmRunningUntilNotRunning(sleepInSec, vmName));
                }, sleepInSec);
            } else {
                res();
            }
        });

    });
};

export async function shutdownVmWithTimeout(
    vmName,
    statusCheckFrequencyInSec = 1,
    timeoutInSec = 180,
    ) {
    logger.info(`VM shutdown requested with status checking every ${statusCheckFrequencyInSec}s and a timeout of ${timeoutInSec}s`);

    if (!await isRunningVm()) {
        return;
    }

    await softShutdown(vmName);

    let wait;
    const timeoutPromise = new Promise((res) => {
        wait = setTimeout(() => {
            forceShutdown(vmName).then(() => {
                res();
            }).catch(err => {
                res();
            });
        }, timeoutInSec * 1000);
    });
    const checkIsVmRunningPromise = periodicallyCheckIsVmRunningUntilNotRunning(statusCheckFrequencyInSec * 1000, vmName);
    await Promise.race([timeoutPromise, checkIsVmRunningPromise]);

    if (wait) {
        clearTimeout(wait);
    }
}

export function startVm(vmName) {
    return start(vmName);
}

export async function copyVm(vmFileName) {
    const timestamp = now().toISOString();
    const fileNameValidTimestamp = replaceAll(timestamp, ':', '_');
    const srcPath = config.srcDirectory + vmFileName;
    const newFileName = `${path.basename(vmFileName, path.extname(vmFileName))} ${fileNameValidTimestamp}${path.extname(vmFileName)}`;
    const destPath = config.destDirectory + newFileName;
    await copyFile(srcPath, destPath);
    return newFileName;
}

export function checkVmCopiedCorrectly(srcFileName, destFileName) {
    const srcPath = config.srcDirectory + srcFileName;
    const destPath = config.destDirectory + destFileName;
    return isFilesIdentical(srcPath, destPath);
}


export async function deleteOldestVmOverLimit(vmFileName, limit = 3) {
    const compareFileNameByDate = (a, b) => {
        const fileNameA = path.basename(a, path.extname(a));
        const fileNameB = path.basename(b, path.extname(b));

        const dateA = replaceAll(fileNameA.split(' ')[1], '_', ':');
        const dateB = replaceAll(fileNameB.split(' ')[1], '_', ':');

        return new Date(dateA) - new Date(dateB);
    };

    const allBackupFiles = await getAllFilesFromDirectory(config.destDirectory);
    const relevantBackupFiles = allBackupFiles.filter(file => path.basename(file).includes(vmFileName));
    const sortedByDate = relevantBackupFiles.sort(compareFileNameByDate);
    const noOfFilesToDelete = sortedByDate.length - limit > 0 ? sortedByDate.length - limit : 0;
    await sortedByDate.slice(0, noOfFilesToDelete).map(file => deleteFile(file));
}

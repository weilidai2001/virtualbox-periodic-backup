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

const checkIsVmRunning = (sleepInSec, vmName) => {
    return new Promise((res) => {
        const isVmRunning = isRunningVm(vmName);
        if (isVmRunning) {
            setTimeout(() => {
                res(checkIsVmRunning(sleepInSec, vmName));
            }, sleepInSec);
        } else {
            res();
        }
    });
};

export function shutdownVmWithTimeout(
    vmName,
    statusCheckFrequencyInSec = 1,
    timeoutInSec = 180,
    ) {
    logger.info(`VM shutdown requested with status checking every ${statusCheckFrequencyInSec}s and a timeout of ${timeoutInSec}s`);

    softShutdown(vmName);

    const timeoutPromise = new Promise((res) => {
        setTimeout(() => {
            forceShutdown(vmName);
            res();
        }, timeoutInSec * 1000);
    });
    const checkIsVmRunningPromise = checkIsVmRunning(statusCheckFrequencyInSec * 1000, vmName);
    return Promise.race([timeoutPromise, checkIsVmRunningPromise]);
}

export function startVm(vmName) {
    start(vmName);
}

export function copyVm(vmFileName) {
    const timestamp = now().toISOString();
    const fileNameValidTimestamp = replaceAll(timestamp, ':', '_');
    const srcPath = config.srcDirectory + vmFileName;
    const newFileName = `${vmFileName} ${fileNameValidTimestamp}`;
    const destPath = config.destDirectory + newFileName;
    copyFile(srcPath, destPath);
    return newFileName;
}

export function checkVmCopiedCorrectly(srcFileName, destFileName) {
    const srcPath = config.srcDirectory + srcFileName;
    const destPath = config.destDirectory + destFileName;
    return isFilesIdentical(srcPath, destPath);
}


export function deleteOldestVmOverLimit(vmFileName, limit = 3) {
    const compareFileNameByDate = (a, b) => {
        const fileNameA = path.basename(a, path.extname(a));
        const fileNameB = path.basename(b, path.extname(b));

        const dateA = replaceAll(fileNameA.split(' ')[1], '_', ':');
        const dateB = replaceAll(fileNameB.split(' ')[1], '_', ':');

        return new Date(dateA) - new Date(dateB);
    };

    const allBackupFiles = getAllFilesFromDirectory(config.destDirectory);
    const relevantBackupFiles = allBackupFiles.filter(file => path.basename(file).includes(vmFileName));
    const sortedByDate = relevantBackupFiles.sort(compareFileNameByDate);
    const noOfFilesToDelete = sortedByDate.length - limit > 0 ? sortedByDate.length - limit : 0;
    sortedByDate.slice(0, noOfFilesToDelete).forEach(file => deleteFile(file));
}

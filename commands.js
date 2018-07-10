import {
    isRunningVm,
    forceShutdown,
    softShutdown,
    startVm as start,
    copyFile,
    isFilesIdentical,
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
    softShutdown(vmName);
    console.log(`VM shutdown requested with status checking every ${statusCheckFrequencyInSec}s and a timeout of ${timeoutInSec}s`);

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

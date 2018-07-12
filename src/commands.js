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
import util from 'util';
const delay = util.promisify(setTimeout);

import {
    replaceAll,
    now,
} from "./util";

import config from './config';

let allowCheckingVmIsRunning = true;

const periodicallyCheckIsVmRunningUntilNotRunning = async (sleepInSec, vmName) => {
    const isVmRunning = await isRunningVm(vmName);

    if (isVmRunning || allowCheckingVmIsRunning) {
        await delay(sleepInSec);
        await periodicallyCheckIsVmRunningUntilNotRunning(sleepInSec, vmName);
    }
};

export async function shutdownVmWithTimeout(
    vmName,
    statusCheckFrequencyInSec = 1,
    timeoutInSec = 180,
    ) {
    logger.info(`VM shutdown requested with status checking every ${statusCheckFrequencyInSec}s and a timeout of ${timeoutInSec}s`);

    if (!await isRunningVm(vmName)) {
        return;
    }

    await softShutdown(vmName);
    await softShutdown(vmName); // sometimes on Windows the first shutdown signal is ignored
    await softShutdown(vmName); // sometimes on Windows the first shutdown signal is ignored

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

    allowCheckingVmIsRunning = false;

    if (wait) {
        clearTimeout(wait);
    }
}

export function startVm(vmName) {
    return start(vmName);
}

export async function copyVm(vmFileName, srcDirParam, destDirParam) {
    const srcDirectory = srcDirParam || config.srcDirectory;
    const destDirectory = destDirParam || config.destDirectory;
    const timestamp = now().toISOString();
    const fileNameValidTimestamp = replaceAll(timestamp, ':', '_');
    const srcPath = srcDirectory + vmFileName;
    const newFileName = `${path.basename(vmFileName, path.extname(vmFileName))} ${fileNameValidTimestamp}${path.extname(vmFileName)}`;
    const destPath = destDirectory + newFileName;
    await copyFile(srcPath, destPath);
    return newFileName;
}

export function checkVmCopiedCorrectly(srcFileName, destFileName, srcDirParam, destDirParam) {
    const srcDirectory = srcDirParam || config.srcDirectory;
    const destDirectory = destDirParam || config.destDirectory;
    const srcPath = srcDirectory + srcFileName;
    const destPath = destDirectory + destFileName;
    return isFilesIdentical(srcPath, destPath);
}


export async function deleteOldestVmOverLimit(vmFileName, limit = 3, destDirParam) {
    const compareFileNameByDate = (a, b) => {
        const fileNameA = path.basename(a, path.extname(a));
        const fileNameB = path.basename(b, path.extname(b));

        const dateA = replaceAll(fileNameA.split(' ')[1], '_', ':');
        const dateB = replaceAll(fileNameB.split(' ')[1], '_', ':');

        return new Date(dateA) - new Date(dateB);
    };

    const destDirectory = destDirParam || config.destDirectory;

    const allBackupFiles = await getAllFilesFromDirectory(destDirectory);
    const relevantBackupFiles = allBackupFiles.filter(file => path.basename(file).includes(vmFileName));
    logger.info(`Found ${allBackupFiles.length} files, ${relevantBackupFiles.length} are relevant backup files and the limit is ${limit}`);
    const sortedByDate = relevantBackupFiles.sort(compareFileNameByDate);
    const noOfFilesToDelete = sortedByDate.length - limit > 0 ? sortedByDate.length - limit : 0;
    logger.info(`${noOfFilesToDelete} files are about to be deleted`);
    await sortedByDate.slice(0, noOfFilesToDelete).map(file => deleteFile(file));
}

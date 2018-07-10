import logger from './logger';

export function isRunningVm(vmName) {
    logger.info(`checking if ${vmName} is running`);
    return true;
}

export function forceShutdown(vmName) {
    logger.info(`forcing ${vmName} to shutdown`);
    return true;
}

export function softShutdown(vmName) {
    logger.info(`soft shutdown ${vmName}`);
    return true;
}

export function startVm(vmName) {
    logger.info(`starting ${vmName}`);
    return true;
}

export function copyFile(src, dest) {
    logger.info(`copying file from ${src} to ${dest}`);
    return true;
}

export function isFilesIdentical(src, dest) {
    logger.info(`comparing file ${src} and ${dest}`);
    return true;
}

export function getAllFilesFromDirectory(directory) {
    logger.info(`retrieving files from ${directory}`);
    return [];
}

export function deleteFile(path) {
    logger.info(`deleting file ${path}`);
}
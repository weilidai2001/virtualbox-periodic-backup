export function isRunningVm(vmName) {
    console.log(`checking if ${vmName} is running`);
    return true;
}

export function forceShutdown(vmName) {
    console.log(`forcing ${vmName} to shutdown`);
    return true;
}

export function softShutdown(vmName) {
    console.log(`soft shutdown ${vmName}`);
    return true;
}

export function startVm(vmName) {
    console.log(`starting ${vmName}`);
    return true;
}

export function copyFile(src, dest) {
    console.log(`copying file from ${src} to ${dest}`);
    return true;
}

export function isFilesIdentical(src, dest) {
    console.log(`comparing file ${src} and ${dest}`);
    return true;
}
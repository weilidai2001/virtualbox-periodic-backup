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
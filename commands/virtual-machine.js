import vmStatus from './vm-status';

export function shutdownVM(
    statusCheckFrequencyInSec = 1,
    timeoutInSec = 180
    ) {
    console.log('VM shutdown', statusCheckFrequencyInSec, timeoutInSec);
    vmStatus();
}
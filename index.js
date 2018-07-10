import {shutdownVmWithTimeout} from './commands';

(async function(){
    const vmName = '';
    await shutdownVmWithTimeout(vmName);
    const newName = await copyVm(vmName);
    await checkVmCopiedCorrectly(vmName, newName);
    await deleteOldestVm(vmName);
})();

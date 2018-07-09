import {shutdownVmWithTimeout} from './business-logic/virtual-machine';

(async function(){
    await shutdownVmWithTimeout('vmName');
})();

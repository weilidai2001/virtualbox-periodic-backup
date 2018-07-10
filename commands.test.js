import "babel-polyfill"
import { shutdownVmWithTimeout } from './commands';
import * as shell from './shell';

describe('shutdownVm()', () => {
    test('it calls softShutdown()', () => {
        shell.softShutdown = jest.fn();
        shutdownVmWithTimeout();

        expect(shell.softShutdown.mock.calls.length).toBe(1);
    });

    test('it calls isRunningVm()', () => {
        shell.isRunningVm = jest.fn();
        shutdownVmWithTimeout();

        expect(shell.isRunningVm.mock.calls.length).toBeGreaterThan(0);
    });

    test('it calls isRunningVm() 10 times with delay of 10 milliseconds', async () => {
        const vmName = '';
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 10;
        const responses = [...Array(9).fill(true), false];
        shell.isRunningVm = jest.fn(() => responses.shift());
        await shutdownVmWithTimeout(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.isRunningVm.mock.calls.length).toBe(10);
    });

    test('it calls isRunningVm() 5 times with before timing out', async () => {
        const vmName = '';
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 0.05;
        const responses = [...Array(9).fill(true), false];
        shell.isRunningVm = jest.fn(() => responses.shift());
        await shutdownVmWithTimeout(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.isRunningVm.mock.calls.length).toBe(5);
    });

    test('it calls forceShutdown() when timing out', async () => {
        const vmName = '';
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 0.05;
        const responses = [...Array(9).fill(true), false];
        shell.isRunningVm = jest.fn(() => responses.shift());
        shell.forceShutdown = jest.fn();

        await shutdownVmWithTimeout(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.forceShutdown.mock.calls.length).toBe(1);
    });

});

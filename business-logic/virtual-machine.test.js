import "babel-polyfill"
import {shutdownVm} from './virtual-machine';
import * as shell from '../shell-commands/virtual-machine';

describe('shutdownVm()', () => {
    test('it calls isRunningVm()', () => {
        shell.isRunningVm = jest.fn();
        shutdownVm();

        expect(shell.isRunningVm.mock.calls.length).toBeGreaterThan(0);
    });

    test('it calls isRunningVm() 10 times with delay of 10 milliseconds', async () => {
        const vmName = '';
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 10;
        const responses = [...Array(9).fill(true), false];
        shell.isRunningVm = jest.fn(() => responses.shift());
        await shutdownVm(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.isRunningVm.mock.calls.length).toBe(10);
    });

    test('it calls isRunningVm() 5 times with before timing out', async () => {
        const vmName = '';
        const delayInSeconds = 0.01;
        const timeoutInSeconds = 0.05;
        const responses = [...Array(9).fill(true), false];
        shell.isRunningVm = jest.fn(() => responses.shift());
        await shutdownVm(vmName, delayInSeconds, timeoutInSeconds);

        expect(shell.isRunningVm.mock.calls.length).toBe(5);
    });

});

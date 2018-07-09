import {shutdownVM} from './virtual-machine';
import * as vmStatus from './vm-status';

test('shutdownVM() calls vmStatus()', () => {
    vmStatus.default = jest.fn();
    shutdownVM();

    expect(vmStatus.default.mock.calls.length).toBeGreaterThan(0);
});

test('shutdownVM() calls vmStatus() 10 times with timeout of 10 seconds', () => {
    vmStatus.default = jest.fn();
    shutdownVM(1, 10);

    expect(vmStatus.default.mock.calls.length).toBe(10);
});
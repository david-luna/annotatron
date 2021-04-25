import { Injectable } from './injectable';
import { Injector } from './injector';

jest.mock('./injector', () => ({
  Injector: { register: jest.fn() },
}));

describe('The @Injectable decorator', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should instantiate any decorated class as is, without interfering its type', () => {
    @Injectable()
    class TestClass {}

    const testObject = new TestClass();
    expect(testObject instanceof TestClass).toBeTruthy();
  });

  it('should register the decorated class constructor type through the Injector.register() static method', () => {
    @Injectable()
    class TestClass {}

    const testObject = new TestClass();
    expect(Injector.register).toHaveBeenCalledWith(TestClass, undefined);
  });

  // eslint-disable-next-line max-len
  it('should register the decorated class constructor type along with a replacement type if any', () => {
    @Injectable({ overrides: String })
    class TestClass {}

    const testObject = new TestClass();
    expect(Injector.register).toHaveBeenCalledWith(TestClass, { overrides: String });
  });

  it('should NOT register the decorated class if the constructorFunction is undefined', () => {
    Injectable()(undefined as any);
    expect(Injector.register).not.toHaveBeenCalledWith(undefined);
  });
});

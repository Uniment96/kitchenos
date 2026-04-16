import { useUIStore } from '../store/uiStore';

beforeEach(() => {
  jest.useFakeTimers();
  useUIStore.setState({ toast: null, isOnline: true });
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('uiStore — showToast', () => {
  it('sets a toast with message and default type "info"', () => {
    useUIStore.getState().showToast('Hello');
    const { toast } = useUIStore.getState();
    expect(toast).not.toBeNull();
    expect(toast?.message).toBe('Hello');
    expect(toast?.type).toBe('info');
  });

  it('sets a toast with explicit type', () => {
    useUIStore.getState().showToast('Saved', 'success');
    expect(useUIStore.getState().toast?.type).toBe('success');
  });

  it('each toast gets a unique id', () => {
    useUIStore.getState().showToast('First');
    const id1 = useUIStore.getState().toast?.id;
    jest.advanceTimersByTime(1);
    useUIStore.getState().showToast('Second');
    const id2 = useUIStore.getState().toast?.id;
    expect(id1).not.toBe(id2);
  });
});

describe('uiStore — hideToast', () => {
  it('clears the toast', () => {
    useUIStore.getState().showToast('Visible');
    useUIStore.getState().hideToast();
    expect(useUIStore.getState().toast).toBeNull();
  });
});

describe('uiStore — setOnline', () => {
  it('defaults to online', () => {
    expect(useUIStore.getState().isOnline).toBe(true);
  });

  it('sets offline', () => {
    useUIStore.getState().setOnline(false);
    expect(useUIStore.getState().isOnline).toBe(false);
  });

  it('restores online', () => {
    useUIStore.getState().setOnline(false);
    useUIStore.getState().setOnline(true);
    expect(useUIStore.getState().isOnline).toBe(true);
  });
});

// 测试环境设置

// Mock localStorage 全局对象
const storage = new Map<string, string>();

const localStorageMock = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
    get length() { return storage.size; },
    key: (index: number) => {
        const keys = Array.from(storage.keys());
        return keys[index] ?? null;
    },
};

// 设置到全局对象
(globalThis as any).localStorage = localStorageMock;

// 如果需要 DOM 环境（React 组件测试）
// import '@happy-dom/global-registrator';

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { applyTheme, THEMES } from './theme.ts';

describe('applyTheme', () => {
  let mockDocument: any;
  let mockLocalStorage: any;

  beforeEach(() => {
    mockDocument = {
      documentElement: {
        setAttribute: (name: string, value: string) => {
          mockDocument.documentElement.attributes[name] = value;
        },
        attributes: {} as Record<string, string>,
      },
    };

    mockLocalStorage = {
      store: {} as Record<string, string>,
      setItem: (key: string, value: string) => {
        mockLocalStorage.store[key] = value;
      },
    };

    // @ts-ignore
    global.document = mockDocument;
    // @ts-ignore
    global.localStorage = mockLocalStorage;
  });

  test('should set data-theme attribute on documentElement', () => {
    applyTheme('dracula');
    assert.strictEqual(mockDocument.documentElement.attributes['data-theme'], 'dracula');
  });

  test('should set terminal-theme in localStorage', () => {
    applyTheme('amber');
    assert.strictEqual(mockLocalStorage.store['terminal-theme'], 'amber');
  });

  test('should work with all predefined themes', () => {
    THEMES.forEach(t => {
      applyTheme(t.name);
      assert.strictEqual(mockDocument.documentElement.attributes['data-theme'], t.name);
      assert.strictEqual(mockLocalStorage.store['terminal-theme'], t.name);
    });
  });
});

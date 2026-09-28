import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP } from '../dist/constants/languages.js';
import { FLAG_METADATA } from '../dist/constants/flags.js';
import { getI18nStrings } from '../dist/i18n/index.js';

test('languages constant includes all 22 scheduled Indian languages plus English (23 total)', () => {
  assert.equal(SUPPORTED_LANGUAGES.length, 23);
  assert.ok(LANGUAGE_MAP.has('hi'));
  assert.ok(LANGUAGE_MAP.has('bn'));
  assert.ok(LANGUAGE_MAP.has('te'));
  assert.ok(LANGUAGE_MAP.has('en'));
  assert.ok(LANGUAGE_MAP.has('ur'));
});

test('RTL languages are correctly identified', () => {
  assert.equal(LANGUAGE_MAP.get('ur')?.direction, 'rtl');
  assert.equal(LANGUAGE_MAP.get('ks')?.direction, 'rtl');
  assert.equal(LANGUAGE_MAP.get('sd')?.direction, 'rtl');
  assert.equal(LANGUAGE_MAP.get('hi')?.direction, 'ltr');
});

test('Flag metadata contains required severity states and colors', () => {
  const flags = ['normal', 'low', 'high', 'critical'];
  for (const flag of flags) {
    assert.ok(FLAG_METADATA[flag]);
    assert.ok(FLAG_METADATA[flag].colorHex);
    assert.ok(FLAG_METADATA[flag].iconName);
    assert.ok(FLAG_METADATA[flag].description);
  }
});

test('i18n returns translations with medical disclaimers', () => {
  const en = getI18nStrings('en');
  const hi = getI18nStrings('hi');
  assert.ok(en.disclaimer.includes('DISCLAIMER'));
  assert.ok(hi.disclaimer.includes('अस्वीकरण'));
});

import { describe, expect, it } from 'vitest';
import {
  checkFileExists,
  checkNodeVersion,
  checkNoSecrets,
  checkPnpmVersion,
  compileDoctorReport,
  formatDoctorReport,
  parseNodeVersion,
  parsePnpmVersion,
} from './doctor-logic.js';

describe('doctor-logic', () => {
  describe('parseNodeVersion', () => {
    it('should be a function', () => {
      expect(typeof parseNodeVersion).toBe('function');
    });
  });
  describe('parsePnpmVersion', () => {
    it('should be a function', () => {
      expect(typeof parsePnpmVersion).toBe('function');
    });
  });
  describe('checkNodeVersion', () => {
    it('should be a function', () => {
      expect(typeof checkNodeVersion).toBe('function');
    });
  });
  describe('checkPnpmVersion', () => {
    it('should be a function', () => {
      expect(typeof checkPnpmVersion).toBe('function');
    });
  });
  describe('checkFileExists', () => {
    it('should be a function', () => {
      expect(typeof checkFileExists).toBe('function');
    });
  });
  describe('checkNoSecrets', () => {
    it('should be a function', () => {
      expect(typeof checkNoSecrets).toBe('function');
    });
  });
  describe('compileDoctorReport', () => {
    it('should be a function', () => {
      expect(typeof compileDoctorReport).toBe('function');
    });
  });
  describe('formatDoctorReport', () => {
    it('should be a function', () => {
      expect(typeof formatDoctorReport).toBe('function');
    });
  });
});

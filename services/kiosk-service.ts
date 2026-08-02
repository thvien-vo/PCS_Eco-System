import { ScanResult } from '@/types';

export const KioskService = {
  simulateScan: async (material: 'PET' | 'PE' | 'PP' | 'PS' | 'PVC' | 'OOD', isClean: boolean): Promise<ScanResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!isClean) {
          resolve({ status: 'REJECT', confidenceScore: 45, rejectReason: 'Dirty/Wet', pointsAwarded: 0 });
          return;
        }
        if (material === 'OOD') {
          resolve({ status: 'REJECT', confidenceScore: 92, rejectReason: 'OOD Material', pointsAwarded: 0 });
          return;
        }
        
        const confidence = Math.floor(Math.random() * 10) + 90; // 90-99
        resolve({
          status: 'PASS',
          confidenceScore: confidence,
          materialDetected: material,
          pointsAwarded: 10
        });
      }, 2000); // 2 seconds scan delay
    });
  }
};

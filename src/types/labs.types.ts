// src/types/labs.types.ts

export interface LabParameter {
  id?: number;
  parameterNameEnglish: string; // Backend field name
  unit: string;
  referenceRangeMax: number | string;
  referenceRangeMin: number | string;
  gender: string; // "Male", "Female", "Both"
}

export interface LabTest {
  id: number;
  testCode: string;
  testNameArabic: string;
  testNameEnglish: string;
  category: string;
  sampleType: string;
  fasting_required: boolean;
  parameters: LabParameter[];
}

export interface CreateLabTestDto {
  testCode?: string;
  testNameArabic?: string;
  testNameEnglish?: string;
  category?: string;
  subCategory?: string;
  testMethod?: string;
  sampleType?: string;
  fasting_required?: boolean;
  fasting_hours?: number;
  isActive?: boolean;
  parameters?: Omit<LabParameter, 'id'>[];
}

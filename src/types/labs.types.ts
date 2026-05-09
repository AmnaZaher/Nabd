// src/types/labs.types.ts

export interface LabParameter {
  id?: number;
  name?: string; // Some endpoints might return name
  unit: string;
  referenceRangeMax: string;
  referenceRangeMin: string;
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
  sampleType?: string;
  fasting_required?: boolean;
  isActive?: boolean;
  parameters?: Omit<LabParameter, 'id'>[];
}

export type TherapeuticArea = 'neurology' | 'ophthalmology' | 'car-ts';

export interface AudioContent {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number; // in seconds
  therapeuticArea: TherapeuticArea;
}
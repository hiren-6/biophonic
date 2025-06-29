import { AudioContent, TherapeuticArea } from '../types';

// Clean audio content - only the three news items
export const audioContent: Record<TherapeuticArea, AudioContent> = {
  neurology: {
    id: 'neuro-001',
    title: 'Fintepla\'s Promise: New Epilepsy Treatment for CDKL5 Deficiency Disorder',
    description: 'Breakthrough epilepsy treatment offering new hope for patients with rare CDKL5 deficiency disorder',
    audioUrl: '/audio/neurology/fintepla-cdkl5.mp3',
    duration: 180,
    therapeuticArea: 'neurology'
  },
  ophthalmology: {
    id: 'ophthal-001',
    title: 'Eylea picks up new extended-duration approval in Europe',
    description: 'Extended-duration aflibercept injection receives European approval for retinal diseases',
    audioUrl: '/audio/ophthalmology/update-2.mp3',
    duration: 165,
    therapeuticArea: 'ophthalmology'
  },
  'car-ts': {
    id: 'cart-001',
    title: 'FDA removes CAR-T access barriers',
    description: 'FDA streamlines approval process to improve patient access to CAR-T therapies',
    audioUrl: '/audio/car-ts/update-3.mp3',
    duration: 195,
    therapeuticArea: 'car-ts'
  }
};

// Function to get audio content by therapeutic areas
export const getAudioContentByAreas = (selectedAreas: TherapeuticArea[]): AudioContent[] => {
  return selectedAreas.map(area => audioContent[area]).filter(Boolean);
};
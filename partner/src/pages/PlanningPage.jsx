import React from 'react';
import AvailabilityPlanning from '../components/AvailabilityPlanning';
import { PageHeader } from '../components/ui';

export default function PlanningPage() {
  return (
    <>
      <PageHeader
        title="Planning des chambres"
        subtitle="Sélectionnez une chambre, puis indiquez sa disponibilité pour chaque jour du mois."
      />
      <AvailabilityPlanning />
    </>
  );
}

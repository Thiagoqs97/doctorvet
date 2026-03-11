import React, { useState } from 'react';
import Portal from './Portal';
import VetSystem from './VetSystem';
import PetSystem from './PetSystem';
import HomeSystem from './HomeSystem';

type SystemType = 'portal' | 'vet' | 'pet' | 'home';

const App = () => {
  const [currentSystem, setCurrentSystem] = useState<SystemType>('portal');

  if (currentSystem === 'portal') {
    return <Portal onSelectSystem={(sys: SystemType) => setCurrentSystem(sys)} />;
  }

  if (currentSystem === 'vet') {
    return <VetSystem onLogout={() => setCurrentSystem('portal')} />;
  }

  if (currentSystem === 'pet') {
    return <PetSystem onLogout={() => setCurrentSystem('portal')} />;
  }

  if (currentSystem === 'home') {
    return <HomeSystem onLogout={() => setCurrentSystem('portal')} />;
  }

  return <div>Sistema não encontrado</div>;
};

export default App;
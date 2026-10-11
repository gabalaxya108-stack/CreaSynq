// src/components/TrustCenter.jsx
// Complete Creator Trust Verification Center for Creator Studio & Standalone
// Integrates with TrustCenterView for unified verification logic, evidence submission, and admin review.

import React from 'react';
import TrustCenterView from '../views/TrustCenterView.jsx';

export default function TrustCenter({ 
  creator, 
  currentUser, 
  onUpdateCreator, 
  onViewPublicProfile,
  projects = [],
  workflows = []
}) {
  const creatorList = creator ? [creator] : [];
  
  return (
    <TrustCenterView
      creators={creatorList}
      activeCreatorId={creator?.id}
      currentUser={currentUser}
      onUpdateCreator={onUpdateCreator}
      onViewCreatorProfile={onViewPublicProfile}
      onBackToMarketplace={onViewPublicProfile}
    />
  );
}

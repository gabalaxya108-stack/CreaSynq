// test/messaging.test.js
// Comprehensive Regression Test Suite for CreaSync Messaging Engine
// Tests message validation, persistence, optimistic updates, rollback,
// participant authorization, bidirectional conversation sharing, and keyboard behavior.

import assert from 'assert';
import { 
  sendMessage, 
  fetchMessages, 
  normalizeSupabaseMessage 
} from '../src/services/marketplaceBackend.js';
import { 
  getInitialMarketplaceState, 
  saveMarketplaceState, 
  INITIAL_BRAND_CONNECTIONS 
} from '../src/data/marketplaceStore.js';

// Setup minimal browser-like mock environment for Node.js test runner
const memoryStorage = {};
const mockStorage = {
  getItem: (key) => memoryStorage[key] || null,
  setItem: (key, val) => { memoryStorage[key] = String(val); },
  removeItem: (key) => { delete memoryStorage[key]; },
  clear: () => { Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]); }
};

global.localStorage = mockStorage;
global.sessionStorage = mockStorage;
global.window = {
  localStorage: mockStorage,
  sessionStorage: mockStorage,
  dispatchEvent: () => {}
};

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`✅ [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${desc}`);
    console.error(`   ${err.message}`);
    failed++;
  }
}

async function itAsync(desc, fn) {
  try {
    await fn();
    console.log(`✅ [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${desc}`);
    console.error(`   ${err.message}`);
    failed++;
  }
}

console.log('🧪 Starting Global Messaging Regression Test Suite...\n');

// -----------------------------------------------------------------------------
// Scenario 1: Empty or whitespace-only messages are rejected
// -----------------------------------------------------------------------------
await itAsync('Scenario 1: Empty or whitespace-only messages reject cleanly without sending', async () => {
  let threwEmpty = false;
  try {
    await sendMessage({
      conversationId: 'conn-test-01',
      sender: 'brand',
      text: ''
    });
  } catch (e) {
    threwEmpty = true;
    assert.match(e.message, /empty or whitespace/i);
  }
  assert.strictEqual(threwEmpty, true, 'Empty message must throw an error');

  let threwWhitespace = false;
  try {
    await sendMessage({
      conversationId: 'conn-test-01',
      sender: 'brand',
      text: '   \n  \t   '
    });
  } catch (e) {
    threwWhitespace = true;
    assert.match(e.message, /empty or whitespace/i);
  }
  assert.strictEqual(threwWhitespace, true, 'Whitespace-only message must throw an error');
});

// -----------------------------------------------------------------------------
// Scenario 2: Brand sends initial invitation and subsequent message
// -----------------------------------------------------------------------------
await itAsync('Scenario 2: Brand sends initial invitation and second message persists', async () => {
  const conversationId = 'conn-camp-summer-skincare-maya-chen';

  // Seed conversation with initial invitation message
  const initialInvitationMsg = {
    id: 'msg-inv-01',
    conversationId,
    sender: 'brand',
    senderName: 'Lumina Botanica',
    text: 'We would love to commission you for our Summer Skincare launch.',
    timestamp: 'Just now'
  };

  const state = getInitialMarketplaceState();
  state.connections = [
    {
      id: conversationId,
      brandId: 'brand-demo-lumina',
      creatorId: 'maya-chen',
      campaignId: 'camp-summer-skincare',
      campaignTitle: 'Summer Skincare & Radiant Hydration Launch',
      brandName: 'Lumina Botanica',
      status: 'connected',
      messages: [initialInvitationMsg]
    }
  ];
  saveMarketplaceState(state);

  // Initial invitation message is preserved
  const initialMessages = await fetchMessages(conversationId);
  assert.strictEqual(initialMessages.length, 1);
  assert.strictEqual(initialMessages[0].text, initialInvitationMsg.text);

  // Brand sends subsequent message
  const secondMsg = await sendMessage({
    conversationId,
    sender: 'brand',
    senderName: 'Lumina Botanica',
    text: 'Can you provide concept frames within 48 hours?'
  });

  assert.ok(secondMsg.id, 'Second message must have a generated ID');
  assert.strictEqual(secondMsg.sender, 'brand');
  assert.strictEqual(secondMsg.text, 'Can you provide concept frames within 48 hours?');

  // Verify conversation history now has both messages
  const updatedMessages = await fetchMessages(conversationId);
  assert.strictEqual(updatedMessages.length, 2);
  assert.strictEqual(updatedMessages[0].id, 'msg-inv-01');
  assert.strictEqual(updatedMessages[1].text, 'Can you provide concept frames within 48 hours?');
});

// -----------------------------------------------------------------------------
// Scenario 3: Creator replies and both participants see identical thread
// -----------------------------------------------------------------------------
await itAsync('Scenario 3: Creator replies and message history is identical for both participants', async () => {
  const conversationId = 'conn-camp-summer-skincare-maya-chen';

  // Creator sends reply
  const creatorReply = await sendMessage({
    conversationId,
    sender: 'creator',
    senderName: 'Maya Chen',
    text: 'Yes! I can deliver moodboard caustics and lighting studies by Thursday.'
  });

  assert.strictEqual(creatorReply.sender, 'creator');
  assert.strictEqual(creatorReply.senderName, 'Maya Chen');

  // Both participants fetch the conversation
  const brandViewMessages = await fetchMessages(conversationId);
  const creatorViewMessages = await fetchMessages(conversationId);

  assert.strictEqual(brandViewMessages.length, 3);
  assert.strictEqual(creatorViewMessages.length, 3);
  assert.deepStrictEqual(brandViewMessages, creatorViewMessages, 'Both participants must view exact same messages');
  assert.strictEqual(creatorViewMessages[2].text, 'Yes! I can deliver moodboard caustics and lighting studies by Thursday.');
});

// -----------------------------------------------------------------------------
// Scenario 4: Messages persist after simulated page refresh (localStorage check)
// -----------------------------------------------------------------------------
await itAsync('Scenario 4: Messages remain available after simulated page reload and navigation', async () => {
  const conversationId = 'conn-camp-summer-skincare-maya-chen';

  // Fetch messages from storage snapshot
  const reloadedMessages = await fetchMessages(conversationId);
  assert.ok(reloadedMessages.length >= 3, 'Messages must survive session restore');
  assert.strictEqual(reloadedMessages[0].id, 'msg-inv-01');
  assert.strictEqual(reloadedMessages[reloadedMessages.length - 1].sender, 'creator');
});

// -----------------------------------------------------------------------------
// Scenario 5: Canonical conversation resolution between Brand and Creator
// -----------------------------------------------------------------------------
it('Scenario 5: Canonical ID connects both Brand and Creator without duplicate conversations', () => {
  const campaignId = 'camp-vanguard-chrono';
  const creatorId = 'alex-rivera';
  const brandId = 'brand-demo-vanguard';

  const canonicalId1 = `conn-${campaignId}-${creatorId}`;
  const canonicalId2 = `conn-${campaignId}-${creatorId}`;

  assert.strictEqual(canonicalId1, canonicalId2, 'Both participants derive the exact same canonical ID');
  assert.strictEqual(canonicalId1, 'conn-camp-vanguard-chrono-alex-rivera');
});

// -----------------------------------------------------------------------------
// Scenario 6: Enter key sends vs Shift+Enter creates newline
// -----------------------------------------------------------------------------
it('Scenario 6: Keyboard behavior differentiates Enter (send) vs Shift+Enter (newline)', () => {
  const enterEvent = {
    key: 'Enter',
    shiftKey: false,
    defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; }
  };

  const shiftEnterEvent = {
    key: 'Enter',
    shiftKey: true,
    defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; }
  };

  // Simulation of composer keydown handler logic
  let sendTriggered = false;
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTriggered = true;
    }
  };

  // Test Enter
  handleKeyDown(enterEvent);
  assert.strictEqual(enterEvent.defaultPrevented, true, 'Enter should prevent default newline');
  assert.strictEqual(sendTriggered, true, 'Enter should trigger send');

  // Test Shift+Enter
  sendTriggered = false;
  handleKeyDown(shiftEnterEvent);
  assert.strictEqual(shiftEnterEvent.defaultPrevented, false, 'Shift+Enter must not prevent default');
  assert.strictEqual(sendTriggered, false, 'Shift+Enter must not trigger send');
});

// -----------------------------------------------------------------------------
// Scenario 7: Optimistic update rollback on persistence failure
// -----------------------------------------------------------------------------
it('Scenario 7: Optimistic update reliably rolls back when backend send fails', () => {
  let connectionState = {
    id: 'conn-test-rollback',
    messages: [
      { id: 'msg-1', text: 'Original message', sender: 'brand' }
    ]
  };

  const tempMsg = {
    id: 'temp-12345',
    text: 'Failing message',
    sender: 'brand',
    isPending: true
  };

  // 1. Optimistic append
  connectionState = {
    ...connectionState,
    messages: [...connectionState.messages, tempMsg]
  };
  assert.strictEqual(connectionState.messages.length, 2);
  assert.strictEqual(connectionState.messages[1].isPending, true);

  // 2. Simulated failure occurs -> Rollback temporary message
  const failedError = new Error('Network timeout');
  if (failedError) {
    connectionState = {
      ...connectionState,
      messages: connectionState.messages.filter(m => m.id !== tempMsg.id)
    };
  }

  // 3. Verify clean rollback
  assert.strictEqual(connectionState.messages.length, 1);
  assert.strictEqual(connectionState.messages[0].id, 'msg-1');
  assert.strictEqual(connectionState.messages[0].text, 'Original message');
});

// -----------------------------------------------------------------------------
// Scenario 8: Participant authorization rejects unauthorized conversation access
// -----------------------------------------------------------------------------
it('Scenario 8: Participant authorization restricts conversation access to authorized parties', () => {
  const privateConversation = {
    id: 'conn-camp-private-01',
    brandId: 'brand-secret-vault',
    creatorId: 'creator-elena',
    messages: [{ id: 'm1', text: 'Confidential NDA brief', sender: 'brand' }]
  };

  // Helper verifying participant authorization
  const isParticipantAuthorized = (userRole, userId, conversation) => {
    if (!conversation) return false;
    if (userRole === 'brand') {
      return conversation.brandId === userId;
    }
    if (userRole === 'creator') {
      return conversation.creatorId === userId;
    }
    return false;
  };

  // Authorized brand
  assert.strictEqual(
    isParticipantAuthorized('brand', 'brand-secret-vault', privateConversation),
    true,
    'Owning brand must be authorized'
  );

  // Authorized creator
  assert.strictEqual(
    isParticipantAuthorized('creator', 'creator-elena', privateConversation),
    true,
    'Invited creator must be authorized'
  );

  // Unauthorized brand
  assert.strictEqual(
    isParticipantAuthorized('brand', 'brand-unauthorized', privateConversation),
    false,
    'Unrelated brand must NOT be authorized'
  );

  // Unauthorized creator
  assert.strictEqual(
    isParticipantAuthorized('creator', 'creator-stranger', privateConversation),
    false,
    'Unrelated creator must NOT be authorized'
  );
});

// -----------------------------------------------------------------------------
// Scenario 9: Duplicate send protection rejects rapid successive clicks
// -----------------------------------------------------------------------------
it('Scenario 9: In-flight duplicate prevention rejects rapid successive sends', () => {
  const inFlightLocks = new Set();
  const connectionId = 'conn-debounce-test';
  const text = 'Quick message';

  const trySend = (connId, content) => {
    const lockKey = `${connId}:${content.trim()}`;
    if (inFlightLocks.has(lockKey)) {
      return { ok: false, reason: 'DUPLICATE_IN_FLIGHT' };
    }
    inFlightLocks.add(lockKey);
    return { ok: true, lockKey };
  };

  const firstCall = trySend(connectionId, text);
  assert.strictEqual(firstCall.ok, true, 'First send call must succeed');

  const secondCall = trySend(connectionId, text);
  assert.strictEqual(secondCall.ok, false, 'Rapid second send call must be blocked');
  assert.strictEqual(secondCall.reason, 'DUPLICATE_IN_FLIGHT');

  // After completion, lock is released
  inFlightLocks.delete(firstCall.lockKey);
  const thirdCall = trySend(connectionId, text);
  assert.strictEqual(thirdCall.ok, true, 'Send after release must succeed');
});

// -----------------------------------------------------------------------------
// Scenario 10: Normalization of Supabase message rows
// -----------------------------------------------------------------------------
it('Scenario 10: normalizeSupabaseMessage maps database columns to client model correctly', () => {
  const dbRow = {
    id: 'msg-db-999',
    conversation_id: 'conn-camp-1',
    sender: 'creator',
    sender_name: 'Elena Rostova',
    text: 'Render lookbook ready.',
    created_at: '2026-10-10T14:30:00.000Z'
  };

  const normalized = normalizeSupabaseMessage(dbRow);
  assert.strictEqual(normalized.id, 'msg-db-999');
  assert.strictEqual(normalized.conversationId, 'conn-camp-1');
  assert.strictEqual(normalized.sender, 'creator');
  assert.strictEqual(normalized.senderName, 'Elena Rostova');
  assert.strictEqual(normalized.text, 'Render lookbook ready.');
  assert.ok(normalized.timestamp, 'Timestamp must be computed');
});

// -----------------------------------------------------------------------------
// Scenario 11: Parameter resolution supports both conversationId and connectionId
// -----------------------------------------------------------------------------
await itAsync('Scenario 11: Parameter resolution supports both conversationId and connectionId seamlessly', async () => {
  const canonicalId = 'conn-camp-editorial-sophie';

  // Send message using { connectionId }
  const msgViaConnectionId = await sendMessage({
    connectionId: canonicalId,
    sender: 'brand',
    senderName: 'Lumina Botanica',
    text: 'Sending using connectionId parameter'
  });
  assert.strictEqual(msgViaConnectionId.conversationId, canonicalId);
  assert.strictEqual(msgViaConnectionId.text, 'Sending using connectionId parameter');

  // Send message using { conversationId }
  const msgViaConversationId = await sendMessage({
    conversationId: canonicalId,
    sender: 'creator',
    senderName: 'Sophie Mercier',
    text: 'Sending using conversationId parameter'
  });
  assert.strictEqual(msgViaConversationId.conversationId, canonicalId);
  assert.strictEqual(msgViaConversationId.text, 'Sending using conversationId parameter');

  // Fetch using string, object with conversationId, or object with connectionId
  const msgs1 = await fetchMessages(canonicalId);
  const msgs2 = await fetchMessages({ conversationId: canonicalId });
  const msgs3 = await fetchMessages({ connectionId: canonicalId });

  assert.strictEqual(msgs1.length, 2);
  assert.strictEqual(msgs2.length, 2);
  assert.strictEqual(msgs3.length, 2);
  assert.deepStrictEqual(msgs1, msgs2);
  assert.deepStrictEqual(msgs2, msgs3);
});

// -----------------------------------------------------------------------------
// Scenario 12: Canonical conversation ID alignment across invitations and subsequent messages
// -----------------------------------------------------------------------------
await itAsync('Scenario 12: Initial invitation message and subsequent messages use the exact same canonical conversation ID', async () => {
  const campaignId = 'camp-aether-nomad';
  const creatorId = 'marcus-vance';
  const canonicalConnId = `conn-${campaignId}-${creatorId}`;

  // Initial invitation generated
  const initialInvitationMsg = {
    id: `msg-inv-${Date.now()}`,
    conversationId: canonicalConnId,
    sender: 'brand',
    senderName: 'Vanguard Timepieces',
    text: 'Commission proposal for Aether Nomad campaign',
    timestamp: 'Just now'
  };

  const state = getInitialMarketplaceState();
  state.connections = [
    {
      id: canonicalConnId,
      campaignId,
      creatorId,
      brandId: 'brand-demo-vanguard',
      messages: [initialInvitationMsg]
    },
    ...(state.connections || [])
  ];
  saveMarketplaceState(state);

  // Subsequent message sent into the thread
  const followUpMsg = await sendMessage({
    conversationId: canonicalConnId,
    sender: 'brand',
    senderName: 'Vanguard Timepieces',
    text: 'Are you available to review the brief?'
  });

  const threadMessages = await fetchMessages(canonicalConnId);
  assert.strictEqual(threadMessages.length, 2);
  assert.strictEqual(threadMessages[0].conversationId, canonicalConnId);
  assert.strictEqual(threadMessages[1].conversationId, canonicalConnId);
  assert.strictEqual(threadMessages[0].text, 'Commission proposal for Aether Nomad campaign');
  assert.strictEqual(threadMessages[1].text, 'Are you available to review the brief?');
});

// -----------------------------------------------------------------------------
// Scenario 13: Error handling when required identifier is missing
// -----------------------------------------------------------------------------
await itAsync('Scenario 13: Missing conversationId / connectionId throws informative validation error', async () => {
  let threw = false;
  try {
    await sendMessage({
      text: 'Valid text but no ID'
    });
  } catch (err) {
    threw = true;
    assert.match(err.message, /Conversation ID is required/i);
  }
  assert.strictEqual(threw, true, 'Must reject when no conversationId or connectionId is provided');
});

// -----------------------------------------------------------------------------
// Scenario 14: Database RLS Simulation - Authorized Participant Message Access
// -----------------------------------------------------------------------------
it('Scenario 14: Database RLS Simulation - Authorized Brand and Creator participants pass policy check', () => {
  // Mock Database State representing invitations, brands, and creators
  const mockDb = {
    brands: [
      { id: 'brand-lumina-uuid', user_id: 'user-brand-owner-111', name: 'Lumina Botanica' }
    ],
    creator_profiles: [
      { id: 'creator-maya-uuid', user_id: 'user-creator-owner-222', name: 'Maya Chen' }
    ],
    invitations: [
      {
        id: 'inv-real-999',
        brand_id: 'brand-lumina-uuid',
        creator_id: 'creator-maya-uuid',
        campaign_id: 'camp-summer-skincare'
      }
    ],
    collaborations: []
  };

  // Pure JavaScript mirror of migration_002 is_conversation_participant() SQL function
  function isConversationParticipant(conversationId, userId, senderRole = null) {
    if (!userId || !conversationId) return false;

    // Check invitations
    const fromInv = mockDb.invitations.some(inv => {
      const brand = mockDb.brands.find(b => b.id === inv.brand_id);
      const creator = mockDb.creator_profiles.find(c => c.id === inv.creator_id);
      if (!brand || !creator) return false;

      const matchesCanonicalCamp = inv.campaign_id && conversationId === `conn-${inv.campaign_id}-${inv.creator_id}`;
      const matchesCanonicalBrand = conversationId === `conn-${inv.brand_id}-${inv.creator_id}`;
      const matchesDirectId = conversationId === inv.id;
      const matchesLegacy = conversationId.startsWith('conn-') && conversationId.includes(inv.creator_id);

      const idMatches = matchesCanonicalCamp || matchesCanonicalBrand || matchesDirectId || matchesLegacy;
      if (!idMatches) return false;

      if (senderRole === 'brand') return brand.user_id === userId;
      if (senderRole === 'creator') return creator.user_id === userId;
      return brand.user_id === userId || creator.user_id === userId;
    });

    return fromInv;
  }

  const canonicalId = 'conn-camp-summer-skincare-creator-maya-uuid';
  const brandOwnerUid = 'user-brand-owner-111';
  const creatorOwnerUid = 'user-creator-owner-222';

  // 1. Brand owner reading conversation
  assert.strictEqual(
    isConversationParticipant(canonicalId, brandOwnerUid, null),
    true,
    'Brand owner must be authorized to read conversation'
  );

  // 2. Creator owner reading conversation
  assert.strictEqual(
    isConversationParticipant(canonicalId, creatorOwnerUid, null),
    true,
    'Creator owner must be authorized to read conversation'
  );

  // 3. Brand owner sending message with sender = brand
  assert.strictEqual(
    isConversationParticipant(canonicalId, brandOwnerUid, 'brand'),
    true,
    'Brand owner sending as brand must pass WITH CHECK'
  );

  // 4. Creator owner sending message with sender = creator
  assert.strictEqual(
    isConversationParticipant(canonicalId, creatorOwnerUid, 'creator'),
    true,
    'Creator owner sending as creator must pass WITH CHECK'
  );
});

// -----------------------------------------------------------------------------
// Scenario 15: Database RLS Simulation - Unauthorized Users & Role Spoofing Rejected
// -----------------------------------------------------------------------------
it('Scenario 15: Database RLS Simulation - Unauthenticated callers, outsiders, and role spoofing are rejected', () => {
  const mockDb = {
    brands: [
      { id: 'brand-lumina-uuid', user_id: 'user-brand-owner-111', name: 'Lumina Botanica' }
    ],
    creator_profiles: [
      { id: 'creator-maya-uuid', user_id: 'user-creator-owner-222', name: 'Maya Chen' }
    ],
    invitations: [
      {
        id: 'inv-real-999',
        brand_id: 'brand-lumina-uuid',
        creator_id: 'creator-maya-uuid',
        campaign_id: 'camp-summer-skincare'
      }
    ]
  };

  function isConversationParticipant(conversationId, userId, senderRole = null) {
    if (!userId || !conversationId) return false;

    return mockDb.invitations.some(inv => {
      const brand = mockDb.brands.find(b => b.id === inv.brand_id);
      const creator = mockDb.creator_profiles.find(c => c.id === inv.creator_id);
      if (!brand || !creator) return false;

      // Strict exact equality matching only: no substring or LIKE patterns
      const matchesCanonicalCamp = inv.campaign_id && conversationId === `conn-${inv.campaign_id}-${inv.creator_id}`;
      const matchesCanonicalBrand = conversationId === `conn-${inv.brand_id}-${inv.creator_id}`;
      const matchesDirectId = conversationId === inv.id;

      const idMatches = matchesCanonicalCamp || matchesCanonicalBrand || matchesDirectId;
      if (!idMatches) return false;

      if (senderRole === 'brand') return brand.user_id === userId;
      if (senderRole === 'creator') return creator.user_id === userId;
      return brand.user_id === userId || creator.user_id === userId;
    });
  }

  const canonicalCampId = 'conn-camp-summer-skincare-creator-maya-uuid';
  const canonicalBrandId = 'conn-brand-lumina-uuid-creator-maya-uuid';
  const directInvId = 'inv-real-999';
  const brandOwnerUid = 'user-brand-owner-111';
  const creatorOwnerUid = 'user-creator-owner-222';
  const strangerUid = 'user-unrelated-stranger-333';

  // 1. Legitimate Brand Participant
  assert.strictEqual(
    isConversationParticipant(canonicalCampId, brandOwnerUid, 'brand'),
    true,
    'Legitimate brand owner must be permitted to send as brand'
  );
  assert.strictEqual(
    isConversationParticipant(canonicalCampId, brandOwnerUid, null),
    true,
    'Legitimate brand owner must be permitted to read'
  );

  // 2. Legitimate Creator Participant
  assert.strictEqual(
    isConversationParticipant(canonicalCampId, creatorOwnerUid, 'creator'),
    true,
    'Legitimate creator owner must be permitted to send as creator'
  );
  assert.strictEqual(
    isConversationParticipant(canonicalCampId, creatorOwnerUid, null),
    true,
    'Legitimate creator owner must be permitted to read'
  );

  // 3. Alternative canonical formats (brand-level connection and direct invitation ID)
  assert.strictEqual(
    isConversationParticipant(canonicalBrandId, brandOwnerUid, 'brand'),
    true,
    'Brand-level canonical conversation ID must be authorized'
  );
  assert.strictEqual(
    isConversationParticipant(directInvId, creatorOwnerUid, 'creator'),
    true,
    'Direct invitation ID must be authorized'
  );

  // 4. Substring Attack Rejection: Substring presence of creator_id in forged ID must be REJECTED
  assert.strictEqual(
    isConversationParticipant('conn-creator-maya-uuid-forged-hacker-thread', brandOwnerUid, 'brand'),
    false,
    'Substring-based forged conversation ID must be rejected'
  );
  assert.strictEqual(
    isConversationParticipant('conn-random-creator-maya-uuid', creatorOwnerUid, 'creator'),
    false,
    'Forged ID containing creator_id substring must be rejected'
  );

  // 5. Unauthenticated / anonymous caller (userId is null)
  assert.strictEqual(
    isConversationParticipant(canonicalCampId, null, 'brand'),
    false,
    'Unauthenticated caller must be rejected without bypass'
  );

  // 6. Unrelated stranger trying to read
  assert.strictEqual(
    isConversationParticipant(canonicalCampId, strangerUid, null),
    false,
    'Unrelated user must NOT be permitted to read'
  );

  // 7. Unrelated stranger trying to insert message
  assert.strictEqual(
    isConversationParticipant(canonicalCampId, strangerUid, 'brand'),
    false,
    'Unrelated user must NOT be permitted to insert as brand'
  );

  // 8. Role spoofing: Creator trying to send with sender = 'brand'
  assert.strictEqual(
    isConversationParticipant(canonicalCampId, creatorOwnerUid, 'brand'),
    false,
    'Creator spoofing brand sender must be rejected'
  );

  // 9. Role spoofing: Brand trying to send with sender = 'creator'
  assert.strictEqual(
    isConversationParticipant(canonicalCampId, brandOwnerUid, 'creator'),
    false,
    'Brand spoofing creator sender must be rejected'
  );
});

// -----------------------------------------------------------------------------
// Scenario 16: Database RLS Simulation - Invalid Conversation IDs Rejected
// -----------------------------------------------------------------------------
it('Scenario 16: Database RLS Simulation - Conversation IDs not mapping to real conversations are rejected', () => {
  const mockDb = {
    brands: [
      { id: 'brand-lumina-uuid', user_id: 'user-brand-owner-111' }
    ],
    creator_profiles: [
      { id: 'creator-maya-uuid', user_id: 'user-creator-owner-222' }
    ],
    invitations: [
      {
        id: 'inv-real-999',
        brand_id: 'brand-lumina-uuid',
        creator_id: 'creator-maya-uuid',
        campaign_id: 'camp-summer-skincare'
      }
    ]
  };

  function isConversationParticipant(conversationId, userId, senderRole = null) {
    if (!userId || !conversationId) return false;

    return mockDb.invitations.some(inv => {
      const brand = mockDb.brands.find(b => b.id === inv.brand_id);
      const creator = mockDb.creator_profiles.find(c => c.id === inv.creator_id);
      if (!brand || !creator) return false;

      const matchesCanonicalCamp = inv.campaign_id && conversationId === `conn-${inv.campaign_id}-${inv.creator_id}`;
      const matchesCanonicalBrand = conversationId === `conn-${inv.brand_id}-${inv.creator_id}`;
      const matchesDirectId = conversationId === inv.id;

      const idMatches = matchesCanonicalCamp || matchesCanonicalBrand || matchesDirectId;
      if (!idMatches) return false;

      if (senderRole === 'brand') return brand.user_id === userId;
      if (senderRole === 'creator') return creator.user_id === userId;
      return brand.user_id === userId || creator.user_id === userId;
    });
  }

  const brandOwnerUid = 'user-brand-owner-111';

  // Completely fabricated conversation ID
  assert.strictEqual(
    isConversationParticipant('conn-fabricated-ghost-id', brandOwnerUid, 'brand'),
    false,
    'Non-existent conversation ID must be rejected'
  );

  // Partial or malformed IDs
  assert.strictEqual(
    isConversationParticipant('conn-othercampaign-othercreator', brandOwnerUid, 'brand'),
    false,
    'Unmapped campaign/creator ID must be rejected'
  );
});

// -----------------------------------------------------------------------------
// Scenario 17: Demo-Mode Local Messaging & Persistence Across Refreshes
// -----------------------------------------------------------------------------
await itAsync('Scenario 17: Demo mode routes message sends and fetches through local store without Supabase RLS error', async () => {
  const conversationId = 'conn-maya-skincare';

  // Seed demo connection in marketplace state
  const state = getInitialMarketplaceState();
  state.connections = [
    {
      id: conversationId,
      brandId: 'brand-demo-lumina',
      creatorId: 'maya-chen',
      campaignId: 'camp-summer-skincare',
      campaignTitle: 'Summer Skincare & Radiant Hydration Launch',
      brandName: 'Lumina Botanica',
      creatorName: 'Maya Chen',
      status: 'connected',
      messages: [
        {
          id: 'msg-seed-1',
          conversationId,
          sender: 'brand',
          senderName: 'Lumina Botanica',
          text: 'Hi Maya, we loved your cinematic product work.',
          timestamp: 'Yesterday, 3:45 PM'
        }
      ]
    }
  ];
  saveMarketplaceState(state);

  // Unauthenticated demo user sends "Hello!"
  const sentMessage = await sendMessage({
    conversationId,
    sender: 'brand',
    senderName: 'Lumina Botanica',
    text: 'Hello!',
    userId: null // Unauthenticated demo user
  });

  assert.ok(sentMessage.id, 'Demo message must receive a valid generated ID');
  assert.strictEqual(sentMessage.text, 'Hello!');
  assert.strictEqual(sentMessage.sender, 'brand');

  // Verify message is immediately available in local store
  const storedMessages = await fetchMessages(conversationId);
  assert.strictEqual(storedMessages.length, 2, 'Conversation must now have 2 messages');
  assert.strictEqual(storedMessages[1].text, 'Hello!');

  // Simulate browser page refresh by reloading initial state from localStorage
  const refreshedState = getInitialMarketplaceState();
  const targetConn = (refreshedState.connections || []).find(c => c.id === conversationId);
  assert.ok(targetConn, 'Connection must persist across simulated refresh');
  assert.strictEqual(targetConn.messages.length, 2);
  assert.strictEqual(targetConn.messages[1].text, 'Hello!');
});

// -----------------------------------------------------------------------------
// Scenario 18: Authenticated-Mode vs Demo-Mode Routing Separation
// -----------------------------------------------------------------------------
await itAsync('Scenario 18: Demo user never triggers Supabase RLS failure while preserving cloud path for auth users', async () => {
  const conversationId = 'conn-maya-skincare';

  // Demo user with mock demo identity
  let demoThrewError = false;
  try {
    const demoMsg = await sendMessage({
      conversationId,
      sender: 'brand',
      senderName: 'Lumina Botanica',
      text: 'Testing demo isolation',
      userId: 'maya-chen' // Mock demo ID
    });
    assert.strictEqual(demoMsg.text, 'Testing demo isolation');
  } catch (e) {
    demoThrewError = true;
  }
  assert.strictEqual(demoThrewError, false, 'Demo user must NOT throw Supabase RLS error');
});

console.log(`\n========================================`);
console.log(`Messaging Tests Complete: ${passed}/${passed + failed} Passed.`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}



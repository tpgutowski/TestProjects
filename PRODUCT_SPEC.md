# Meme Smash Product Blueprint

## Vision & Core Loop
- **Concept:** Upload memes, swipe to vote between pairs, climb a live leaderboard. One-second loop → dopamine hit → next duel.
- **1-Second Interaction Cycle:** Pre-fetch next pair; auto-animate cards on swipe; haptic tap + color flash.
- **Variable Rewards:** Live rank shuffles, surprise badge drops, streak chests with randomized contents.
- **Endowment Effect:** Creator dashboards with ownership stats, push alerts when your meme gets challenged, “Defend Your Meme” quick-join button.
- **Social Status Cues:** Tiered badges (Bronze → Diamond → Mythic), crown emoji for current top 1%, animated podium for Top 3.
- **FOMO Mechanics:** Daily reset of streak multiplier, weekly leaderboard seasons, limited-time boosts, expiring streak shields.
- **Self-Expression:** 10-second meme maker with templates, bold fonts, stickers, and speed presets.

## Visual & Interaction Style (Neo-Brutalism)
- **Palette:** Mint (#9FF7E1), Hot Pink (#FF5FA2), Teal (#36D7B7), Lavender (#C8B2FF), Canary (#FFF275), Onyx outlines (#0E0E0E).
- **Typography:** Extra-bold grotesk (e.g., Space Grotesk / Sora). Oversized headings (32–48pt), compact captions (12–14pt) in uppercase.
- **Shape Language:** Thick 3–4px black strokes, chunky drop shadows, blocky cards, pill buttons with hard edges.
- **Animations:**
  - **Swipe Accept (Right):** 120ms scale-up + confetti burst, ease-out.
  - **Swipe Reject (Left):** 90ms micro-shake (±6px) + desat tint, ease-in-out.
  - **Leaderboard Rank-Up:** 300ms bounce + color flash.
  - **Button Press:** 60ms squash + 20ms rebound with subtle haptic.

## Screens & UX Flows
### Onboarding (10s Shortcut)
1. Splash → bold “SMASH MEMES” CTA.
2. Username picker (auto-suggest fun handles).
3. Mini tutorial: swipe 3 sample duels → instant feedback.
4. Optional avatar select; no email required. Persist anonymous UID.

### Home / Voting
- Two meme cards stacked with asymmetrical tilt; swipe right/left to vote.
- **HUD:** XP bar, streak badge, boost timer, coin count, heart for streak shield.
- **Feedback:** Flash mint for right, lavender for left, haptic; quick “+XP”, “+Streak” toasts.
- **Next Pair:** Pre-loaded; 1s loop goal. Tap to open meme details (creator, rank trajectory).

### Leaderboard
- Block rows with thick outlines, rank badge chips, emoji crowns.
- Tabs: **Global**, **Friends**, **This Week**.
- Seasonal reset banner with countdown; “Re-climb” CTA.
- Tap row → meme detail + “Share Winner Card”.

### Upload / Create Meme
- Steps: choose image (camera, gallery) or template → add text (limited bold fonts) → optional sticker → preview.
- Speed presets: “Blitz (15s)”, “Normal (30s)”.
- Compression before upload; show predicted queue time.

### Profile
- Stats grid: Wins, Upvotes, Streak, ELO.
- Progress bar for XP tier; badge shelf (collectibles + seasonal cosmetics).
- Recent memes with status (Active, Boosted, Expiring).
- Buttons: “Boost Meme”, “Create Meme”, “Share Profile”.

### Viral Growth
- Winner Cards: auto-generated image with rank, title, badge, QR/referral link.
- Referral ladder: invite → unlock exclusive templates at 3, 10, 25 joins.
- Anonymous voting by default; creators revealed on share cards/profile.

## Copywriting (Punchy & Short)
- CTAs: “SMASH”, “BOOST”, “DROP MEME”, “DEFEND”, “GO AGAIN”, “CLAIM”, “SHARE WINNER”.
- Empty states: “No duels? We’re cooking fresh battles.” / “Boost to climb now.”
- Toasts: “+1 STREAK!”, “RANK UP!”, “SHIELD SAVED YOUR STREAK”.

## Gamification & Economy
- **ELO Scoring:**
  - Each duel updates meme ELO; K-factor 32; new memes start at 1200.
  - Rank tiers map to ELO bands (Bronze <1200, Silver 1200–1399, Gold 1400–1599, Diamond 1600–1899, Mythic 1900+).
- **Streaks:** +5% ELO gain per consecutive win; streak shield consumable prevents first loss daily.
- **Boosts:** 24h visibility multiplier; stackable up to 2x. Paid or earned via streak chests.
- **XP & Leveling:** Votes earn 5 XP; wins on owned meme earn 15 XP; level unlocks stickers/templates.
- **Daily Reset:** Streak resets at midnight UTC; daily quests (vote 20, upload 1, share 1) grant loot chest.
- **Variable Rewards:** Mystery chests drop every 10 wins with randomized contents (boost, XP, cosmetics).

## Component Library (React Native)
- **Atoms:** BrutalButton, PillBadge, StrokeCard, AvatarChip, ProgressBar, OutlineInput, IconBlob.
- **Molecules:** MemeCard (image, outline, stats), DuelStack (two MemeCards + swipe layer), ToastBanner, RankRow, BadgeShelf, BoostTimer.
- **Organisms:** VotingDeck, LeaderboardList, MemeCreator, ProfileHeader, OnboardingFlow.
- **Theme:** central `theme.ts` with palette, stroke widths, spacing grid (4/8/12/16), radii (0/8/16), typography scales.

## Technical Architecture
- **Client:** React Native (Expo) with Reanimated for gestures, Zustand for state, TanStack Query for data, Lottie for bursts.
- **Backend:** Firebase (Auth anon+username, Firestore for memes/votes, Functions for ELO + ranking, Cloud Storage for images, FCM for push).
- **CDN:** Firebase Storage + CDN; client-side compression via `expo-image-manipulator`.
- **Real-time:** Firestore listeners for leaderboard and meme stats; Functions scheduled job for weekly resets.
- **Analytics:** Firebase Analytics + Amplitude-style events: `vote_cast`, `meme_uploaded`, `boost_started`, `streak_reset`.

## Data Model (Firestore)
- `users/{uid}`: { username, avatar, badges[], streakCount, xp, level, elo, tier, boosts[], createdAt }
- `memes/{memeId}`: { ownerUid, title, imageUrl, templateId, elo, wins, losses, boosts[], seasonRank, createdAt }
- `duels/{duelId}`: { memeAId, memeBId, expiresAt, createdAt }
- `votes/{voteId}`: { duelId, voterUid (optional), winnerMemeId, loserMemeId, createdAt }
- `seasons/{seasonId}`: { startAt, endAt, resetApplied }
- `templates/{templateId}`: { name, imageUrl, premium, unlockedAtLevel }
- `referrals/{referralCode}`: { ownerUid, joinedUids[] }

## Backend Logic
- **Create Duel:** Function selects two memes near ELO; avoids same owner; caches next duels.
- **Vote Handler:** Updates wins/losses, ELO, streak XP; emits push to meme owners; stores vote.
- **Leaderboard:** Query top ELO; weekly season snapshot stored; reset job demotes tiers with comeback bonus.
- **Boosts:** Function multiplies matchmaking weight for boosted memes; expires after 24h.
- **Anti-Abuse:** Rate-limit votes per IP/uid, detect collusion (same pair repeated), NSFW detection on upload.

## Animations & Haptics (Specs)
- **Swipe Right:** 120ms → scale 1.0→1.05, rotate 2°, confetti Lottie, haptic medium.
- **Swipe Left:** 90ms → micro-shake: translateX ±6px at 0,30,60ms; desaturate overlay; haptic light.
- **Rank-Up:** 300ms → scale 1.1→1.0 bounce, background flash to Canary; haptic success.
- **Button Tap:** 60ms squash Y 0.96 + 20ms rebound; haptic impact light.

## User Flows
- **New User → Voting:** Open app → choose username → 3 tutorial swipes → land on voting deck with streak seed of 1.
- **Upload Meme:** Profile → “Drop Meme” → pick source/template → add text → preview → compress/upload → immediate duel placement.
- **Boost Meme:** From Profile or Meme detail → select meme → choose 1x or 2x boost → pay (IAP) → timer and badge appear.
- **Share Winner Card:** From leaderboard row or meme detail → generate share image → native share sheet → optional referral code embed.

## Monetization
- **Boosts:** IAP for 24h 2x visibility; also earn via streak chests.
- **Pro Creator Pack:** Unlock premium fonts/stickers/templates; monthly sub.
- **Ad Removal:** One-time purchase removes interstitials between duels.
- **Seasonal Cosmetics:** Frames/badges tied to tier finish; purchasable recolors.

## Deployment Plan (MVP)
- **Week 1:** Implement voting deck with swipe, ELO updates via Functions, basic leaderboard (global), meme upload/compress, anon auth, username set.
- **Week 2:** Add boosts, shareable winner cards, badge shelf, referral unlocks, daily quests/streak shields.
- **Release:** Expo EAS build; staged rollout; feature flags for monetization.

## Risks & Mitigations
- **Content Safety:** Use Vision API moderation; flag queue with human review tooling.
- **Latency:** Prefetch duels and images; CDN caching; optimistic UI for votes.
- **Cheating:** Device fingerprinting, velocity checks, collusion detection, challenge CAPTCHA on anomalies.

## Metrics
- D1/D7 retention, avg session length, votes per session, uploads per user, boost attach rate, streak completion, share conversion.

## Future Ideas
- Squad battles (team queues), live tournaments, AR meme frames, creator tipping, seasonal narratives.

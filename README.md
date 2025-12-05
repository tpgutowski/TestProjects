# MemeSmash

A Neo-Brutalist prototype for **Meme Smash**, a social meme voting game with 1-second swipe loops, live leaderboard hype, and creator tools.

## Quick start

No build step required. Open `index.html` in your browser (or serve the folder with any static server) to experience the prototype interactions:

```bash
# Optionally serve from a simple HTTP server
python -m http.server 8000
# then visit http://localhost:8000
```

## What’s included
- Home/Voting flow with instant feedback and shake animation on rejected memes
- Live leaderboard preview with badges
- Upload/remix card with overlay text feedback
- Profile stats, XP bar, streak tracker, and collectible badges
- Onboarding micro-flow with username capture and welcome feedback

## Next steps
- Replace inline SVG placeholders with user-uploaded images + CDN delivery
- Wire voting + leaderboard to a real-time backend (Supabase/Firebase) using an ELO-style rating update
- Persist streaks, boosts, and badges to user accounts
- Add shareable “winner cards” for Top 10 memes

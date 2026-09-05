# Rumbo

A WhatsApp-style chat that casually talks with someone about their day
to day, infers their skills without asking directly, and at the end
suggests 2-3 career directions, each with an explicit confidence level.

Vacuum attacked: Trajectory (Week 4, Twin Sparrows).
Role: Operator.

## Run locally

```bash
npm install
cp .env.example .env.local
# put your real GEMINI_API_KEY inside .env.local
npm run dev
```

Open http://localhost:3000

## Note on the data

The career directions and their "confidence" come from the live
language model. The market/pay data behind each direction is
simulated for this demo, as required by the ship brief.

## Security (course security floor)

- The API key only lives in Vercel's environment variables, never in
  the code or the repo.
- No real personal user data is stored; this demo uses no database and
  no authentication.
- User input has a length limit (500 characters) before it is sent to
  the model.

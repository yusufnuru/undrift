Items:

- [x] Improve dashboard UI usking skill
- [x] Time tracking dashboard - is it actually working correctly with graphs? All I see is one
- [] What does days focused mean and how is it calculated?
- [] Personalized Plan: AI feature (BYOK)
- [x] Clean up commits
- [] Clean up vibe coded slop
- [x] Clean up comments
- [] Create a new name
- [] Open source it
- [] Modify Focus Duration
- [] Introduce "points" system
- [] Introduce gamification and rewards
- [x] Sites like Youtube.com/hash should only count YouTube
- [] What happens on Save Reason
- [] What happens on notification preferences
- [] Optimize the code

Bugs:

- [] Blocked page sends LOG_BREATHE but background has no handler, so breathe events are never recorded
- [] Blocked page SAVE_REFLECTION payload doesn't match background handler (sends data.\* but handler expects message.text), so reflections are lost
- [] Blocked page LOG_INTERRUPTION includes outcome but background ignores it, so outcome is always "stayed"
- [] Popup expects GET_STATS.interruptionsResisted but background doesn't return it, so it shows 0/undefined

Future Features:

- [] Community

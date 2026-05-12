---
name: voice-transcription
description: Transcribe voice messages using Whisper (@xenova/transformers).
  Load when a user sends a voice note or audio file.
---

# Voice Message Transcription

When you receive a message with an audio attachment (`.ogg`, `.mp3`, `.m4a`, `.opus`), transcribe it automatically before responding.

## How to transcribe

The audio file is at the path shown in the message (e.g. `/workspace/attachments/attachment-TIMESTAMP.ogg`).

```bash
node -e "
const { pipeline } = require('@xenova/transformers');
(async () => {
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small');
  const result = await transcriber('/workspace/attachments/FILENAME.ogg');
  console.log(result.text);
})();
"
```

Replace `FILENAME.ogg` with the actual filename from the attachment path.

## Notes
- First run downloads the model (~150MB) and caches it — subsequent calls are fast.
- `whisper-small` is accurate for most languages. Use `whisper-tiny` for speed.
- If the file is `.ogg` (WhatsApp voice), it works directly — no conversion needed.
- Always respond to the transcribed text, not the file path.

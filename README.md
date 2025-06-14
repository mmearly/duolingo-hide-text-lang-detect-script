# Duolingo Hide Text & Language Detection Script
This is a Chrome extension I put together to make Duolingo a better tool for me. It does three things:
- In translation exercises from the target language, hides the target language text, forcing you to translate based only on the audio to get listening practice. Clicking on the hidden text will cause it to be revealed.
- Call a language detection API to check that the language you are typing in is the language expected for the given exercise.
- In translation exercises from the target language, add the source text's sentence-final punctuation to the end of Duolingo's instructions. (In my experience the TTS doesn't reliably give different intonations for questions and statements, so I needed some visual indicator if the thing to translate was a question or a statement.)

This was mostly vibe coded and can definitely be improved (it's a little janky)! I have no intention of maintaining this or adding more features, feel free to fork and do whatever you want with this.

# How to use:
1. Clone the repo
2. Sign up for an API key with detectlanguage.com and set that for the value of DETECT_LANG_API_KEY in contentScript.js.
3. Also in contentScript.js, change the argument passed into findTargetLangText() to have a list of languages whose text you want to hide. Use ISO 639 language codes. By default Hungarian, Japanese, and Esperanto are enabled.
4. Save your changes, go to chrome://extensions, select Load unpacked, and select your folder.

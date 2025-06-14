
(() => {

    // This is a private key!
    const DETECT_LANG_API_KEY = '';
    // Get your own API key at https://detectlanguage.com/users/sign_up
    // For usage: https://detectlanguage.com/private
    // For documentation: https://detectlanguage.com/documentation#intro

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value } = obj;

        if (type === "NEW") {
            newDuolingoTab();
        }
    });


    // Store references to created overlays
    let activeOverlays = [];
    let observer; // Store MutationObserver reference
    let activeCueSpans = [];

    function findTargetLangText(languageCodes) {
        // Temporarily disconnect MutationObserver to prevent loops
        if (observer) observer.disconnect();

        // Remove all old overlays before adding new ones
        activeOverlays.forEach(overlay => overlay.remove());
        activeOverlays = []; // Reset the array

        // Clean up the cues before adding new ones
        activeCueSpans.forEach(cue => cue.remove());
        activeCueSpans = [];

        // Construct a selector that matches any language in the list
        // The span with the class _5HFLU is the wrapper around the stimulus text for translation activities
        const languageSelector = languageCodes.map(code => `span._5HFLU[lang="${code}"]`).join(", ");

        // Find all target text spans and create overlays
        document.querySelectorAll(languageSelector).forEach(span => {
            // The span actually contains children for each word 
            // Skip if there are any new words here (marked with class _1ELE3)
            if (span.querySelector("._1ELE3")) {
                console.log("Found a new word; skipping");
                return;
            }

            console.log("I found text to hide!");

            // Get the exact position of the span
            const rect = span.getBoundingClientRect();

            // console.log("Span position:", rect);

            // Create the gray rectangle (div)
            const overlay = document.createElement("div");
            overlay.classList.add("text-overlay");

            // Style the overlay
            Object.assign(overlay.style, {
                position: "absolute",
                backgroundColor: "gray",
                width: `${rect.width}px`,  
                height: `${rect.height}px`, 
                top: `${rect.top + window.scrollY}px`,  
                left: `${rect.left + window.scrollX}px`,
                zIndex: "1000",
                pointerEvents: "auto",
                cursor: "pointer"
            });

            // console.log("Overlay position:", overlay.style.top, overlay.style.left); // Debugging log

            // Toggle visibility on click
            overlay.addEventListener("click", () => {
                overlay.style.opacity = overlay.style.opacity === "0" ? "1" : "0";
            });

            // Add the overlay to the document body
            document.body.appendChild(overlay);
            
            // Store reference for later cleanup
            activeOverlays.push(overlay);

            // Add the punctuation cue
            // H1 with the class _3EOK0 is the instructions in bold at the top, e.g. "Write this in English"
            const header = document.querySelector("h1._3EOK0");
            if (header) {
                const cue = document.createElement("span");
                cue.classList.add("hidden-text-cue");          // purely semantic
                const lastChar = span.textContent.trim().slice(-1);
                cue.textContent = lastChar;

                // Only add if it's punctuation
                if (lastChar == '.' || lastChar == '!' || lastChar == '?'){
                    // No styling needed—the header already styles its children
                    header.appendChild(cue);
                    activeCueSpans.push(cue);
                }
            }
        });

        // Reconnect the observer after changes are done
        if (observer) observer.observe(document.body, { childList: true, subtree: true });
    }

    const newDuolingoTab = () => {
        console.log("I detected a duolingo tab!");
        if (observer) observer.disconnect(); // Ensure no duplicate observers

        observer = new MutationObserver(() => {
            findTargetLangText(["hu", "ja", "eo"]); // TODO: change these to the ISO 639 language codes you want to hide!
        });

        observer.observe(document.body, { childList: true, subtree: true });
        
    }

    newDuolingoTab();


    /*  <<< NEW BLOCK: capture Enter key & show textarea content >>> */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            // Skip synthetic events to avoid infinite loop
            if (!e.isTrusted) return;

            // Look for textarea with one of the target classes
            const textarea = document.querySelector(
                "textarea.\\32 OQj6, textarea._3zGeZ, textarea.\\33 94fY, textarea.RpiVp"
            );
            if (textarea) {
                e.preventDefault();
                e.stopImmediatePropagation();

                const expectedLang = textarea.getAttribute("lang");
                console.log("Expected language:", expectedLang);

                const abtController = new AbortController();
                const timeout = setTimeout(() => {
                    abtController.abort();  // Cancel the request if it takes too long
                }, 3000); 

                console.log("Starting lang detection");
                console.log("Before API call");
                fetch("https://ws.detectlanguage.com/0.2/detect", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${DETECT_LANG_API_KEY}`,
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({ q: textarea.value }).toString()
                })
                .then(res => {
                    clearTimeout(timeout); 
                    return res.json();
                })
                .then(data => {
                    console.log("Detected language data:", data);
                    console.log("Finished the API call");
                    const detections = data?.data?.detections;
                    if (!detections || detections.length === 0 || !detections[0].language) {
                        console.error("Could not parse language detection API response!");
                    } else {
                        const topDetection = detections[0].language;
                        console.log("Detected this language:", topDetection);
                        if (expectedLang !== topDetection){
                            alert("Language detection error! Expected " + expectedLang + " but got " + topDetection + ". To overwrite submit by clicking check button instead of pushing enter.");
                            // Return to prevent the enter key from being replayed
                            return;
                        }
                    }

                    const newEnter = new KeyboardEvent("keydown", {
                        key: "Enter",
                        code: "Enter",
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                    });
                    textarea.dispatchEvent(newEnter);

                })
                .catch(err => {
                    console.error("Language detection failed:", err);

                    const newEnter = new KeyboardEvent("keydown", {
                    key: "Enter",
                    code: "Enter",
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                    cancelable: true
                    });
                    textarea.dispatchEvent(newEnter);
                });           

            }
        }
    });
})();

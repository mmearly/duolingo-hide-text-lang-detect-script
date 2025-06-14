chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("duolingo.com/lesson")) {
  
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
      });
    }
  });
  
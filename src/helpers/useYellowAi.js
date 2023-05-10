import { useEffect, useState } from "react";
import { useStore } from "src/store";

import { getYmConfig, runChatbot } from "src/helpers/yellow";
import { getHelpCenterUrl } from "src/helpers/string";

export const useYellowAI = () => {
  const isChatLoaded = useStore((state) => state.ischatLoaded);
  const setChatLoaded = useStore((state) => state.setLoaded);
  const [isBotConnected, setBotConnected] = useState(0);

  /** install chatbot */
  const initChatbot = () => {
    runChatbot();
    setChatLoaded(true);
  };

  const showChatBot = () => {
    // when opened in mobile browser somehow the `hideBranding` config is undefined
    // might caused by race condition since adding this setTimeout resolve the error
    setTimeout(() => {
      window.YellowMessengerPlugin.show();
      window.YellowMessengerPlugin.openBot();
    }, 100);
  };

  /** trigger to open chat bot */
  const openChatBot = (reload) => {
    if (reload) {
      window.YellowMessengerPlugin.init(getYmConfig());
    } else if (isChatLoaded) {
      showChatBot();
    } else {
      initChatbot();
    }
  };

  /** listener for yellow message event */
  const messageListener = (eventData) => {
    if (typeof eventData.data === "string") {
      const evntData = JSON.parse(eventData.data);

      // log console on dev mode
      console.log("eventData", evntData);

      /** Check incoming eventData
       * as flag when zendesk webview timeout triggered */
      if (evntData?.data?.data?.code === "reload-chatbot-widget") {
        openChatBot(true);
      }

      /** trigger open bot window when bot already opened, rather than using timeout */
      if (evntData?.event_code === "connected") {
        setBotConnected(Date.now());
      }

      /** handle custom event when clicking article card */
      if (evntData?.event_code === "custom-event") {
        const code = evntData?.data?.data?.code;

        if (code === "cta-clicked") {
          const data = JSON.parse(evntData?.data?.data?.data || "");
          if (data.url) {
            const hcUrl = getHelpCenterUrl(data.url);
            window.open(hcUrl, "_blank");
          }
        }
      }
    }
  };

  /** action when bot event loaded, open the chat widget window */
  useEffect(() => {
    if (isBotConnected && isChatLoaded) {
      showChatBot();
    }
  }, [isBotConnected]);

  useEffect(() => {
    if (isChatLoaded && !window.openTime) {
      Object.assign(window, {
        manualBotReload() {
          openChatBot(true);
        },
        // hack to prevent double listeners
        openTime: Date.now(),
      });

      window.addEventListener("message", messageListener);
    }

    return () => {
      window.removeEventListener("message", messageListener);
      window.openTime = null;
    };
  }, [isChatLoaded]);

  return {
    openChatBot,
  };
};

/* eslint-disable no-use-before-define */
import { useEffect, useState } from "react";
import { useStore } from "src/store";

import { getYmConfig, runChatbot } from "src/helpers/yellow";
import { getBooleanPayload } from "src/helpers/amplitude/experiments";
import { YELLOW_CHAT_BOT_TOGGLE } from "src/consts/amplitude-experiments";
import { getHelpCenterUrl } from "src/helpers/string";

const BUTTON_COVER_ID = "button-cover-id";

export const useYellowAI = (config = {}) => {
  const { onClose = () => {}, isCovering } = config;

  const isChatLoaded = useStore((state) => state.ischatLoaded);
  const setChatLoaded = useStore((state) => state.setLoaded);
  const [isBotConnected, setBotConnected] = useState(0);

  const yellowAiEnabled = getBooleanPayload(YELLOW_CHAT_BOT_TOGGLE);

  /** Inject button to sniff close event in the chat widget */
  const injectCloseButtonCover = () => {
    // Will not add close button if
    // - no onClose callback, or
    // - button cover/ listener already exist
    if (!onClose || document.getElementById(BUTTON_COVER_ID)) return;

    try {
      const iframeContainer = document.getElementById("ymIframe");
      const iframeDOM = iframeContainer.contentDocument;

      const buttonContainer = iframeDOM
        .getElementById("chatDetails")
        .getElementsByClassName("flex-button-group")[0];

      // cover the close button if isCovering true,
      // otherwise just put the onClose callback on mouse up event and
      // the default chat behavior that close and show button will persist
      if (isCovering) {
        const buttonCover = document.createElement("button");
        buttonCover.id = BUTTON_COVER_ID;
        buttonCover.setAttribute(
          "style",
          "position:absolute;inset:0;padding:0;height:100%;width:100%;background:transparent"
        );
        buttonCover.onclick = onClose;
        buttonContainer.appendChild(buttonCover);
      } else {
        buttonContainer.onmouseup = onClose;
      }
    } catch (error) {
      setTimeout(() => {
        injectCloseButtonCover();
      }, 500);
    }
  };

  /** initiate or reinitiate chatbot */
  const initChatbot = () => {
    try {
      runChatbot();
      setChatLoaded(true);
    } catch (error) {
      // sometimes init is not defined, rerun function when thats error happened
      setTimeout(() => {
        initChatbot();
      }, 500);
    }
  };

  const showChatBot = () => {
    // when opened in mobile browser somehow the `hideBranding` config is undefined
    // might caused by race condition since adding this setTimeout resolve the error
    setTimeout(() => {
      window.YellowMessengerPlugin.show();
      window.YellowMessengerPlugin.openBot();
      injectCloseButtonCover();
    }, 100);
  };

  /** trigger to open chat bot */
  const openChatBot = (reload) => {
    console.log(yellowAiEnabled);
    console.log(isChatLoaded);
    if (!yellowAiEnabled) return;
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

      /** trigger open bot window when bot already opened, rather than using timeout */
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

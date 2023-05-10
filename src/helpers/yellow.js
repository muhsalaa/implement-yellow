import { v4 as uuidv4 } from "uuid";

const YMAUTH_GUEST_KEY = "ym-auth-guest";
const BOT_ID_KEY = "bot-id";
/**
 * get storage data sent from mobile
 * might be removed later if mobile sdk implemented
 */
const getStoragePayload = () => {
  const storagePayload = {
    flip_jwt_token: localStorage.getItem("token"),
    zendesk_jwt_token: localStorage.getItem("zendesk_jwt_token"),
    user_id_flip: localStorage.getItem("user_id_flip"),
    timeout: 60,
  };
  return storagePayload;
};

const getUniqueId = () => {
  const id = localStorage.getItem(YMAUTH_GUEST_KEY);

  if (id) {
    return id;
  }

  const newId = uuidv4();
  localStorage.setItem(YMAUTH_GUEST_KEY, newId);
  return newId;
};

export const getYmConfig = () => {
  const storagePayload = getStoragePayload();
  if (parseInt(storagePayload.user_id_flip)) {
    return {
      payload: storagePayload,
      ymAuthenticationToken: storagePayload.user_id_flip,
      setDisableActionsTimeout: true,
    };
  }

  return {
    ymAuthenticationToken: getUniqueId(),
    setDisableActionsTimeout: true,
    payload: { timeout: 60 },
  };
};

/**
 * setup yellow ai config and polyfill
 */
export const yellowInit = () => {
  // default to x1670310721294
  // to add different bot id just set it in local storage manually
  const NEXT_PUBLIC_YELLOW_BOT_ID =
    localStorage.getItem(BOT_ID_KEY) || "x1670310721294";

  window.ymConfig = {
    bot: NEXT_PUBLIC_YELLOW_BOT_ID,
    host: "https://r2.cloud.yellow.ai",
    hideChatButton: true,
    alignLeft: false,
    ...getYmConfig(),
  };

  // add flat polyfill to suppress error on chrome 68<
  // Reference: Query on chatGPT "please provide polyfill array flat in javascript"
  if (!Array.prototype.flat) {
    Array.prototype.flat = function (depth = 1) {
      if (this === void 0 || this === null) {
        throw new TypeError();
      }

      var arr = [];
      (function flat(a, d) {
        for (var i = 0; i < a.length; i++) {
          if (Array.isArray(a[i]) && d < depth) {
            flat(a[i], d + 1);
          } else {
            arr.push(a[i]);
          }
        }
      })(this, 0);
      return arr;
    };
  }
};

/**
 * run initial script injector to fetch web widget
 */
export const runChatbot = () => {
  (function () {
    var w = window,
      ic = w.YellowMessenger;
    if ("function" === typeof ic)
      ic("reattach_activator"), ic("update", window.ymConfig);
    else {
      var d = document,
        i = function () {
          i.c(arguments);
        };
      // eslint-disable-next-line no-inner-declarations
      function l() {
        var e = d.createElement("script");
        (e.type = "text/javascript"),
          (e.defer = !0),
          (e.src =
            "https://cdn.yellowmessenger.com/plugin/widget-v2/latest/dist/main.min.js");
        var t = d.getElementsByTagName("script")[0];
        t.parentNode.insertBefore(e, t);
      }
      (i.q = []),
        (i.c = function (e) {
          i.q.push(e);
        }),
        (w.YellowMessenger = i),
        l();
    }
  })();
};

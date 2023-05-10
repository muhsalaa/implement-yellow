export const logger = (config) => (set, get, api) =>
  config(
    (args) => {
      const prevState = get();
      const action = args;
      set(args);
      const nextState = get();

      if (process.env.NODE_ENV === "development") {
        console.groupCollapsed(
          `%c---------- %cZUSTAND UPDATE LOG %c@ ${new Date().toLocaleTimeString(
            "en-US",
            {
              hour12: false,
            }
          )} ----------`,
          "color: #a0a0a0",
          "font-weight: bold",
          "color: #a0a0a0"
        );
        console.log(
          "%cprev state",
          "color: #a0a0a0; font-weight: bold",
          prevState
        );
        console.log(
          "%caction    ",
          "color: #33aaf4; font-weight: bold",
          action
        );
        console.log(
          "%cnext state",
          "color: #4eb053; font-weight: bold",
          nextState
        );
        console.groupEnd();
      }
    },
    get,
    api
  );

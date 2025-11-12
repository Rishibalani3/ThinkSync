const isDev = process.env.NODE_ENV !== "production";

export const log = (...args) => {
  if (isDev) console.log(...args);
};

export const error = (...args) => {
  console.error(...args);
};

import mongoSanitize from "express-mongo-sanitize";

function sanitizeInPlace(obj, options = {}) {
  if (!obj || typeof obj !== "object") return;

  const cleaned = mongoSanitize.sanitize(obj, options);

  Object.keys(obj).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(cleaned, key)) {
      try {
        delete obj[key];
      } catch {}
    }
  });

  Object.keys(cleaned).forEach((key) => {
    obj[key] = cleaned[key];
  });
}

export function noSqlSanitizer(req, res, next) {
  ["body", "params", "query"].forEach((key) => {
    if (req[key] && typeof req[key] === "object") {
      sanitizeInPlace(req[key]);
    }
  });
  next();
}

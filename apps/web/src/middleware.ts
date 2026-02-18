// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/middleware.ts

import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

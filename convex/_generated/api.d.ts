/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as aiActions from "../aiActions.js";
import type * as analytics from "../analytics.js";
import type * as formFields from "../formFields.js";
import type * as formSnapshots from "../formSnapshots.js";
import type * as forms from "../forms.js";
import type * as lib_ai from "../lib/ai.js";
import type * as lib_analytics from "../lib/analytics.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_formRuntime from "../lib/formRuntime.js";
import type * as lib_forms from "../lib/forms.js";
import type * as submissions from "../submissions.js";
import type * as users from "../users.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  aiActions: typeof aiActions;
  analytics: typeof analytics;
  formFields: typeof formFields;
  formSnapshots: typeof formSnapshots;
  forms: typeof forms;
  "lib/ai": typeof lib_ai;
  "lib/analytics": typeof lib_analytics;
  "lib/auth": typeof lib_auth;
  "lib/formRuntime": typeof lib_formRuntime;
  "lib/forms": typeof lib_forms;
  submissions: typeof submissions;
  users: typeof users;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

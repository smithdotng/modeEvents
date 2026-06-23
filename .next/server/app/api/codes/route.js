"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/codes/route";
exports.ids = ["app/api/codes/route"];
exports.modules = {

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcodes%2Froute&page=%2Fapi%2Fcodes%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcodes%2Froute.js&appDir=%2FUsers%2Fjaneotem%2FDocuments%2Fprojects%2FmodeEvents%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjaneotem%2FDocuments%2Fprojects%2FmodeEvents&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcodes%2Froute&page=%2Fapi%2Fcodes%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcodes%2Froute.js&appDir=%2FUsers%2Fjaneotem%2FDocuments%2Fprojects%2FmodeEvents%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjaneotem%2FDocuments%2Fprojects%2FmodeEvents&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_janeotem_Documents_projects_modeEvents_app_api_codes_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/codes/route.js */ \"(rsc)/./app/api/codes/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/codes/route\",\n        pathname: \"/api/codes\",\n        filename: \"route\",\n        bundlePath: \"app/api/codes/route\"\n    },\n    resolvedPagePath: \"/Users/janeotem/Documents/projects/modeEvents/app/api/codes/route.js\",\n    nextConfigOutput,\n    userland: _Users_janeotem_Documents_projects_modeEvents_app_api_codes_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/codes/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZjb2RlcyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGY29kZXMlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZjb2RlcyUyRnJvdXRlLmpzJmFwcERpcj0lMkZVc2VycyUyRmphbmVvdGVtJTJGRG9jdW1lbnRzJTJGcHJvamVjdHMlMkZtb2RlRXZlbnRzJTJGYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj0lMkZVc2VycyUyRmphbmVvdGVtJTJGRG9jdW1lbnRzJTJGcHJvamVjdHMlMkZtb2RlRXZlbnRzJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNvQjtBQUNqRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL3FyLWJhcmNvZGUtYXBwLz9kMTdhIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9qYW5lb3RlbS9Eb2N1bWVudHMvcHJvamVjdHMvbW9kZUV2ZW50cy9hcHAvYXBpL2NvZGVzL3JvdXRlLmpzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9jb2Rlcy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2NvZGVzXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9jb2Rlcy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9qYW5lb3RlbS9Eb2N1bWVudHMvcHJvamVjdHMvbW9kZUV2ZW50cy9hcHAvYXBpL2NvZGVzL3JvdXRlLmpzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9jb2Rlcy9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcodes%2Froute&page=%2Fapi%2Fcodes%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcodes%2Froute.js&appDir=%2FUsers%2Fjaneotem%2FDocuments%2Fprojects%2FmodeEvents%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjaneotem%2FDocuments%2Fprojects%2FmodeEvents&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/codes/route.js":
/*!********************************!*\
  !*** ./app/api/codes/route.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.js\");\n/* harmony import */ var _lib_mongodb__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/mongodb */ \"(rsc)/./lib/mongodb.js\");\n/* harmony import */ var _models_Code__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/models/Code */ \"(rsc)/./models/Code.js\");\n\n\n\n\n\n// GET /api/codes — list current user's codes\nasync function GET(req) {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Unauthorized\"\n    }, {\n        status: 401\n    });\n    await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_3__.connectDB)();\n    const { searchParams } = new URL(req.url);\n    const type = searchParams.get(\"type\"); // optional filter: qr | barcode\n    const limit = parseInt(searchParams.get(\"limit\") || \"50\");\n    const filter = {\n        userId: session.user.id\n    };\n    if (type) filter.type = type;\n    const codes = await _models_Code__WEBPACK_IMPORTED_MODULE_4__[\"default\"].find(filter).sort({\n        createdAt: -1\n    }).limit(limit).lean();\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        codes\n    });\n}\n// POST /api/codes — save a generated code\nasync function POST(req) {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        error: \"Unauthorized\"\n    }, {\n        status: 401\n    });\n    try {\n        const body = await req.json();\n        const { type, format, content, label, dataURL, options } = body;\n        if (!type || !format || !content || !dataURL) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Missing required fields.\"\n            }, {\n                status: 400\n            });\n        }\n        await (0,_lib_mongodb__WEBPACK_IMPORTED_MODULE_3__.connectDB)();\n        const code = await _models_Code__WEBPACK_IMPORTED_MODULE_4__[\"default\"].create({\n            userId: session.user.id,\n            type,\n            format,\n            content,\n            label: label || content.slice(0, 60),\n            dataURL,\n            options: options || {}\n        });\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            code\n        }, {\n            status: 201\n        });\n    } catch (err) {\n        console.error(\"[POST /api/codes]\", err);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Failed to save code.\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NvZGVzL3JvdXRlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQTJDO0FBQ0U7QUFDSjtBQUNDO0FBQ1Q7QUFFakMsNkNBQTZDO0FBQ3RDLGVBQWVLLElBQUlDLEdBQUc7SUFDM0IsTUFBTUMsVUFBVSxNQUFNTiwyREFBZ0JBLENBQUNDLGtEQUFXQTtJQUNsRCxJQUFJLENBQUNLLFNBQVMsT0FBT1AscURBQVlBLENBQUNRLElBQUksQ0FBQztRQUFFQyxPQUFPO0lBQWUsR0FBRztRQUFFQyxRQUFRO0lBQUk7SUFFaEYsTUFBTVAsdURBQVNBO0lBQ2YsTUFBTSxFQUFFUSxZQUFZLEVBQUUsR0FBRyxJQUFJQyxJQUFJTixJQUFJTyxHQUFHO0lBQ3hDLE1BQU1DLE9BQU9ILGFBQWFJLEdBQUcsQ0FBQyxTQUFTLGdDQUFnQztJQUN2RSxNQUFNQyxRQUFRQyxTQUFTTixhQUFhSSxHQUFHLENBQUMsWUFBWTtJQUVwRCxNQUFNRyxTQUFTO1FBQUVDLFFBQVFaLFFBQVFhLElBQUksQ0FBQ0MsRUFBRTtJQUFDO0lBQ3pDLElBQUlQLE1BQU1JLE9BQU9KLElBQUksR0FBR0E7SUFFeEIsTUFBTVEsUUFBUSxNQUFNbEIsb0RBQUlBLENBQUNtQixJQUFJLENBQUNMLFFBQVFNLElBQUksQ0FBQztRQUFFQyxXQUFXLENBQUM7SUFBRSxHQUFHVCxLQUFLLENBQUNBLE9BQU9VLElBQUk7SUFDL0UsT0FBTzFCLHFEQUFZQSxDQUFDUSxJQUFJLENBQUM7UUFBRWM7SUFBTTtBQUNuQztBQUVBLDBDQUEwQztBQUNuQyxlQUFlSyxLQUFLckIsR0FBRztJQUM1QixNQUFNQyxVQUFVLE1BQU1OLDJEQUFnQkEsQ0FBQ0Msa0RBQVdBO0lBQ2xELElBQUksQ0FBQ0ssU0FBUyxPQUFPUCxxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1FBQUVDLE9BQU87SUFBZSxHQUFHO1FBQUVDLFFBQVE7SUFBSTtJQUVoRixJQUFJO1FBQ0YsTUFBTWtCLE9BQU8sTUFBTXRCLElBQUlFLElBQUk7UUFDM0IsTUFBTSxFQUFFTSxJQUFJLEVBQUVlLE1BQU0sRUFBRUMsT0FBTyxFQUFFQyxLQUFLLEVBQUVDLE9BQU8sRUFBRUMsT0FBTyxFQUFFLEdBQUdMO1FBRTNELElBQUksQ0FBQ2QsUUFBUSxDQUFDZSxVQUFVLENBQUNDLFdBQVcsQ0FBQ0UsU0FBUztZQUM1QyxPQUFPaEMscURBQVlBLENBQUNRLElBQUksQ0FBQztnQkFBRUMsT0FBTztZQUEyQixHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDaEY7UUFFQSxNQUFNUCx1REFBU0E7UUFDZixNQUFNK0IsT0FBTyxNQUFNOUIsb0RBQUlBLENBQUMrQixNQUFNLENBQUM7WUFDN0JoQixRQUFRWixRQUFRYSxJQUFJLENBQUNDLEVBQUU7WUFDdkJQO1lBQ0FlO1lBQ0FDO1lBQ0FDLE9BQU9BLFNBQVNELFFBQVFNLEtBQUssQ0FBQyxHQUFHO1lBQ2pDSjtZQUNBQyxTQUFTQSxXQUFXLENBQUM7UUFDdkI7UUFFQSxPQUFPakMscURBQVlBLENBQUNRLElBQUksQ0FBQztZQUFFMEI7UUFBSyxHQUFHO1lBQUV4QixRQUFRO1FBQUk7SUFDbkQsRUFBRSxPQUFPMkIsS0FBSztRQUNaQyxRQUFRN0IsS0FBSyxDQUFDLHFCQUFxQjRCO1FBQ25DLE9BQU9yQyxxREFBWUEsQ0FBQ1EsSUFBSSxDQUFDO1lBQUVDLE9BQU87UUFBdUIsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDNUU7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL3FyLWJhcmNvZGUtYXBwLy4vYXBwL2FwaS9jb2Rlcy9yb3V0ZS5qcz9lNTk2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJztcbmltcG9ydCB7IGdldFNlcnZlclNlc3Npb24gfSBmcm9tICduZXh0LWF1dGgnO1xuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tICdAL2xpYi9hdXRoJztcbmltcG9ydCB7IGNvbm5lY3REQiB9IGZyb20gJ0AvbGliL21vbmdvZGInO1xuaW1wb3J0IENvZGUgZnJvbSAnQC9tb2RlbHMvQ29kZSc7XG5cbi8vIEdFVCAvYXBpL2NvZGVzIOKAlCBsaXN0IGN1cnJlbnQgdXNlcidzIGNvZGVzXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcSkge1xuICBjb25zdCBzZXNzaW9uID0gYXdhaXQgZ2V0U2VydmVyU2Vzc2lvbihhdXRoT3B0aW9ucyk7XG4gIGlmICghc2Vzc2lvbikgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdVbmF1dGhvcml6ZWQnIH0sIHsgc3RhdHVzOiA0MDEgfSk7XG5cbiAgYXdhaXQgY29ubmVjdERCKCk7XG4gIGNvbnN0IHsgc2VhcmNoUGFyYW1zIH0gPSBuZXcgVVJMKHJlcS51cmwpO1xuICBjb25zdCB0eXBlID0gc2VhcmNoUGFyYW1zLmdldCgndHlwZScpOyAvLyBvcHRpb25hbCBmaWx0ZXI6IHFyIHwgYmFyY29kZVxuICBjb25zdCBsaW1pdCA9IHBhcnNlSW50KHNlYXJjaFBhcmFtcy5nZXQoJ2xpbWl0JykgfHwgJzUwJyk7XG5cbiAgY29uc3QgZmlsdGVyID0geyB1c2VySWQ6IHNlc3Npb24udXNlci5pZCB9O1xuICBpZiAodHlwZSkgZmlsdGVyLnR5cGUgPSB0eXBlO1xuXG4gIGNvbnN0IGNvZGVzID0gYXdhaXQgQ29kZS5maW5kKGZpbHRlcikuc29ydCh7IGNyZWF0ZWRBdDogLTEgfSkubGltaXQobGltaXQpLmxlYW4oKTtcbiAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgY29kZXMgfSk7XG59XG5cbi8vIFBPU1QgL2FwaS9jb2RlcyDigJQgc2F2ZSBhIGdlbmVyYXRlZCBjb2RlXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXEpIHtcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpO1xuICBpZiAoIXNlc3Npb24pIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9LCB7IHN0YXR1czogNDAxIH0pO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcS5qc29uKCk7XG4gICAgY29uc3QgeyB0eXBlLCBmb3JtYXQsIGNvbnRlbnQsIGxhYmVsLCBkYXRhVVJMLCBvcHRpb25zIH0gPSBib2R5O1xuXG4gICAgaWYgKCF0eXBlIHx8ICFmb3JtYXQgfHwgIWNvbnRlbnQgfHwgIWRhdGFVUkwpIHtcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiAnTWlzc2luZyByZXF1aXJlZCBmaWVsZHMuJyB9LCB7IHN0YXR1czogNDAwIH0pO1xuICAgIH1cblxuICAgIGF3YWl0IGNvbm5lY3REQigpO1xuICAgIGNvbnN0IGNvZGUgPSBhd2FpdCBDb2RlLmNyZWF0ZSh7XG4gICAgICB1c2VySWQ6IHNlc3Npb24udXNlci5pZCxcbiAgICAgIHR5cGUsXG4gICAgICBmb3JtYXQsXG4gICAgICBjb250ZW50LFxuICAgICAgbGFiZWw6IGxhYmVsIHx8IGNvbnRlbnQuc2xpY2UoMCwgNjApLFxuICAgICAgZGF0YVVSTCxcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnMgfHwge30sXG4gICAgfSk7XG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBjb2RlIH0sIHsgc3RhdHVzOiAyMDEgfSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1tQT1NUIC9hcGkvY29kZXNdJywgZXJyKTtcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ0ZhaWxlZCB0byBzYXZlIGNvZGUuJyB9LCB7IHN0YXR1czogNTAwIH0pO1xuICB9XG59XG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiZ2V0U2VydmVyU2Vzc2lvbiIsImF1dGhPcHRpb25zIiwiY29ubmVjdERCIiwiQ29kZSIsIkdFVCIsInJlcSIsInNlc3Npb24iLCJqc29uIiwiZXJyb3IiLCJzdGF0dXMiLCJzZWFyY2hQYXJhbXMiLCJVUkwiLCJ1cmwiLCJ0eXBlIiwiZ2V0IiwibGltaXQiLCJwYXJzZUludCIsImZpbHRlciIsInVzZXJJZCIsInVzZXIiLCJpZCIsImNvZGVzIiwiZmluZCIsInNvcnQiLCJjcmVhdGVkQXQiLCJsZWFuIiwiUE9TVCIsImJvZHkiLCJmb3JtYXQiLCJjb250ZW50IiwibGFiZWwiLCJkYXRhVVJMIiwib3B0aW9ucyIsImNvZGUiLCJjcmVhdGUiLCJzbGljZSIsImVyciIsImNvbnNvbGUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/codes/route.js\n");

/***/ }),

/***/ "(rsc)/./lib/auth.js":
/*!*********************!*\
  !*** ./lib/auth.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _mongodb__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mongodb */ \"(rsc)/./lib/mongodb.js\");\n/* harmony import */ var _models_User__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/models/User */ \"(rsc)/./models/User.js\");\n\n\n\n\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: \"credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) return null;\n                await (0,_mongodb__WEBPACK_IMPORTED_MODULE_2__.connectDB)();\n                const user = await _models_User__WEBPACK_IMPORTED_MODULE_3__[\"default\"].findOne({\n                    email: credentials.email.toLowerCase()\n                });\n                if (!user) return null;\n                const valid = await bcryptjs__WEBPACK_IMPORTED_MODULE_1___default().compare(credentials.password, user.password);\n                if (!valid) return null;\n                return {\n                    id: user._id.toString(),\n                    name: user.name,\n                    email: user.email\n                };\n            }\n        })\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) token.id = user.id;\n            return token;\n        },\n        async session ({ session, token }) {\n            if (token) session.user.id = token.id;\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    secret: process.env.NEXTAUTH_SECRET\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBa0U7QUFDcEM7QUFDUTtBQUNMO0FBRTFCLE1BQU1JLGNBQWM7SUFDekJDLFdBQVc7UUFDVEwsMkVBQW1CQSxDQUFDO1lBQ2xCTSxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFZQyxNQUFNO2dCQUFXO1lBQ2xEO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELGFBQWFJLFVBQVUsT0FBTztnQkFFMUQsTUFBTVQsbURBQVNBO2dCQUNmLE1BQU1XLE9BQU8sTUFBTVYsb0RBQUlBLENBQUNXLE9BQU8sQ0FBQztvQkFBRU4sT0FBT0QsWUFBWUMsS0FBSyxDQUFDTyxXQUFXO2dCQUFHO2dCQUN6RSxJQUFJLENBQUNGLE1BQU0sT0FBTztnQkFFbEIsTUFBTUcsUUFBUSxNQUFNZix1REFBYyxDQUFDTSxZQUFZSSxRQUFRLEVBQUVFLEtBQUtGLFFBQVE7Z0JBQ3RFLElBQUksQ0FBQ0ssT0FBTyxPQUFPO2dCQUVuQixPQUFPO29CQUNMRSxJQUFJTCxLQUFLTSxHQUFHLENBQUNDLFFBQVE7b0JBQ3JCZCxNQUFNTyxLQUFLUCxJQUFJO29CQUNmRSxPQUFPSyxLQUFLTCxLQUFLO2dCQUNuQjtZQUNGO1FBQ0Y7S0FDRDtJQUNEYSxTQUFTO1FBQUVDLFVBQVU7SUFBTTtJQUMzQkMsV0FBVztRQUNULE1BQU1DLEtBQUksRUFBRUMsS0FBSyxFQUFFWixJQUFJLEVBQUU7WUFDdkIsSUFBSUEsTUFBTVksTUFBTVAsRUFBRSxHQUFHTCxLQUFLSyxFQUFFO1lBQzVCLE9BQU9PO1FBQ1Q7UUFDQSxNQUFNSixTQUFRLEVBQUVBLE9BQU8sRUFBRUksS0FBSyxFQUFFO1lBQzlCLElBQUlBLE9BQU9KLFFBQVFSLElBQUksQ0FBQ0ssRUFBRSxHQUFHTyxNQUFNUCxFQUFFO1lBQ3JDLE9BQU9HO1FBQ1Q7SUFDRjtJQUNBSyxPQUFPO1FBQ0xDLFFBQVE7UUFDUkMsT0FBTztJQUNUO0lBQ0FDLFFBQVFDLFFBQVFDLEdBQUcsQ0FBQ0MsZUFBZTtBQUNyQyxFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcXItYmFyY29kZS1hcHAvLi9saWIvYXV0aC5qcz8yODdiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDcmVkZW50aWFsc1Byb3ZpZGVyIGZyb20gJ25leHQtYXV0aC9wcm92aWRlcnMvY3JlZGVudGlhbHMnO1xuaW1wb3J0IGJjcnlwdCBmcm9tICdiY3J5cHRqcyc7XG5pbXBvcnQgeyBjb25uZWN0REIgfSBmcm9tICcuL21vbmdvZGInO1xuaW1wb3J0IFVzZXIgZnJvbSAnQC9tb2RlbHMvVXNlcic7XG5cbmV4cG9ydCBjb25zdCBhdXRoT3B0aW9ucyA9IHtcbiAgcHJvdmlkZXJzOiBbXG4gICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XG4gICAgICBuYW1lOiAnY3JlZGVudGlhbHMnLFxuICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgZW1haWw6IHsgbGFiZWw6ICdFbWFpbCcsIHR5cGU6ICdlbWFpbCcgfSxcbiAgICAgICAgcGFzc3dvcmQ6IHsgbGFiZWw6ICdQYXNzd29yZCcsIHR5cGU6ICdwYXNzd29yZCcgfSxcbiAgICAgIH0sXG4gICAgICBhc3luYyBhdXRob3JpemUoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgaWYgKCFjcmVkZW50aWFscz8uZW1haWwgfHwgIWNyZWRlbnRpYWxzPy5wYXNzd29yZCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgYXdhaXQgY29ubmVjdERCKCk7XG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyLmZpbmRPbmUoeyBlbWFpbDogY3JlZGVudGlhbHMuZW1haWwudG9Mb3dlckNhc2UoKSB9KTtcbiAgICAgICAgaWYgKCF1c2VyKSByZXR1cm4gbnVsbDtcblxuICAgICAgICBjb25zdCB2YWxpZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKGNyZWRlbnRpYWxzLnBhc3N3b3JkLCB1c2VyLnBhc3N3b3JkKTtcbiAgICAgICAgaWYgKCF2YWxpZCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogdXNlci5faWQudG9TdHJpbmcoKSxcbiAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBzZXNzaW9uOiB7IHN0cmF0ZWd5OiAnand0JyB9LFxuICBjYWxsYmFja3M6IHtcbiAgICBhc3luYyBqd3QoeyB0b2tlbiwgdXNlciB9KSB7XG4gICAgICBpZiAodXNlcikgdG9rZW4uaWQgPSB1c2VyLmlkO1xuICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH0sXG4gICAgYXN5bmMgc2Vzc2lvbih7IHNlc3Npb24sIHRva2VuIH0pIHtcbiAgICAgIGlmICh0b2tlbikgc2Vzc2lvbi51c2VyLmlkID0gdG9rZW4uaWQ7XG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9LFxuICB9LFxuICBwYWdlczoge1xuICAgIHNpZ25JbjogJy9sb2dpbicsXG4gICAgZXJyb3I6ICcvbG9naW4nLFxuICB9LFxuICBzZWNyZXQ6IHByb2Nlc3MuZW52Lk5FWFRBVVRIX1NFQ1JFVCxcbn07XG4iXSwibmFtZXMiOlsiQ3JlZGVudGlhbHNQcm92aWRlciIsImJjcnlwdCIsImNvbm5lY3REQiIsIlVzZXIiLCJhdXRoT3B0aW9ucyIsInByb3ZpZGVycyIsIm5hbWUiLCJjcmVkZW50aWFscyIsImVtYWlsIiwibGFiZWwiLCJ0eXBlIiwicGFzc3dvcmQiLCJhdXRob3JpemUiLCJ1c2VyIiwiZmluZE9uZSIsInRvTG93ZXJDYXNlIiwidmFsaWQiLCJjb21wYXJlIiwiaWQiLCJfaWQiLCJ0b1N0cmluZyIsInNlc3Npb24iLCJzdHJhdGVneSIsImNhbGxiYWNrcyIsImp3dCIsInRva2VuIiwicGFnZXMiLCJzaWduSW4iLCJlcnJvciIsInNlY3JldCIsInByb2Nlc3MiLCJlbnYiLCJORVhUQVVUSF9TRUNSRVQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.js\n");

/***/ }),

/***/ "(rsc)/./lib/mongodb.js":
/*!************************!*\
  !*** ./lib/mongodb.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   connectDB: () => (/* binding */ connectDB)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst MONGODB_URI = process.env.MONGODB_URI;\nif (!MONGODB_URI) {\n    throw new Error(\"Please define MONGODB_URI in your .env file\");\n}\n/**\n * Global cache prevents new connections on every hot-reload in development.\n */ let cached = global.mongoose;\nif (!cached) {\n    cached = global.mongoose = {\n        conn: null,\n        promise: null\n    };\n}\nasync function connectDB() {\n    if (cached.conn) return cached.conn;\n    if (!cached.promise) {\n        cached.promise = mongoose__WEBPACK_IMPORTED_MODULE_0___default().connect(MONGODB_URI, {\n            bufferCommands: false\n        });\n    }\n    cached.conn = await cached.promise;\n    return cached.conn;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvbW9uZ29kYi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBZ0M7QUFFaEMsTUFBTUMsY0FBY0MsUUFBUUMsR0FBRyxDQUFDRixXQUFXO0FBRTNDLElBQUksQ0FBQ0EsYUFBYTtJQUNoQixNQUFNLElBQUlHLE1BQU07QUFDbEI7QUFFQTs7Q0FFQyxHQUNELElBQUlDLFNBQVNDLE9BQU9OLFFBQVE7QUFFNUIsSUFBSSxDQUFDSyxRQUFRO0lBQ1hBLFNBQVNDLE9BQU9OLFFBQVEsR0FBRztRQUFFTyxNQUFNO1FBQU1DLFNBQVM7SUFBSztBQUN6RDtBQUVPLGVBQWVDO0lBQ3BCLElBQUlKLE9BQU9FLElBQUksRUFBRSxPQUFPRixPQUFPRSxJQUFJO0lBRW5DLElBQUksQ0FBQ0YsT0FBT0csT0FBTyxFQUFFO1FBQ25CSCxPQUFPRyxPQUFPLEdBQUdSLHVEQUFnQixDQUFDQyxhQUFhO1lBQzdDVSxnQkFBZ0I7UUFDbEI7SUFDRjtJQUVBTixPQUFPRSxJQUFJLEdBQUcsTUFBTUYsT0FBT0csT0FBTztJQUNsQyxPQUFPSCxPQUFPRSxJQUFJO0FBQ3BCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcXItYmFyY29kZS1hcHAvLi9saWIvbW9uZ29kYi5qcz9kOTIwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSc7XG5cbmNvbnN0IE1PTkdPREJfVVJJID0gcHJvY2Vzcy5lbnYuTU9OR09EQl9VUkk7XG5cbmlmICghTU9OR09EQl9VUkkpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgZGVmaW5lIE1PTkdPREJfVVJJIGluIHlvdXIgLmVudiBmaWxlJyk7XG59XG5cbi8qKlxuICogR2xvYmFsIGNhY2hlIHByZXZlbnRzIG5ldyBjb25uZWN0aW9ucyBvbiBldmVyeSBob3QtcmVsb2FkIGluIGRldmVsb3BtZW50LlxuICovXG5sZXQgY2FjaGVkID0gZ2xvYmFsLm1vbmdvb3NlO1xuXG5pZiAoIWNhY2hlZCkge1xuICBjYWNoZWQgPSBnbG9iYWwubW9uZ29vc2UgPSB7IGNvbm46IG51bGwsIHByb21pc2U6IG51bGwgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbm5lY3REQigpIHtcbiAgaWYgKGNhY2hlZC5jb25uKSByZXR1cm4gY2FjaGVkLmNvbm47XG5cbiAgaWYgKCFjYWNoZWQucHJvbWlzZSkge1xuICAgIGNhY2hlZC5wcm9taXNlID0gbW9uZ29vc2UuY29ubmVjdChNT05HT0RCX1VSSSwge1xuICAgICAgYnVmZmVyQ29tbWFuZHM6IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgY2FjaGVkLmNvbm4gPSBhd2FpdCBjYWNoZWQucHJvbWlzZTtcbiAgcmV0dXJuIGNhY2hlZC5jb25uO1xufVxuIl0sIm5hbWVzIjpbIm1vbmdvb3NlIiwiTU9OR09EQl9VUkkiLCJwcm9jZXNzIiwiZW52IiwiRXJyb3IiLCJjYWNoZWQiLCJnbG9iYWwiLCJjb25uIiwicHJvbWlzZSIsImNvbm5lY3REQiIsImNvbm5lY3QiLCJidWZmZXJDb21tYW5kcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/mongodb.js\n");

/***/ }),

/***/ "(rsc)/./models/Code.js":
/*!************************!*\
  !*** ./models/Code.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst CodeSchema = new (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Schema)({\n    userId: {\n        type: (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Schema).Types.ObjectId,\n        ref: \"User\",\n        required: true,\n        index: true\n    },\n    type: {\n        type: String,\n        enum: [\n            \"qr\",\n            \"barcode\"\n        ],\n        required: true\n    },\n    // For QR: url | text | email | phone | wifi | vcard\n    // For barcode: CODE128 | EAN13 | UPC | etc.\n    format: {\n        type: String,\n        required: true\n    },\n    content: {\n        type: String,\n        required: true\n    },\n    label: {\n        type: String,\n        default: \"\"\n    },\n    // Base64 PNG data URL stored for quick preview\n    dataURL: {\n        type: String,\n        required: true\n    },\n    // Styling snapshot\n    options: {\n        fg: {\n            type: String,\n            default: \"#000000\"\n        },\n        bg: {\n            type: String,\n            default: \"#ffffff\"\n        },\n        size: {\n            type: Number,\n            default: 256\n        }\n    }\n}, {\n    timestamps: true\n});\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((mongoose__WEBPACK_IMPORTED_MODULE_0___default().models).Code || mongoose__WEBPACK_IMPORTED_MODULE_0___default().model(\"Code\", CodeSchema));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9tb2RlbHMvQ29kZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBZ0M7QUFFaEMsTUFBTUMsYUFBYSxJQUFJRCx3REFBZSxDQUNwQztJQUNFRyxRQUFRO1FBQ05DLE1BQU1KLHdEQUFlLENBQUNLLEtBQUssQ0FBQ0MsUUFBUTtRQUNwQ0MsS0FBSztRQUNMQyxVQUFVO1FBQ1ZDLE9BQU87SUFDVDtJQUNBTCxNQUFNO1FBQ0pBLE1BQU1NO1FBQ05DLE1BQU07WUFBQztZQUFNO1NBQVU7UUFDdkJILFVBQVU7SUFDWjtJQUNBLG9EQUFvRDtJQUNwRCw0Q0FBNEM7SUFDNUNJLFFBQVE7UUFDTlIsTUFBTU07UUFDTkYsVUFBVTtJQUNaO0lBQ0FLLFNBQVM7UUFDUFQsTUFBTU07UUFDTkYsVUFBVTtJQUNaO0lBQ0FNLE9BQU87UUFDTFYsTUFBTU07UUFDTkssU0FBUztJQUNYO0lBQ0EsK0NBQStDO0lBQy9DQyxTQUFTO1FBQ1BaLE1BQU1NO1FBQ05GLFVBQVU7SUFDWjtJQUNBLG1CQUFtQjtJQUNuQlMsU0FBUztRQUNQQyxJQUFJO1lBQUVkLE1BQU1NO1lBQVFLLFNBQVM7UUFBVTtRQUN2Q0ksSUFBSTtZQUFFZixNQUFNTTtZQUFRSyxTQUFTO1FBQVU7UUFDdkNLLE1BQU07WUFBRWhCLE1BQU1pQjtZQUFRTixTQUFTO1FBQUk7SUFDckM7QUFDRixHQUNBO0lBQUVPLFlBQVk7QUFBSztBQUdyQixpRUFBZXRCLHdEQUFlLENBQUN3QixJQUFJLElBQUl4QixxREFBYyxDQUFDLFFBQVFDLFdBQVdBLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9xci1iYXJjb2RlLWFwcC8uL21vZGVscy9Db2RlLmpzPzA3MDciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vbmdvb3NlIGZyb20gJ21vbmdvb3NlJztcblxuY29uc3QgQ29kZVNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoXG4gIHtcbiAgICB1c2VySWQ6IHtcbiAgICAgIHR5cGU6IG1vbmdvb3NlLlNjaGVtYS5UeXBlcy5PYmplY3RJZCxcbiAgICAgIHJlZjogJ1VzZXInLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICBpbmRleDogdHJ1ZSxcbiAgICB9LFxuICAgIHR5cGU6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGVudW06IFsncXInLCAnYmFyY29kZSddLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgICAvLyBGb3IgUVI6IHVybCB8IHRleHQgfCBlbWFpbCB8IHBob25lIHwgd2lmaSB8IHZjYXJkXG4gICAgLy8gRm9yIGJhcmNvZGU6IENPREUxMjggfCBFQU4xMyB8IFVQQyB8IGV0Yy5cbiAgICBmb3JtYXQ6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIH0sXG4gICAgY29udGVudDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgfSxcbiAgICBsYWJlbDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJycsXG4gICAgfSxcbiAgICAvLyBCYXNlNjQgUE5HIGRhdGEgVVJMIHN0b3JlZCBmb3IgcXVpY2sgcHJldmlld1xuICAgIGRhdGFVUkw6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIH0sXG4gICAgLy8gU3R5bGluZyBzbmFwc2hvdFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIGZnOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJyMwMDAwMDAnIH0sXG4gICAgICBiZzogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcjZmZmZmZmJyB9LFxuICAgICAgc2l6ZTogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IDI1NiB9LFxuICAgIH0sXG4gIH0sXG4gIHsgdGltZXN0YW1wczogdHJ1ZSB9XG4pO1xuXG5leHBvcnQgZGVmYXVsdCBtb25nb29zZS5tb2RlbHMuQ29kZSB8fCBtb25nb29zZS5tb2RlbCgnQ29kZScsIENvZGVTY2hlbWEpO1xuIl0sIm5hbWVzIjpbIm1vbmdvb3NlIiwiQ29kZVNjaGVtYSIsIlNjaGVtYSIsInVzZXJJZCIsInR5cGUiLCJUeXBlcyIsIk9iamVjdElkIiwicmVmIiwicmVxdWlyZWQiLCJpbmRleCIsIlN0cmluZyIsImVudW0iLCJmb3JtYXQiLCJjb250ZW50IiwibGFiZWwiLCJkZWZhdWx0IiwiZGF0YVVSTCIsIm9wdGlvbnMiLCJmZyIsImJnIiwic2l6ZSIsIk51bWJlciIsInRpbWVzdGFtcHMiLCJtb2RlbHMiLCJDb2RlIiwibW9kZWwiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./models/Code.js\n");

/***/ }),

/***/ "(rsc)/./models/User.js":
/*!************************!*\
  !*** ./models/User.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst UserSchema = new (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Schema)({\n    name: {\n        type: String,\n        required: [\n            true,\n            \"Name is required\"\n        ],\n        trim: true,\n        minlength: [\n            2,\n            \"Name must be at least 2 characters\"\n        ]\n    },\n    email: {\n        type: String,\n        required: [\n            true,\n            \"Email is required\"\n        ],\n        unique: true,\n        lowercase: true,\n        trim: true,\n        match: [\n            /^\\S+@\\S+\\.\\S+$/,\n            \"Please enter a valid email\"\n        ]\n    },\n    password: {\n        type: String,\n        required: [\n            true,\n            \"Password is required\"\n        ],\n        minlength: [\n            6,\n            \"Password must be at least 6 characters\"\n        ]\n    }\n}, {\n    timestamps: true\n});\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((mongoose__WEBPACK_IMPORTED_MODULE_0___default().models).User || mongoose__WEBPACK_IMPORTED_MODULE_0___default().model(\"User\", UserSchema));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9tb2RlbHMvVXNlci5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBZ0M7QUFFaEMsTUFBTUMsYUFBYSxJQUFJRCx3REFBZSxDQUNwQztJQUNFRyxNQUFNO1FBQ0pDLE1BQU1DO1FBQ05DLFVBQVU7WUFBQztZQUFNO1NBQW1CO1FBQ3BDQyxNQUFNO1FBQ05DLFdBQVc7WUFBQztZQUFHO1NBQXFDO0lBQ3REO0lBQ0FDLE9BQU87UUFDTEwsTUFBTUM7UUFDTkMsVUFBVTtZQUFDO1lBQU07U0FBb0I7UUFDckNJLFFBQVE7UUFDUkMsV0FBVztRQUNYSixNQUFNO1FBQ05LLE9BQU87WUFBQztZQUFrQjtTQUE2QjtJQUN6RDtJQUNBQyxVQUFVO1FBQ1JULE1BQU1DO1FBQ05DLFVBQVU7WUFBQztZQUFNO1NBQXVCO1FBQ3hDRSxXQUFXO1lBQUM7WUFBRztTQUF5QztJQUMxRDtBQUNGLEdBQ0E7SUFBRU0sWUFBWTtBQUFLO0FBR3JCLGlFQUFlZCx3REFBZSxDQUFDZ0IsSUFBSSxJQUFJaEIscURBQWMsQ0FBQyxRQUFRQyxXQUFXQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcXItYmFyY29kZS1hcHAvLi9tb2RlbHMvVXNlci5qcz83MzY3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSc7XG5cbmNvbnN0IFVzZXJTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKFxuICB7XG4gICAgbmFtZToge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgcmVxdWlyZWQ6IFt0cnVlLCAnTmFtZSBpcyByZXF1aXJlZCddLFxuICAgICAgdHJpbTogdHJ1ZSxcbiAgICAgIG1pbmxlbmd0aDogWzIsICdOYW1lIG11c3QgYmUgYXQgbGVhc3QgMiBjaGFyYWN0ZXJzJ10sXG4gICAgfSxcbiAgICBlbWFpbDoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgcmVxdWlyZWQ6IFt0cnVlLCAnRW1haWwgaXMgcmVxdWlyZWQnXSxcbiAgICAgIHVuaXF1ZTogdHJ1ZSxcbiAgICAgIGxvd2VyY2FzZTogdHJ1ZSxcbiAgICAgIHRyaW06IHRydWUsXG4gICAgICBtYXRjaDogWy9eXFxTK0BcXFMrXFwuXFxTKyQvLCAnUGxlYXNlIGVudGVyIGEgdmFsaWQgZW1haWwnXSxcbiAgICB9LFxuICAgIHBhc3N3b3JkOiB7XG4gICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICByZXF1aXJlZDogW3RydWUsICdQYXNzd29yZCBpcyByZXF1aXJlZCddLFxuICAgICAgbWlubGVuZ3RoOiBbNiwgJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgNiBjaGFyYWN0ZXJzJ10sXG4gICAgfSxcbiAgfSxcbiAgeyB0aW1lc3RhbXBzOiB0cnVlIH1cbik7XG5cbmV4cG9ydCBkZWZhdWx0IG1vbmdvb3NlLm1vZGVscy5Vc2VyIHx8IG1vbmdvb3NlLm1vZGVsKCdVc2VyJywgVXNlclNjaGVtYSk7XG4iXSwibmFtZXMiOlsibW9uZ29vc2UiLCJVc2VyU2NoZW1hIiwiU2NoZW1hIiwibmFtZSIsInR5cGUiLCJTdHJpbmciLCJyZXF1aXJlZCIsInRyaW0iLCJtaW5sZW5ndGgiLCJlbWFpbCIsInVuaXF1ZSIsImxvd2VyY2FzZSIsIm1hdGNoIiwicGFzc3dvcmQiLCJ0aW1lc3RhbXBzIiwibW9kZWxzIiwiVXNlciIsIm1vZGVsIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./models/User.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/openid-client","vendor-chunks/bcryptjs","vendor-chunks/oauth","vendor-chunks/object-hash","vendor-chunks/preact","vendor-chunks/uuid","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/lru-cache","vendor-chunks/cookie","vendor-chunks/oidc-token-hash","vendor-chunks/@panva"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fcodes%2Froute&page=%2Fapi%2Fcodes%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcodes%2Froute.js&appDir=%2FUsers%2Fjaneotem%2FDocuments%2Fprojects%2FmodeEvents%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fjaneotem%2FDocuments%2Fprojects%2FmodeEvents&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();
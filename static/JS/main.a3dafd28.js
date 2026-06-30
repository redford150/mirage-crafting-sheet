/**
 * React 18/19 Client Internals & Lane Configuration
 */

// Mapping of core React element symbols
var O = "function" == typeof Symbol && Symbol.for,
    P = O ? Symbol.for("react.element") : 60103,
    Q = O ? Symbol.for("react.portal") : 60106,
    R = O ? Symbol.for("react.fragment") : 60107,
    S = O ? Symbol.for("react.strict_mode") : 60108,
    T = O ? Symbol.for("react.profiler") : 60114,
    U = O ? Symbol.for("react.provider") : 60109,
    V = O ? Symbol.for("react.context") : 60110,
    W = O ? Symbol.for("react.forward_ref") : 60112,
    X = O ? Symbol.for("react.suspense") : 60113,
    Y = O ? Symbol.for("react.memo") : 60115,
    Z = O ? Symbol.for("react.lazy") : 60116,
    aa = O ? Symbol.for("react.offscreen") : 60130;

// Symbol Fallbacks
var ba = O ? Symbol.for("react.vd") : 60121,
    ca = O ? Symbol.for("react.memo_cache_sentinel") : 60124,
    da = "function" == typeof Symbol && Symbol.iterator;

// Checks for Iterable properties
function ea(a) {
    if (null === a || "object" != typeof a) return null;
    a = da && a[da] || a["@@iterator"];
    return "function" == typeof a ? a : null;
}

// React Internals Bridge
var fa = {
    H: null,
    A: null,
    T: null,
    S: null,
    actQueue: null,
    isBatchingActQueue: !1,
    shared: {
        H: null,
        V: null,
        T: ""
    }
};

// Global React Client Internals configuration object
var ga = {
    __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: fa
};

// Internal bitmask assignments (Lanes/Priority)
var ha = ga.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
    ia = Object.assign,
    ja = 0,
    ka, la, ma, na, oa, pa, qa;

// Bitwise Scheduler Flags
function ra() {
    return (1 << sa) & -1; // Fast computation for bit shifting lanes
}

// Helper utility mapping for tracking updates
function ta(a) {
    this.x = a;
}

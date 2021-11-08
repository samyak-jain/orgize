(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.orgize = {}));
}(this, (function (exports) { 'use strict';

    let wasm;

    const heap = new Array(32).fill(undefined);

    heap.push(undefined, null, true, false);

    function getObject(idx) { return heap[idx]; }

    let heap_next = heap.length;

    function dropObject(idx) {
        if (idx < 36) return;
        heap[idx] = heap_next;
        heap_next = idx;
    }

    function takeObject(idx) {
        const ret = getObject(idx);
        dropObject(idx);
        return ret;
    }

    let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

    cachedTextDecoder.decode();

    let cachegetUint8Memory0 = null;
    function getUint8Memory0() {
        if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
            cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
        }
        return cachegetUint8Memory0;
    }

    function getStringFromWasm0(ptr, len) {
        return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
    }

    function addHeapObject(obj) {
        if (heap_next === heap.length) heap.push(heap.length + 1);
        const idx = heap_next;
        heap_next = heap[idx];

        heap[idx] = obj;
        return idx;
    }

    function debugString(val) {
        // primitive types
        const type = typeof val;
        if (type == 'number' || type == 'boolean' || val == null) {
            return  `${val}`;
        }
        if (type == 'string') {
            return `"${val}"`;
        }
        if (type == 'symbol') {
            const description = val.description;
            if (description == null) {
                return 'Symbol';
            } else {
                return `Symbol(${description})`;
            }
        }
        if (type == 'function') {
            const name = val.name;
            if (typeof name == 'string' && name.length > 0) {
                return `Function(${name})`;
            } else {
                return 'Function';
            }
        }
        // objects
        if (Array.isArray(val)) {
            const length = val.length;
            let debug = '[';
            if (length > 0) {
                debug += debugString(val[0]);
            }
            for(let i = 1; i < length; i++) {
                debug += ', ' + debugString(val[i]);
            }
            debug += ']';
            return debug;
        }
        // Test for built-in
        const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
        let className;
        if (builtInMatches.length > 1) {
            className = builtInMatches[1];
        } else {
            // Failed to match the standard '[object ClassName]'
            return toString.call(val);
        }
        if (className == 'Object') {
            // we're a user defined class or Object
            // JSON.stringify avoids problems with cycles, and is generally much
            // easier than looping through ownProperties of `val`.
            try {
                return 'Object(' + JSON.stringify(val) + ')';
            } catch (_) {
                return 'Object';
            }
        }
        // errors
        if (val instanceof Error) {
            return `${val.name}: ${val.message}\n${val.stack}`;
        }
        // TODO we could test for more things here, like `Set`s and `Map`s.
        return className;
    }

    let WASM_VECTOR_LEN = 0;

    let cachedTextEncoder = new TextEncoder('utf-8');

    const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
        ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
    }
        : function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    });

    function passStringToWasm0(arg, malloc, realloc) {

        if (realloc === undefined) {
            const buf = cachedTextEncoder.encode(arg);
            const ptr = malloc(buf.length);
            getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
            WASM_VECTOR_LEN = buf.length;
            return ptr;
        }

        let len = arg.length;
        let ptr = malloc(len);

        const mem = getUint8Memory0();

        let offset = 0;

        for (; offset < len; offset++) {
            const code = arg.charCodeAt(offset);
            if (code > 0x7F) break;
            mem[ptr + offset] = code;
        }

        if (offset !== len) {
            if (offset !== 0) {
                arg = arg.slice(offset);
            }
            ptr = realloc(ptr, len, len = offset + arg.length * 3);
            const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
            const ret = encodeString(arg, view);

            offset += ret.written;
        }

        WASM_VECTOR_LEN = offset;
        return ptr;
    }

    let cachegetInt32Memory0 = null;
    function getInt32Memory0() {
        if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
            cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
        }
        return cachegetInt32Memory0;
    }

    function _assertClass(instance, klass) {
        if (!(instance instanceof klass)) {
            throw new Error(`expected instance of ${klass.name}`);
        }
        return instance.ptr;
    }
    /**
    * @param {Org} org
    * @param {any} handler
    */
    function handle$1(org, handler) {
        _assertClass(org, Org);
        wasm.handle(org.ptr, addHeapObject(handler));
    }

    function handleError(f, args) {
        try {
            return f.apply(this, args);
        } catch (e) {
            wasm.__wbindgen_exn_store(addHeapObject(e));
        }
    }
    /**
    */
    class Org {

        static __wrap(ptr) {
            const obj = Object.create(Org.prototype);
            obj.ptr = ptr;

            return obj;
        }

        __destroy_into_raw() {
            const ptr = this.ptr;
            this.ptr = 0;

            return ptr;
        }

        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_org_free(ptr);
        }
        /**
        * @param {string} input
        * @returns {Org}
        */
        static parse(input) {
            var ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            var ret = wasm.org_parse(ptr0, len0);
            return Org.__wrap(ret);
        }
        /**
        * @returns {any}
        */
        toJson() {
            var ret = wasm.org_toJson(this.ptr);
            return takeObject(ret);
        }
    }

    async function load(module, imports) {
        if (typeof Response === 'function' && module instanceof Response) {
            if (typeof WebAssembly.instantiateStreaming === 'function') {
                try {
                    return await WebAssembly.instantiateStreaming(module, imports);

                } catch (e) {
                    if (module.headers.get('Content-Type') != 'application/wasm') {
                        console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                    } else {
                        throw e;
                    }
                }
            }

            const bytes = await module.arrayBuffer();
            return await WebAssembly.instantiate(bytes, imports);

        } else {
            const instance = await WebAssembly.instantiate(module, imports);

            if (instance instanceof WebAssembly.Instance) {
                return { instance, module };

            } else {
                return instance;
            }
        }
    }

    async function init(input) {
        if (typeof input === 'undefined') {
            input = new URL('orgize_bg.wasm', (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('orgize.umd.js', document.baseURI).href)));
        }
        const imports = {};
        imports.wbg = {};
        imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
            takeObject(arg0);
        };
        imports.wbg.__wbg_text_eacff116c9d25ba8 = function(arg0, arg1) {
            getObject(arg0).text(takeObject(arg1));
        };
        imports.wbg.__wbg_code_e45603f3a3acee2a = function(arg0, arg1) {
            getObject(arg0).code(takeObject(arg1));
        };
        imports.wbg.__wbg_cookie_943df2cebda5c7a8 = function(arg0, arg1) {
            getObject(arg0).cookie(takeObject(arg1));
        };
        imports.wbg.__wbg_rule_ac41d4408306cf75 = function(arg0) {
            getObject(arg0).rule();
        };
        imports.wbg.__wbg_exampleBlock_e460f258fb69dfec = function(arg0, arg1) {
            getObject(arg0).exampleBlock(takeObject(arg1));
        };
        imports.wbg.__wbg_exportBlock_7ed0259a4ddea1d9 = function(arg0, arg1) {
            getObject(arg0).exportBlock(takeObject(arg1));
        };
        imports.wbg.__wbg_sourceBlock_64dd33fe62a8f8b9 = function(arg0, arg1) {
            getObject(arg0).sourceBlock(takeObject(arg1));
        };
        imports.wbg.__wbg_inlineSrc_8ad2df61ac224eb5 = function(arg0, arg1) {
            getObject(arg0).inlineSrc(takeObject(arg1));
        };
        imports.wbg.__wbg_link_f96455b6a98eaa03 = function(arg0, arg1) {
            getObject(arg0).link(takeObject(arg1));
        };
        imports.wbg.__wbg_snippet_a49f8efa760ef01b = function(arg0, arg1) {
            getObject(arg0).snippet(takeObject(arg1));
        };
        imports.wbg.__wbg_timestamp_868efb2143b7bdf4 = function(arg0, arg1) {
            getObject(arg0).timestamp(takeObject(arg1));
        };
        imports.wbg.__wbg_verbatim_c258bc8e42db19eb = function(arg0, arg1) {
            getObject(arg0).verbatim(takeObject(arg1));
        };
        imports.wbg.__wbg_fixedWidth_1015e088ef6b56bb = function(arg0, arg1) {
            getObject(arg0).fixedWidth(takeObject(arg1));
        };
        imports.wbg.__wbg_keyword_97ccd9b6a4b3884f = function(arg0, arg1) {
            getObject(arg0).keyword(takeObject(arg1));
        };
        imports.wbg.__wbg_listStart_ee1ded474089edf2 = function(arg0, arg1) {
            getObject(arg0).listStart(takeObject(arg1));
        };
        imports.wbg.__wbg_listEnd_e0fc45e17135b70f = function(arg0, arg1) {
            getObject(arg0).listEnd(takeObject(arg1));
        };
        imports.wbg.__wbg_tableStart_b36b0eac7e17a037 = function(arg0, arg1) {
            getObject(arg0).tableStart(takeObject(arg1));
        };
        imports.wbg.__wbg_tableRowStart_ea2e2a7f3b971d69 = function(arg0, arg1) {
            getObject(arg0).tableRowStart(takeObject(arg1));
        };
        imports.wbg.__wbg_tableCellStart_4423a32b1f5a97d0 = function(arg0, arg1) {
            getObject(arg0).tableCellStart(takeObject(arg1));
        };
        imports.wbg.__wbg_titleStart_ce36a39a869d08d2 = function(arg0, arg1) {
            getObject(arg0).titleStart(takeObject(arg1));
        };
        imports.wbg.__wbg_titleEnd_daf13a6df95fbc8b = function(arg0, arg1) {
            getObject(arg0).titleEnd(takeObject(arg1));
        };
        imports.wbg.__wbg_boldStart_1462cf63d407a12a = function(arg0) {
            getObject(arg0).boldStart();
        };
        imports.wbg.__wbg_boldEnd_f33c5ee18910ac17 = function(arg0) {
            getObject(arg0).boldEnd();
        };
        imports.wbg.__wbg_centerBlockStart_be814e1757e98e33 = function(arg0, arg1) {
            getObject(arg0).centerBlockStart(takeObject(arg1));
        };
        imports.wbg.__wbg_centerBlockEnd_cce6890e20c8cc89 = function(arg0, arg1) {
            getObject(arg0).centerBlockEnd(takeObject(arg1));
        };
        imports.wbg.__wbg_documentStart_8c884703472d0e01 = function(arg0) {
            getObject(arg0).documentStart();
        };
        imports.wbg.__wbg_documentEnd_ce7d040e2346a0b8 = function(arg0) {
            getObject(arg0).documentEnd();
        };
        imports.wbg.__wbg_italicStart_fabeda64fcb0f22f = function(arg0) {
            getObject(arg0).italicStart();
        };
        imports.wbg.__wbg_italicEnd_f128bacddc013616 = function(arg0) {
            getObject(arg0).italicEnd();
        };
        imports.wbg.__wbg_listItemStart_3c84e38a02d1ef18 = function(arg0) {
            getObject(arg0).listItemStart();
        };
        imports.wbg.__wbg_listItemEnd_156a647d0cdc2e03 = function(arg0) {
            getObject(arg0).listItemEnd();
        };
        imports.wbg.__wbg_paragraphStart_c3ae3baa5665b2a9 = function(arg0) {
            getObject(arg0).paragraphStart();
        };
        imports.wbg.__wbg_paragraphEnd_ad1d24ec846ba612 = function(arg0) {
            getObject(arg0).paragraphEnd();
        };
        imports.wbg.__wbg_quoteBlockStart_b814f62e6482f863 = function(arg0, arg1) {
            getObject(arg0).quoteBlockStart(takeObject(arg1));
        };
        imports.wbg.__wbg_quoteBlockEnd_9f564ef62668ea65 = function(arg0, arg1) {
            getObject(arg0).quoteBlockEnd(takeObject(arg1));
        };
        imports.wbg.__wbg_sectionStart_4d0c540ce85405fe = function(arg0) {
            getObject(arg0).sectionStart();
        };
        imports.wbg.__wbg_sectionEnd_2fdf5e3465afc5c8 = function(arg0) {
            getObject(arg0).sectionEnd();
        };
        imports.wbg.__wbg_strikeStart_b2e30a41e703c645 = function(arg0) {
            getObject(arg0).strikeStart();
        };
        imports.wbg.__wbg_strikeEnd_8337d6b00a8d0a93 = function(arg0) {
            getObject(arg0).strikeEnd();
        };
        imports.wbg.__wbg_underlineStart_eebbb65f73a5f054 = function(arg0) {
            getObject(arg0).underlineStart();
        };
        imports.wbg.__wbg_underlineEnd_95548b86e2129147 = function(arg0) {
            getObject(arg0).underlineEnd();
        };
        imports.wbg.__wbg_verseBlockStart_3bb89682290dd549 = function(arg0, arg1) {
            getObject(arg0).verseBlockStart(takeObject(arg1));
        };
        imports.wbg.__wbg_verseBlockEnd_2960a8b4021c7abf = function(arg0, arg1) {
            getObject(arg0).verseBlockEnd(takeObject(arg1));
        };
        imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
            var ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        };
        imports.wbg.__wbindgen_number_new = function(arg0) {
            var ret = arg0;
            return addHeapObject(ret);
        };
        imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
            var ret = getObject(arg0);
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_set_f1a4ac8f3a605b11 = function(arg0, arg1, arg2) {
            getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
        };
        imports.wbg.__wbg_new_949bbc1147195c4e = function() {
            var ret = new Array();
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_new_ac32179a660db4bb = function() {
            var ret = new Map();
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_new_0b83d3df67ecb33e = function() {
            var ret = new Object();
            return addHeapObject(ret);
        };
        imports.wbg.__wbindgen_is_string = function(arg0) {
            var ret = typeof(getObject(arg0)) === 'string';
            return ret;
        };
        imports.wbg.__wbg_push_284486ca27c6aa8b = function(arg0, arg1) {
            var ret = getObject(arg0).push(getObject(arg1));
            return ret;
        };
        imports.wbg.__wbg_new_342a24ca698edd87 = function(arg0, arg1) {
            var ret = new Error(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_set_a46091b120cc63e9 = function(arg0, arg1, arg2) {
            var ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        };
        imports.wbg.__wbg_fromCodePoint_65bd58e0db7e8253 = function() { return handleError(function (arg0) {
            var ret = String.fromCodePoint(arg0 >>> 0);
            return addHeapObject(ret);
        }, arguments) };
        imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
            var ret = debugString(getObject(arg1));
            var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
        };
        imports.wbg.__wbindgen_throw = function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        };

        if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
            input = fetch(input);
        }



        const { instance, module } = await load(await input, imports);

        wasm = instance.exports;
        init.__wbindgen_wasm_module = module;

        return wasm;
    }

    class Handler {
        text(_text) { }
        code(_item) { }
        cookie(_item) { }
        rule() { }
        exampleBlock(_item) { }
        exportBlock(_item) { }
        sourceBlock(_item) { }
        inlineSrc(_item) { }
        link(_item) { }
        snippet(_item) { }
        timestamp(_item) { }
        verbatim(_item) { }
        fixedWidth(_item) { }
        listStart(_item) { }
        listEnd(_item) { }
        tableStart(_item) { }
        tableEnd(_item) { }
        tableRowStart(_item) { }
        tableRowEnd(_item) { }
        tableCellStart(_item) { }
        tableCellEnd(_item) { }
        titleStart(_item) { }
        titleEnd(_item) { }
        boldStart() { }
        boldEnd() { }
        centerBlockStart(_item) { }
        centerBlockEnd(_item) { }
        documentStart() { }
        documentEnd() { }
        italicStart() { }
        italicEnd() { }
        listItemStart() { }
        listItemEnd() { }
        paragraphStart() { }
        paragraphEnd() { }
        quoteBlockStart(_item) { }
        quoteBlockEnd(_item) { }
        sectionStart() { }
        sectionEnd() { }
        strikeStart() { }
        strikeEnd() { }
        underlineStart() { }
        underlineEnd() { }
        verseBlockStart(_item) { }
        verseBlockEnd(_item) { }
        keyword(_item) { }
    }

    const tags = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
    };
    const replaceTags = (tag) => tags[tag];
    const escapeHtml = (str) => str.replace(/[&<>"']/g, replaceTags);
    class HtmlHandler extends Handler {
        result;
        constructor(result = "") {
            super();
            this.result = result;
        }
        static escape() {
            return "";
        }
        quoteBlockStart() {
            this.result += "<blockquote>";
        }
        quoteBlockEnd() {
            this.result += "</blockquote>";
        }
        centerBlockStart() {
            this.result += '<div class="center">';
        }
        centerBlockEnd() {
            this.result += "</div>";
        }
        verseBlockStart() {
            this.result += '<p class="verse">';
        }
        verseBlockEnd() {
            this.result += "</p>";
        }
        boldStart() {
            this.result += "<b>";
        }
        boldEnd() {
            this.result += "</b>";
        }
        documentStart() {
            this.result += "<main>";
        }
        documentEnd() {
            this.result += "</main>";
        }
        listStart(list) {
            this.result += `<${list.ordered ? "o" : "u"}l>`;
        }
        listEnd(list) {
            this.result += `</${list.ordered ? "o" : "u"}l>`;
        }
        italicStart() {
            this.result += "<i>";
        }
        italicEnd() {
            this.result += "</i>";
        }
        listItemStart() {
            this.result += "<li>";
        }
        listItemEnd() {
            this.result += "</li>";
        }
        paragraphStart() {
            this.result += "<p>";
        }
        paragraphEnd() {
            this.result += "</p>";
        }
        sectionStart() {
            this.result += "<section>";
        }
        sectionEnd() {
            this.result += "</section>";
        }
        strikeStart() {
            this.result += "<s>";
        }
        strikeEnd() {
            this.result += "</s>";
        }
        underlineStart() {
            this.result += "<u>";
        }
        underlineEnd() {
            this.result += "</u>";
        }
        exampleBlock(block) {
            this.result += `<pre class="example">${escapeHtml(block.contents)}</pre>`;
        }
        sourceBlock(block) {
            this.result += `<pre class="example">${escapeHtml(block.contents)}</pre>`;
        }
        inlineSrc(src) {
            this.result += `<code class="src src-${src.lang}">${escapeHtml(src.body)}</code>`;
        }
        code(value) {
            this.result += `<code>${escapeHtml(value)}</code>`;
        }
        link(link) {
            this.result += `<a href="${link.path}">${escapeHtml(link.desc || link.path)}</a>`;
        }
        snippet(snippet) {
            if (snippet.name.toLowerCase() === "html") {
                this.result += snippet.value;
            }
        }
        text(value) {
            this.result += escapeHtml(value);
        }
        verbatim(value) {
            this.result += `<code>${escapeHtml(value)}</code>`;
        }
        fixedWidth(item) {
            this.result += `<pre class="example">${escapeHtml(item.value)}</pre>`;
        }
        rule() {
            this.result += "<hr>";
        }
        cookie(cookie) {
            this.result += `<code>${escapeHtml(cookie.value)}</code>`;
        }
        titleStart(title) {
            this.result += `<h${Math.min(title.level, 6)}>`;
        }
        titleEnd(title) {
            this.result += `</h${Math.min(title.level, 6)}>`;
        }
    }

    class CollectKeywords extends Handler {
        keywords = {};
        keyword(keyword) {
            this.keywords[keyword.key] = this.keywords[keyword.key] || [];
            this.keywords[keyword.key].push(keyword.value);
        }
    }

    const handle = (org, handler) => {
        if (typeof org === "string") {
            org = Org.parse(org);
        }
        handle$1(org, handler);
    };
    const renderHtml = (org, handler = new HtmlHandler()) => {
        handle(org, handler);
        return handler.result;
    };
    const keywords = (org) => {
        const handler = new CollectKeywords();
        handle(org, handler);
        return handler.keywords;
    };

    exports.Handler = Handler;
    exports.HtmlHandler = HtmlHandler;
    exports.Org = Org;
    exports.escapeHtml = escapeHtml;
    exports.handle = handle;
    exports.init = init;
    exports.keywords = keywords;
    exports.renderHtml = renderHtml;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

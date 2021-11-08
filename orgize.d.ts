/**
*/
declare class Org {
  free(): void;
/**
* @param {string} input
* @returns {Org}
*/
  static parse(input: string): Org;
/**
* @returns {any}
*/
  toJson(): any;
}

type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_org_free: (a: number) => void;
  readonly org_parse: (a: number, b: number) => number;
  readonly org_toJson: (a: number) => number;
  readonly handle: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
declare function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;

declare class Handler {
    text(_text: string): void;
    code(_item: string): void;
    cookie(_item: Cookie): void;
    rule(): void;
    exampleBlock(_item: Block): void;
    exportBlock(_item: Block): void;
    sourceBlock(_item: SourceBlock): void;
    inlineSrc(_item: InlineSrc): void;
    link(_item: Link): void;
    snippet(_item: Snippet): void;
    timestamp(_item: any): void;
    verbatim(_item: string): void;
    fixedWidth(_item: FixedWidth): void;
    listStart(_item: List): void;
    listEnd(_item: List): void;
    tableStart(_item: any): void;
    tableEnd(_item: any): void;
    tableRowStart(_item: any): void;
    tableRowEnd(_item: any): void;
    tableCellStart(_item: any): void;
    tableCellEnd(_item: any): void;
    titleStart(_item: Title): void;
    titleEnd(_item: Title): void;
    boldStart(): void;
    boldEnd(): void;
    centerBlockStart(_item: any): void;
    centerBlockEnd(_item: any): void;
    documentStart(): void;
    documentEnd(): void;
    italicStart(): void;
    italicEnd(): void;
    listItemStart(): void;
    listItemEnd(): void;
    paragraphStart(): void;
    paragraphEnd(): void;
    quoteBlockStart(_item: any): void;
    quoteBlockEnd(_item: any): void;
    sectionStart(): void;
    sectionEnd(): void;
    strikeStart(): void;
    strikeEnd(): void;
    underlineStart(): void;
    underlineEnd(): void;
    verseBlockStart(_item: any): void;
    verseBlockEnd(_item: any): void;
    keyword(_item: Keyword): void;
}
declare type Title = {
    level: number;
    priority?: string;
    tags?: string[];
    keyword?: string;
    raw: string;
    properties?: {
        [key: string]: string;
    };
    post_blank: number;
};
declare type List = {
    ordered: boolean;
};
declare type Block = {
    contents: string;
};
declare type InlineSrc = {
    lang: string;
    body: string;
};
declare type Link = {
    path: string;
    desc?: string;
};
declare type FixedWidth = {
    value: string;
};
declare type Cookie = {
    value: string;
};
declare type SourceBlock = {
    contents: string;
    language: string;
    arguments: string;
    post_blank: number;
};
declare type Keyword = {
    key: string;
    optional?: string;
    value: string;
};
declare type Snippet = {
    name: string;
    value: string;
};

declare const escapeHtml: (str: string) => string;
declare class HtmlHandler extends Handler {
    result: string;
    constructor(result?: string);
    static escape(): string;
    quoteBlockStart(): void;
    quoteBlockEnd(): void;
    centerBlockStart(): void;
    centerBlockEnd(): void;
    verseBlockStart(): void;
    verseBlockEnd(): void;
    boldStart(): void;
    boldEnd(): void;
    documentStart(): void;
    documentEnd(): void;
    listStart(list: List): void;
    listEnd(list: List): void;
    italicStart(): void;
    italicEnd(): void;
    listItemStart(): void;
    listItemEnd(): void;
    paragraphStart(): void;
    paragraphEnd(): void;
    sectionStart(): void;
    sectionEnd(): void;
    strikeStart(): void;
    strikeEnd(): void;
    underlineStart(): void;
    underlineEnd(): void;
    exampleBlock(block: Block): void;
    sourceBlock(block: Block): void;
    inlineSrc(src: InlineSrc): void;
    code(value: string): void;
    link(link: Link): void;
    snippet(snippet: Snippet): void;
    text(value: string): void;
    verbatim(value: string): void;
    fixedWidth(item: FixedWidth): void;
    rule(): void;
    cookie(cookie: Cookie): void;
    titleStart(title: Title): void;
    titleEnd(title: Title): void;
}

declare const handle: (org: Org | string, handler: Handler) => void;
declare const renderHtml: (org: Org | string, handler?: HtmlHandler) => string;
declare const keywords: (org: Org | string) => {
    [key: string]: string[];
};

export { Block, Cookie, FixedWidth, Handler, HtmlHandler, InitInput, InitOutput, InlineSrc, Keyword, Link, List, Org, Snippet, SourceBlock, Title, escapeHtml, handle, init, keywords, renderHtml };

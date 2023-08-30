import { Endian } from '../common.ts';
import { SnapTuple } from './snap-tuple.ts';
import { Coding } from '../coding/face.ts';
import { SafeAny } from '../utils/prototype-util.ts';

export type ScopeAccessor = Record<string | symbol | number, SafeAny>

export type ContextCompute<Result> = (ctx: ParserContext, scope: ScopeAccessor, option: ContextOption) => Result

// 可动态配置的option
export type ContextOption = {
    point: number, // fixed, cannot computable
    consume: boolean,
};

// 固定的配置，我们认定这些配置不需要在解析过程中发生改变
export type ContextConstant = {
    $path: string | symbol,
    path: string,
    ends: number,
    coding: Coding,
    /**
     * 所有数据都是基于原始数类型做的读写处理，
     * 所以endian会被最频繁的访问，
     * 所以还是将他分离到Constant中，只支持在起点和终点配置
     */
    endian: Endian,
    DebugStruct: (new () => SafeAny)[],
};

export type ParserContext = {
    buffer: ArrayBuffer,
    view: DataView,
    constant: ContextConstant,
    /* 灵活的配置参数，可在每一层自由定制 */
    option: Required<ContextOption>,
    /* 作用域，提供一些上下文产生的数据的访问功能 */
    scope: ScopeAccessor,
    /* context中保留着一切需要的数据，所以read，write操作最终交付给context执行 */
    read<T>(parser: Parser<T>, option?: Partial<ContextOption>): SnapTuple<T extends (number | bigint) ? T : (T | (() => T))>,
    write<T>(parser: Parser<T>, value: T, option?: Partial<ContextOption>): SnapTuple<T extends (number | bigint) ? T : (T | (() => T))>,
    skip(size: number): void,
    /* 向scope中暴露变量 */
    expose(name: string | number | symbol, value: unknown): void,
    /* 将计算函数交给context进行计算 */
    compute<Result>(getter: ContextCompute<Result>): Result,
    /* 包裹一个读取结果，todo: 这里可能占用了做多的内存 */
    result<T>(value: T, size?: number): SnapTuple<T>,
    /* 派生一个自context */
    derive(...options: (Partial<ContextOption> | undefined)[]): ParserContext,
    start: number, // context开始的offset
    size: number, // context已经消费掉的size，不是固定的
    end: number, // end并不是固定的，取到的值是start+size
    take: [ number, number ], // [start, end]
}

export interface Parser<T> {
    read(parentContext: ParserContext, byteOffset: number): T;

    write(parentContext: ParserContext, value: T, byteOffset: number): T;
}

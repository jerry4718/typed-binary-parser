// 字符串解析器
import { type Coding, Utf8 } from '../coding/codings.ts';
import { AdvancedParser, AdvancedParserConfig, createParserCreator } from '../context/base-parser.ts';
import { ParserContext } from '../context/types.ts';
import { BaseTypedArrayParser, TypedArrayConfigLoopCount, TypedArrayParserConfigComputed, Uint8ArrayParserCreator } from './typed-array-parser.ts';
import { calcGetter } from '../context/getters.ts';

type StringParserConfig =
    & AdvancedParserConfig
    & Exclude<TypedArrayParserConfigComputed<number>, TypedArrayConfigLoopCount>
    & { coding?: Coding }

export class StringParser extends AdvancedParser<string> {
    coding: Coding;
    dataParser: BaseTypedArrayParser<number, Uint8Array>;

    constructor(config: StringParserConfig) {
        super(config);
        const { coding = Utf8, ...computed } = config;
        this.coding = coding;
        this.dataParser = Uint8ArrayParserCreator(computed);
    }

    sizeof(context?: ParserContext): number {
        return this.dataParser.sizeof(context);
    }

    read(ctx: ParserContext): string {
        const [ readArray ] = ctx.read(this.dataParser);
        return this.coding.decode(calcGetter(readArray));
    }

    write(ctx: ParserContext, value: string): string {
        const byteArray = this.coding.encode(value);
        ctx.write(this.dataParser, byteArray);
        return value;
    }
}

const StringParserCreator = createParserCreator(StringParser);

export {
    StringParserCreator,
    StringParserCreator as String,
    StringParserCreator as string,
};

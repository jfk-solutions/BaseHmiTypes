# Stored structured recipe values

HmiRecipeDataSet.SourceStructuredValues/sourceStructuredValues retains exact source keys and detached HmiRecipeStructuredValue trees. Matching C#/TS kinds cover Null, Scalar, Map, Array, Binary, Reference, Unsupported, Recursive and DepthLimit. Ordered map entries retain exact string keys; array positions describe storage order without PLC-bound inference. Existing scalar/array/binary collections remain separate.

Recipe HTML renders the tree after stored binary values, in standalone documents and ConvertFragment/convertFragment. Keys, scalar content, source types, references and binary details are encoded. Empty/unavailable data remains distinct. Renderer ancestor guards and a 128-container limit protect directly constructed shared models; repeated aliases render independently. Parameter-control fragment reuse includes structured values.

Validation: all 45 C# and 44 TypeScript recipe checks passed without skips, including three new structured-renderer checks per language and extended fragment embedding checks. TypeScript build and all three C# target builds passed. Synthetic model checks establish rendering behavior, not complete native extraction, application-specific schemas or runtime recipe records.

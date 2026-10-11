# Stored structured recipe values

HmiRecipeDataSet.SourceStructuredValues/sourceStructuredValues retains exact source keys and detached HmiRecipeStructuredValue trees. Matching C#/TS kinds cover Null, Scalar, Map, Array, Binary, Reference, Unsupported, Recursive, DepthLimit and Text. Ordered map entries retain exact string keys; array positions describe storage order without PLC-bound inference. Existing scalar/array/binary collections remain separate.

Recipe HTML renders the tree after stored binary values, in standalone documents and ConvertFragment/convertFragment. Keys, scalar content, source types, references and binary details are encoded. Empty/unavailable data remains distinct. Renderer ancestor guards and a 128-container limit protect directly constructed shared models; repeated aliases render independently. Parameter-control fragment reuse includes structured values.

Validation uses RecipeStructuredHtmlTests/recipe-structured-html.test.js and RecipeFragmentHtmlTests/recipe-fragment-html.test.js. Synthetic model checks establish rendering behavior, not complete native extraction, application-specific schemas or runtime recipe records.

Text nodes retain detached HmiMultilingualText translations/formatted payloads/category metadata and optional raw SourceTextFlags. Recipe documents and screen fragments pass the selected culture through map/array recursion and encode plain GetText output. Formatted source payloads are preserved without execution. Text is appended to the C# kind enum to retain existing ordinal values. Missing text remains distinct from Null.

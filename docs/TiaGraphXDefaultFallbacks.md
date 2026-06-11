# TIA GraphX Default Fallback Calls

Generated from Siemens.Simatic.Hmi.GraphX.GraphXManagers.Scan.dll decompilation in TIA Portal V21.

`HmiScreenItem.GetPropertyValueWithDefault<T>(IHmiObject hmiScreenItem, string propertyName, T defaultValue)` initializes the result from the caller-provided `defaultValue`, then reads the property from `InstanceProxy`; if the property exists it returns the proxy value, otherwise it keeps the caller fallback.

So the fallback argument is a real GraphX default for that call path. It is not one global default table: the same property can have different fallback values in different GraphX classes/methods. In BaseHmiTypes this means the profile should set the common value on the highest matching base type and set concrete overrides where GraphX uses a different value.

Advanced storage defaults are also read elsewhere through `ScreenItemManager.GetStorageDefaults(subType)`, for example from `HmiScreenItemPropertyResolver.GetDefaultValue(...)` and `HmiScreenItem.GetExpandoValue(...)`.

Full source-line list: docs/TiaGraphXDefaultFallbacks.csv (238 rows).

Full call-context list: docs/TiaGraphXDefaultFallbacksByContext.csv (245 calls; some source lines contain multiple fallback calls).

## Enum Values Used In BaseHmiTypes

These numeric values were checked in TIA V21 IL call sites and are used because BaseHmiTypes currently stores the corresponding Advanced enum-backed properties as `int`.

| Siemens enum member | Numeric value | Evidence |
| --- | ---: | --- |
| `LineStyle.None` | -1 | `EdgeStylePhaseConverter.ConvertPageNumberEdgeStyle`, token `0x06000B67`, emits `ldc.i4.m1` |
| `LineStyle.Solid` | 0 | `EdgeStylePhaseConverter.GetSymbolicIoFieldConvertProperties`, token `0x06000B73`, emits `ldc.i4.0` |
| `FillStyle.Solid` | 0 | `HmiScreenItem.IsGradientInExtendedContext`, token `0x06000BB3`, emits `ldc.i4.0` for fallback |
| `WinCCStyle.GlobalDesign` | 1 | `HmiButton.IsDrawInsideFrameDisabled`, token `0x060001FF`, emits `ldc.i4.1` for fallback |
| `WinCCStyle.WindowsStyle` | 2 | same method compares `WinCCStyle.WindowsStyle` with `ldc.i4.2` |
| `SymbolicIOFieldType.InOutput` | 2 | `EdgeStylePhaseConverter.GetSymbolicIoFieldConvertProperties`, token `0x06000B73`, emits `ldc.i4.2` |
| `SwitchType.Switch` | 0 | `EdgeStylePhaseConverter.ConvertSwitchBorderStyle3DOldPanels`, token `0x06000B69`, emits `ldc.i4.0` |
| `ClockNumberStyle.NoNumber` | 0 | `HmiClock.IsFontDisabled`, token `0x060002AF`, emits `ldc.i4.0` |

## Unique Fallback Pairs

| Count | Kind | Property | Fallback | First Line |
| ---: | --- | --- | --- | ---: |
| 20 | GetPropertyValueWithDefault | Analog | true | 9871 |
| 5 | GetPropertyValueWithDefault | BackFillStyle | FillStyle.Solid | 7818 |
| 7 | GetPropertyValueWithDefault | BorderWidth | 1 | 6124 |
| 1 | GetPropertyValueWithDefault | CompatibilityMode | false | 35332 |
| 1 | GetPropertyValueWithDefault | CompatibilityMode | true | 44889 |
| 5 | GetPropertyValueWithDefault | DrawInsideFrame | true | 5937 |
| 2 | GetPropertyValueWithDefault | EdgeStyle | LineStyle.Solid | 6105 |
| 9 | GetPropertyValueWithDefault | Flashing | FlashingType.None | 5966 |
| 6 | GetPropertyValueWithDefault | FlashingOnLimitViolation | false | 5968 |
| 1 | GetPropertyValueWithDefault | FocusWidth | 1 | 8025 |
| 1 | GetPropertyValueWithDefault | MaintainOriginalSize | true | 8226 |
| 1 | GetPropertyValueWithDefault | NumberStyle | ClockNumberStyle.NoNumber | 10011 |
| 1 | GetPropertyValueWithDefault | PictureList | HmiObjectHandle.Empty | 14456 |
| 1 | GetPropertyValueWithDefault | ShowDate | true | 11885 |
| 12 | GetPropertyValueWithDefault | ShowDropDownButton | true | 40108 |
| 1 | GetPropertyValueWithDefault | ShowDropDownList | true | 40625 |
| 5 | GetPropertyValueWithDefault | ShowFillLevel | false | 7925 |
| 3 | GetPropertyValueWithDefault | ShowInnerDial | false | 13427 |
| 6 | GetPropertyValueWithDefault | ShowLimitRanges | false | 6181 |
| 1 | GetPropertyValueWithDefault | ShowScale | true | 5930 |
| 1 | GetPropertyValueWithDefault | ShowTickLabels | true | 5944 |
| 7 | GetPropertyValueWithDefault | StyleSettings | WinCCStyle.GlobalDesign | 7815 |
| 3 | GetPropertyValueWithDefault | UseAutoScaling | true | 6002 |
| 97 | GetPropertyValueWithDefault | UseDesignColorSchema | true | 5910 |
| 1 | GetPropertyValueWithDefault | UseFirstGradient | false | 38998 |
| 2 | GetPropertyValueWithDefault | UseSecondGradient | false | 39003 |
| 1 | GetPropertyValueWithDefault | UseTransparentColor | false | 14407 |
| 2 | GetPropertyValueWithDefault | UseTransparentColor | true | 13859 |
| 7 | GetPropertyValueWithDefault | WindowsStyle | true | 7817 |
| 1 | GetScreenItemPropertyOrDefault | BarEdgeStyle | LineStyle.Solid | 43611 |
| 5 | GetScreenItemPropertyOrDefault | BorderStyle3D | false | 43250 |
| 3 | GetScreenItemPropertyOrDefault | BorderStyle3D | true | 43211 |
| 1 | GetScreenItemPropertyOrDefault | BorderWidth | 0 | 43430 |
| 4 | GetScreenItemPropertyOrDefault | BorderWidth | 1 | 43251 |
| 6 | GetScreenItemPropertyOrDefault | EdgeStyle | LineStyle.None | 43191 |
| 4 | GetScreenItemPropertyOrDefault | EdgeStyle | LineStyle.Solid | 43205 |
| 1 | GetScreenItemPropertyOrDefault | Mode | SwitchType.Switch | 43212 |
| 2 | GetScreenItemPropertyOrDefault | Mode | SymbolicIOFieldType.InOutput | 43323 |
| 1 | GetScreenItemPropertyOrDefault | ShowDropDownList | true | 43398 |

import type { HmiProperty } from "./HmiProperty.js";
import type { HmiColor } from "./HmiColor.js";
/** Editable engineering settings independent of a binding's preview expression. */
export interface HmiUnifiedTagDynamization {
    propertyName?: string;
    tagName?: string;
    address?: string;
    dataType?: string;
    plcTag?: string;
    readOnly?: boolean;
    useIndirectAddressing?: boolean;
    /** A defined list reference identifies a ResourceList dynamization. */
    resourceList?: string;
    valueConverter?: HmiUnifiedValueConverter;
}
export interface HmiUnifiedValueConverter {
    mappingTable?: HmiUnifiedMappingTable;
}
export interface HmiUnifiedMappingTable {
    conditionType?: string;
    entries: HmiUnifiedMappingEntry[];
}
/** UInt64 masks remain bigint; converting them through number loses engineering bits. */
export interface HmiUnifiedMappingEntry {
    rangeType?: string;
    bitDynamizationType?: string;
    from?: number | bigint;
    to?: number | bigint;
    condition?: bigint;
    relevant?: bigint;
    value?: boolean | string | number | HmiColor;
    alternateValue?: boolean | string | number | HmiColor;
    flashing?: boolean;
    flashingRate?: string;
}
export class HmiInputBehavior {
    acceptOnDeactivated?: HmiProperty<boolean>;
    clearOnActivate?: HmiProperty<boolean>;
    hiddenInput?: HmiProperty<boolean>;
}

import { GetProps, ReactComponentWithRef } from '@tamagui/core';
import { View } from 'react-native';
export declare const LabelFrame: import("@tamagui/core").TamaguiComponent<(Omit<import("react-native").ViewProps, "children" | "display"> & import("@tamagui/core").RNWViewProps & import("@tamagui/core").TamaguiComponentPropsBase & import("@tamagui/core").WithThemeValues<import("@tamagui/core").StackStylePropsBase> & import("@tamagui/core").WithShorthands<import("@tamagui/core").WithThemeValues<import("@tamagui/core").StackStylePropsBase>> & Omit<{
    fullscreen?: boolean | undefined;
    elevation?: import("@tamagui/core").SizeTokens | undefined;
}, "fontFamily" | "size" | "focusable" | "disabled" | "transparent" | "hoverable" | "pressable" | "bordered" | "chromeless"> & {
    fontFamily?: unknown;
    hoverable?: boolean | undefined;
    pressable?: boolean | undefined;
    focusable?: boolean | undefined;
    bordered?: boolean | undefined;
    size?: import("@tamagui/core").SizeTokens | undefined;
    disabled?: boolean | undefined;
    transparent?: boolean | undefined;
    chromeless?: boolean | undefined;
} & import("@tamagui/core").MediaProps<Partial<Omit<import("react-native").ViewProps, "children" | "display"> & import("@tamagui/core").RNWViewProps & import("@tamagui/core").TamaguiComponentPropsBase & import("@tamagui/core").WithThemeValues<import("@tamagui/core").StackStylePropsBase> & import("@tamagui/core").WithShorthands<import("@tamagui/core").WithThemeValues<import("@tamagui/core").StackStylePropsBase>> & Omit<{
    fullscreen?: boolean | undefined;
    elevation?: import("@tamagui/core").SizeTokens | undefined;
}, "fontFamily" | "size" | "focusable" | "disabled" | "transparent" | "hoverable" | "pressable" | "bordered" | "chromeless"> & {
    fontFamily?: unknown;
    hoverable?: boolean | undefined;
    pressable?: boolean | undefined;
    focusable?: boolean | undefined;
    bordered?: boolean | undefined;
    size?: import("@tamagui/core").SizeTokens | undefined;
    disabled?: boolean | undefined;
    transparent?: boolean | undefined;
    chromeless?: boolean | undefined;
}>> & import("@tamagui/core").PseudoProps<Partial<Omit<import("react-native").ViewProps, "children" | "display"> & import("@tamagui/core").RNWViewProps & import("@tamagui/core").TamaguiComponentPropsBase & import("@tamagui/core").WithThemeValues<import("@tamagui/core").StackStylePropsBase> & import("@tamagui/core").WithShorthands<import("@tamagui/core").WithThemeValues<import("@tamagui/core").StackStylePropsBase>> & Omit<{
    fullscreen?: boolean | undefined;
    elevation?: import("@tamagui/core").SizeTokens | undefined;
}, "fontFamily" | "size" | "focusable" | "disabled" | "transparent" | "hoverable" | "pressable" | "bordered" | "chromeless"> & {
    fontFamily?: unknown;
    hoverable?: boolean | undefined;
    pressable?: boolean | undefined;
    focusable?: boolean | undefined;
    bordered?: boolean | undefined;
    size?: import("@tamagui/core").SizeTokens | undefined;
    disabled?: boolean | undefined;
    transparent?: boolean | undefined;
    chromeless?: boolean | undefined;
}>>) | (Omit<import("react-native").ViewProps, "children" | "display"> & import("@tamagui/core").RNWViewProps & import("@tamagui/core").TamaguiComponentPropsBase & import("@tamagui/core").WithThemeValues<import("@tamagui/core").StackStylePropsBase> & import("@tamagui/core").WithShorthands<import("@tamagui/core").WithThemeValues<import("@tamagui/core").StackStylePropsBase>> & Omit<{
    fullscreen?: boolean | undefined;
    elevation?: import("@tamagui/core").SizeTokens | undefined;
} & {
    fontFamily?: unknown;
    hoverable?: boolean | undefined;
    pressable?: boolean | undefined;
    focusable?: boolean | undefined;
    bordered?: boolean | undefined;
    size?: import("@tamagui/core").SizeTokens | undefined;
    disabled?: boolean | undefined;
    transparent?: boolean | undefined;
    chromeless?: boolean | undefined;
}, string | number> & {
    [x: string]: undefined;
} & import("@tamagui/core").MediaProps<Partial<Omit<import("react-native").ViewProps, "children" | "display"> & import("@tamagui/core").RNWViewProps & import("@tamagui/core").TamaguiComponentPropsBase & import("@tamagui/core").WithThemeValues<import("@tamagui/core").StackStylePropsBase> & import("@tamagui/core").WithShorthands<import("@tamagui/core").WithThemeValues<import("@tamagui/core").StackStylePropsBase>> & Omit<{
    fullscreen?: boolean | undefined;
    elevation?: import("@tamagui/core").SizeTokens | undefined;
} & {
    fontFamily?: unknown;
    hoverable?: boolean | undefined;
    pressable?: boolean | undefined;
    focusable?: boolean | undefined;
    bordered?: boolean | undefined;
    size?: import("@tamagui/core").SizeTokens | undefined;
    disabled?: boolean | undefined;
    transparent?: boolean | undefined;
    chromeless?: boolean | undefined;
}, string | number> & {
    [x: string]: undefined;
}>> & import("@tamagui/core").PseudoProps<Partial<Omit<import("react-native").ViewProps, "children" | "display"> & import("@tamagui/core").RNWViewProps & import("@tamagui/core").TamaguiComponentPropsBase & import("@tamagui/core").WithThemeValues<import("@tamagui/core").StackStylePropsBase> & import("@tamagui/core").WithShorthands<import("@tamagui/core").WithThemeValues<import("@tamagui/core").StackStylePropsBase>> & Omit<{
    fullscreen?: boolean | undefined;
    elevation?: import("@tamagui/core").SizeTokens | undefined;
} & {
    fontFamily?: unknown;
    hoverable?: boolean | undefined;
    pressable?: boolean | undefined;
    focusable?: boolean | undefined;
    bordered?: boolean | undefined;
    size?: import("@tamagui/core").SizeTokens | undefined;
    disabled?: boolean | undefined;
    transparent?: boolean | undefined;
    chromeless?: boolean | undefined;
}, string | number> & {
    [x: string]: undefined;
}>>), any, import("@tamagui/core").StackPropsBase, {
    fullscreen?: boolean | undefined;
    elevation?: import("@tamagui/core").SizeTokens | undefined;
} & {
    fontFamily?: unknown;
    hoverable?: boolean | undefined;
    pressable?: boolean | undefined;
    focusable?: boolean | undefined;
    bordered?: boolean | undefined;
    size?: import("@tamagui/core").SizeTokens | undefined;
    disabled?: boolean | undefined;
    transparent?: boolean | undefined;
    chromeless?: boolean | undefined;
} & ({} | {
    [x: string]: undefined;
})>;
export declare type LabelProps = GetProps<typeof LabelFrame> & {
    htmlFor: string;
};
export declare const Label: ReactComponentWithRef<LabelProps, HTMLButtonElement | View>;
export declare const useLabelContext: (element?: HTMLElement | null | undefined) => string | undefined;
//# sourceMappingURL=Label.d.ts.map
import { createElement } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
function panelStyle(presentation) {
    if (presentation === 'screen') {
        return {
            flex: 1,
            justifyContent: 'center',
            padding: 24,
            backgroundColor: '#ffffff',
        };
    }
    return {
        width: '100%',
        maxWidth: presentation === 'modal' ? 360 : undefined,
        borderRadius: presentation === 'modal' ? 16 : 20,
        borderBottomLeftRadius: presentation === 'bottom-sheet' ? 0 : undefined,
        borderBottomRightRadius: presentation === 'bottom-sheet' ? 0 : undefined,
        padding: 20,
        backgroundColor: '#ffffff',
    };
}
function wrapperStyle(presentation) {
    if (presentation === 'bottom-sheet') {
        return {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.42)',
        };
    }
    return {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: presentation === 'modal' ? 'rgba(0,0,0,0.42)' : '#ffffff',
    };
}
function content(props) {
    var _a, _b, _c, _d;
    const presentation = (_a = props.presentation) !== null && _a !== void 0 ? _a : 'bottom-sheet';
    const accentColor = (_b = props.accentColor) !== null && _b !== void 0 ? _b : '#2563eb';
    return createElement(View, { style: [panelStyle(presentation), props.style] }, props.icon
        ? createElement(View, { style: { alignSelf: 'flex-start', marginBottom: 12 } }, props.icon)
        : null, createElement(Text, { style: [{ color: '#111827', fontSize: 20, fontWeight: '700', marginBottom: 8 }, props.titleStyle] }, props.title), props.message
        ? createElement(Text, { style: [{ color: '#4b5563', fontSize: 15, lineHeight: 22, marginBottom: 18 }, props.messageStyle] }, props.message)
        : null, createElement(Pressable, {
        accessibilityRole: 'button',
        onPress: props.onPrimary,
        style: {
            alignItems: 'center',
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: accentColor,
        },
    }, createElement(Text, { style: { color: '#ffffff', fontSize: 16, fontWeight: '600' } }, (_c = props.primaryLabel) !== null && _c !== void 0 ? _c : 'Continue')), props.onSecondary
        ? createElement(Pressable, {
            accessibilityRole: 'button',
            onPress: props.onSecondary,
            style: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
        }, createElement(Text, { style: { color: '#4b5563', fontSize: 15, fontWeight: '600' } }, (_d = props.secondaryLabel) !== null && _d !== void 0 ? _d : 'Not now'))
        : null);
}
export function PermitDialog(props) {
    var _a, _b;
    const presentation = (_a = props.presentation) !== null && _a !== void 0 ? _a : 'bottom-sheet';
    const visible = (_b = props.visible) !== null && _b !== void 0 ? _b : true;
    if (presentation === 'inline' || presentation === 'screen') {
        if (!visible)
            return null;
        return presentation === 'screen'
            ? createElement(View, { style: wrapperStyle(presentation) }, content(props))
            : content(props);
    }
    return createElement(Modal, {
        visible,
        transparent: true,
        animationType: presentation === 'bottom-sheet' ? 'slide' : 'fade',
        onRequestClose: props.onDismiss,
    }, createElement(Pressable, { style: wrapperStyle(presentation), onPress: props.onDismiss }, createElement(Pressable, { onPress: undefined }, content(props))));
}

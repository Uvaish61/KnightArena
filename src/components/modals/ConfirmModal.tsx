import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, shadows, spacing } from '../../theme/theme';

export interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
}

export function ConfirmModal({ visible, title, message, confirmLabel, cancelLabel, destructive, onConfirm, onCancel }: ConfirmModalProps) {
    const dismiss = onCancel ?? onConfirm;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
            <View style={styles.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
                <View style={styles.card}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.actions}>
                        {cancelLabel ? (
                            <Pressable style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]} onPress={onCancel}>
                                <Text style={styles.cancelLabel}>{cancelLabel}</Text>
                            </Pressable>
                        ) : null}
                        <Pressable
                            style={({ pressed }) => [styles.button, destructive ? styles.destructiveButton : styles.confirmButton, pressed && styles.pressed]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmLabel}>{confirmLabel}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(6,4,4,0.82)',
        paddingHorizontal: 32,
    },
    card: {
        width: '100%',
        borderRadius: radii.xl,
        backgroundColor: colors.modalBg,
        borderWidth: 1,
        borderColor: 'rgba(232,64,64,0.2)',
        padding: spacing.lg,
        ...shadows.card,
    },
    title: {
        color: colors.textPrimary,
        fontFamily: fonts.heading,
        fontSize: 22,
    },
    message: {
        marginTop: 8,
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: spacing.lg,
    },
    button: {
        flex: 1,
        minHeight: 48,
        borderRadius: radii.pill,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: StyleSheet.hairlineWidth,
    },
    pressed: {
        transform: [{ scale: 0.98 }],
    },
    cancelButton: {
        backgroundColor: colors.surface,
        borderColor: colors.surfaceBorder,
    },
    cancelLabel: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '700',
    },
    confirmButton: {
        backgroundColor: colors.accentMuted,
        borderColor: colors.accentBorder,
    },
    destructiveButton: {
        backgroundColor: colors.accent,
        borderColor: colors.accentBorder,
    },
    confirmLabel: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '700',
    },
});

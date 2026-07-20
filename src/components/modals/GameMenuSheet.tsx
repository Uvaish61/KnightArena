import React, { useMemo } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Play, Handshake, RotateCcw, Flag, Home } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radii, shadows, spacing } from '../../theme/theme';

export interface GameMenuSheetProps {
    visible: boolean;
    onResume: () => void;
    onOfferDraw: () => void;
    onUndo: () => void;
    onResign: () => void;
    onQuitHome: () => void;
}

type OptionStyle = 'primary' | 'surface' | 'destructive';

export function GameMenuSheet({ visible, onResume, onOfferDraw, onUndo, onResign, onQuitHome }: GameMenuSheetProps) {
    const insets = useSafeAreaInsets();

    const options = useMemo(
        () => [
            {
                icon: <Play size={18} color="#fff" />,
                label: 'Resume Game',
                sub: 'Continue playing',
                style: 'primary' as OptionStyle,
                onPress: onResume,
            },
            {
                icon: <Handshake size={18} color={colors.textSecondary} />,
                label: 'Offer Draw',
                sub: 'Propose a draw to opponent',
                style: 'surface' as OptionStyle,
                onPress: onOfferDraw,
            },
            {
                icon: <RotateCcw size={18} color={colors.textSecondary} />,
                label: 'Undo Last Move',
                sub: 'Take back your last move',
                style: 'surface' as OptionStyle,
                onPress: onUndo,
            },
            {
                icon: <Flag size={18} color={colors.accent} />,
                label: 'Resign Game',
                sub: 'Concede defeat to opponent',
                style: 'destructive' as OptionStyle,
                onPress: () => {
                    Alert.alert('Resign?', 'Are you sure you want to resign?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Resign', style: 'destructive', onPress: onResign },
                    ]);
                },
            },
        ],
        [onOfferDraw, onResign, onResume, onUndo],
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onResume}>
            <View style={styles.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onResume} />
                <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                    <View style={styles.handle} />
                    <Text style={styles.kicker}>GAME PAUSED</Text>
                    <Text style={styles.title}>What would you like to do?</Text>

                    <View style={styles.list}>
                        {options.map((option) => (
                            <Pressable key={option.label} style={({ pressed }) => [styles.option, option.style === 'primary' && styles.optionPrimary, option.style === 'destructive' && styles.optionDestructive, pressed && styles.optionPressed]} onPress={option.onPress}>
                                <View style={[styles.optionIconWrap, option.style === 'primary' && styles.optionIconWrapPrimary, option.style === 'destructive' && styles.optionIconWrapDestructive]}>{option.icon}</View>
                                <View style={styles.optionCopy}>
                                    <Text style={[styles.optionLabel, option.style === 'primary' && styles.optionLabelPrimary, option.style === 'destructive' && styles.optionLabelDestructive]}>{option.label}</Text>
                                    <Text style={styles.optionSub}>{option.sub}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>

                    <View style={styles.quitDivider} />
                    <Pressable onPress={onQuitHome} style={styles.quitButton}>
                        <Home size={16} color={colors.textMuted} />
                        <Text style={styles.quitText}>Quit to Home</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(6,4,4,0.8)',
    },
    sheet: {
        backgroundColor: colors.modalBg,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderTopWidth: 1,
        borderColor: 'rgba(232,64,64,0.15)',
        paddingHorizontal: 16,
        paddingTop: 10,
        ...shadows.card,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 999,
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginBottom: 12,
    },
    kicker: {
        color: 'rgba(232,64,64,0.6)',
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 2,
    },
    title: {
        marginTop: 4,
        color: colors.textPrimary,
        fontFamily: fonts.heading,
        fontSize: 22,
    },
    list: {
        marginTop: 16,
        gap: 10,
    },
    option: {
        flexDirection: 'row',
        gap: 12,
        borderRadius: 14,
        paddingVertical: 15,
        paddingHorizontal: 18,
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    optionPressed: {
        transform: [{ scale: 0.99 }],
    },
    optionPrimary: {
        backgroundColor: colors.accent,
        borderColor: colors.accentBorder,
        shadowColor: colors.accent,
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 6 },
    },
    optionDestructive: {
        backgroundColor: colors.accentMuted,
        borderColor: colors.accentBorder,
    },
    optionIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    optionIconWrapPrimary: {
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    optionIconWrapDestructive: {
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    optionCopy: {
        flex: 1,
    },
    optionLabel: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '700',
    },
    optionLabelPrimary: {
        color: colors.textPrimary,
    },
    optionLabelDestructive: {
        color: colors.accent,
    },
    optionSub: {
        marginTop: 3,
        color: colors.textSecondary,
        fontSize: 11,
    },
    quitDivider: {
        height: 1,
        marginTop: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    quitButton: {
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    quitText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
    },
});
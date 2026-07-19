import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Clock3, Swords } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { useSettingsStore } from '../store/settingsStore';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, radii, spacing } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GameSetup'>;
type Mode = 'pvp' | 'ai';

export function GameSetupScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { defaultTimer, aiDifficulty } = useSettingsStore();
    const [mode, setMode] = useState<Mode>('pvp');
    const [player1, setPlayer1] = useState('White');
    const [player2, setPlayer2] = useState('Black');
    const [timer, setTimer] = useState<number | null>(defaultTimer);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(aiDifficulty);

    const timerOptions = useMemo(() => ([null, 5, 10, 15] as Array<number | null>), []);

    const handleStart = () => {
        const p1 = player1.trim() || 'White';
        const p2 = player2.trim() || (mode === 'ai' ? 'Knight AI' : 'Black');

        navigation.navigate('Game', {
            mode,
            player1: p1,
            player2: p2,
            timer,
            aiDifficulty: mode === 'ai' ? difficulty : undefined,
        });
    };

    return (
        <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                <ArrowLeft size={18} color={colors.textPrimary} />
            </Pressable>

            <View style={styles.card}>
                <Text style={styles.title}>Game Setup</Text>
                <Text style={styles.copy}>Set the players, mode, and timer before starting the match.</Text>

                <View style={styles.segmentRow}>
                    <Pressable style={[styles.segment, mode === 'pvp' && styles.segmentActive]} onPress={() => setMode('pvp')}>
                        <Swords size={16} color={mode === 'pvp' ? colors.textPrimary : colors.textMuted} />
                        <Text style={[styles.segmentLabel, mode === 'pvp' && styles.segmentLabelActive]}>PvP</Text>
                    </Pressable>
                    <Pressable style={[styles.segment, mode === 'ai' && styles.segmentActive]} onPress={() => setMode('ai')}>
                        <Swords size={16} color={mode === 'ai' ? colors.textPrimary : colors.textMuted} />
                        <Text style={[styles.segmentLabel, mode === 'ai' && styles.segmentLabelActive]}>vs AI</Text>
                    </Pressable>
                </View>

                <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Player 1</Text>
                    <TextInput value={player1} onChangeText={setPlayer1} placeholder="White" placeholderTextColor={colors.textMuted} style={styles.input} />
                </View>
                <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>{mode === 'ai' ? 'Human Player' : 'Player 2'}</Text>
                    <TextInput value={player2} onChangeText={setPlayer2} placeholder={mode === 'ai' ? 'You' : 'Black'} placeholderTextColor={colors.textMuted} style={styles.input} />
                </View>

                <View style={styles.fieldBlock}>
                    <View style={styles.labelRow}>
                        <Clock3 size={16} color={colors.textMuted} />
                        <Text style={styles.fieldLabel}>Timer</Text>
                    </View>
                    <View style={styles.pillRow}>
                        {timerOptions.map((option) => {
                            const active = timer === option;
                            const label = option === null ? 'None' : `${option} min`;
                            return (
                                <Pressable key={String(option)} onPress={() => setTimer(option)} style={[styles.pill, active && styles.pillActive]}>
                                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {mode === 'ai' ? (
                    <View style={styles.fieldBlock}>
                        <Text style={styles.fieldLabel}>AI Difficulty</Text>
                        <View style={styles.pillRow}>
                            {(['easy', 'medium', 'hard'] as const).map((item) => {
                                const active = difficulty === item;
                                return (
                                    <Pressable key={item} onPress={() => setDifficulty(item)} style={[styles.pill, active && styles.pillActive]}>
                                        <Text style={[styles.pillText, active && styles.pillTextActive]}>{item.toUpperCase()}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                ) : null}

                <PrimaryButton label="Start Match" onPress={handleStart} style={styles.startButton} />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
        paddingHorizontal: spacing.md,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.surfaceBorder,
    },
    card: {
        marginTop: spacing.md,
        padding: spacing.lg,
        borderRadius: radii.xl,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.surfaceBorder,
    },
    title: {
        color: colors.textPrimary,
        fontFamily: fonts.heading,
        fontSize: 28,
    },
    copy: {
        marginTop: 8,
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 22,
    },
    segmentRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: spacing.lg,
    },
    segment: {
        flex: 1,
        minHeight: 52,
        borderRadius: radii.full,
        backgroundColor: colors.bg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.surfaceBorder,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    segmentActive: {
        backgroundColor: colors.accentMuted,
        borderColor: colors.accentBorder,
    },
    segmentLabel: {
        color: colors.textMuted,
        fontSize: 13,
        fontWeight: '700',
    },
    segmentLabelActive: {
        color: colors.textPrimary,
    },
    fieldBlock: {
        marginTop: spacing.lg,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    fieldLabel: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '700',
    },
    input: {
        minHeight: 54,
        borderRadius: radii.full,
        paddingHorizontal: 16,
        backgroundColor: colors.bg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.surfaceBorder,
        color: colors.textPrimary,
        fontSize: 14,
        fontFamily: fonts.body,
    },
    pillRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    pill: {
        minHeight: 38,
        borderRadius: radii.full,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.surfaceBorder,
    },
    pillActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accentBorder,
    },
    pillText: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '700',
    },
    pillTextActive: {
        color: colors.textPrimary,
    },
    startButton: {
        marginTop: spacing.xl,
    },
});
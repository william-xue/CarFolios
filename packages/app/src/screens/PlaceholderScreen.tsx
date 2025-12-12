import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../theme'

interface PlaceholderScreenProps {
    title: string
}

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>功能开发中...</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    title: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textLight,
    },
})

export default PlaceholderScreen

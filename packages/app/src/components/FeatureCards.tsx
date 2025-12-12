import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../theme'

type GradientType = 'purple' | 'pink' | 'blue' | 'green'

interface Feature {
    icon: string
    title: string
    description: string
    gradient: GradientType
}

interface FeatureCardsProps {
    features: Feature[]
}

// 渐变色配置
const gradientColors: Record<GradientType, { bg: string; icon: string }> = {
    purple: { bg: '#f3e8ff', icon: '#9333ea' },
    pink: { bg: '#fce7f3', icon: '#ec4899' },
    blue: { bg: '#dbeafe', icon: '#3b82f6' },
    green: { bg: '#dcfce7', icon: '#22c55e' },
}

// 图标映射（使用 emoji 作为简单图标）
const iconMap: Record<string, string> = {
    'location-o': '🌍',
    'credit-pay': '💳',
    'certificate': '✅',
    'service-o': '💬',
}

export function FeatureCards({ features }: FeatureCardsProps) {
    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {features.map((feature, index) => {
                    const colors = gradientColors[feature.gradient]
                    return (
                        <View key={index} style={styles.card}>
                            <View style={[styles.iconWrapper, { backgroundColor: colors.bg }]}>
                                <Text style={styles.icon}>{iconMap[feature.icon] || '📦'}</Text>
                            </View>
                            <Text style={styles.title}>{feature.title}</Text>
                            <Text style={styles.description}>{feature.description}</Text>
                        </View>
                    )
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.white,
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '23%',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    icon: {
        fontSize: 20,
    },
    title: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: 2,
    },
    description: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textLight,
        textAlign: 'center',
    },
})

export default FeatureCards

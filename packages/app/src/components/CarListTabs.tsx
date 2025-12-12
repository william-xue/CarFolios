import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { theme } from '../theme'

export type TabType = 'recommend' | 'latest' | 'hot'

interface Tab {
    key: TabType
    label: string
}

interface CarListTabsProps {
    activeTab: TabType
    onChange?: (tab: TabType) => void
}

const tabs: Tab[] = [
    { key: 'recommend', label: '推荐' },
    { key: 'latest', label: '最新' },
    { key: 'hot', label: '热门' },
]

export function CarListTabs({ activeTab, onChange }: CarListTabsProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>精选车源</Text>
            </View>
            <View style={styles.tabs}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => onChange?.(tab.key)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab.key && styles.tabTextActive,
                            ]}
                        >
                            {tab.label}
                        </Text>
                        {activeTab === tab.key && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.white,
        paddingTop: theme.spacing.md,
        marginTop: theme.spacing.sm,
    },
    header: {
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    tab: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        marginRight: theme.spacing.lg,
        position: 'relative',
    },
    tabActive: {},
    tabText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
    },
    tabTextActive: {
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.semibold,
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: theme.spacing.md,
        right: theme.spacing.md,
        height: 2,
        backgroundColor: theme.colors.primary,
        borderRadius: 1,
    },
})

export default CarListTabs

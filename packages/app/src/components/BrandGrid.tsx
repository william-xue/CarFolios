import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native'
import { theme } from '../theme'
import type { Brand } from '../types'

interface BrandGridProps {
    brands: Brand[]
    loading?: boolean
    onSelect?: (brandId: number) => void
}

// 显示前 8 个品牌
const MAX_BRANDS = 8

export function BrandGrid({ brands, loading, onSelect }: BrandGridProps) {
    const displayBrands = brands.slice(0, MAX_BRANDS)

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.sectionTitle}>热门品牌</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>热门品牌</Text>
                <TouchableOpacity>
                    <Text style={styles.moreText}>更多 &gt;</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.grid}>
                {displayBrands.map((brand) => (
                    <TouchableOpacity
                        key={brand.id}
                        style={styles.brandItem}
                        onPress={() => onSelect?.(brand.id)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.logoWrapper}>
                            {brand.logo ? (
                                <Image
                                    source={{ uri: brand.logo }}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            ) : (
                                <Text style={styles.logoPlaceholder}>{brand.initial}</Text>
                            )}
                        </View>
                        <Text style={styles.brandName} numberOfLines={1}>
                            {brand.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.white,
        paddingVertical: theme.spacing.md,
        marginTop: theme.spacing.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    moreText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textLight,
    },
    loadingContainer: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: theme.spacing.md,
    },
    brandItem: {
        width: '25%',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
    },
    logoWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    logo: {
        width: 32,
        height: 32,
    },
    logoPlaceholder: {
        fontSize: 18,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textSecondary,
    },
    brandName: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
})

export default BrandGrid

import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native'
import { theme } from '../theme'
import type { Car } from '../types'

interface CarCardProps {
    car: Car
    onPress?: () => void
}

// 格式化变速箱类型
function formatGearbox(type: string): string {
    const map: Record<string, string> = {
        MT: '手动',
        AT: '自动',
        DCT: '双离合',
        CVT: 'CVT',
    }
    return map[type] || type
}

export function CarCard({ car, onPress }: CarCardProps) {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: car.coverImage }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                    {car.title}
                </Text>
                <View style={styles.tags}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{car.firstRegDate}</Text>
                    </View>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{car.mileage}万公里</Text>
                    </View>
                    {car.gearbox && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{formatGearbox(car.gearbox)}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.bottom}>
                    <Text style={styles.price}>
                        {car.price}
                        <Text style={styles.priceUnit}>万</Text>
                    </Text>
                    <Text style={styles.city}>{car.cityName}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.background,
    },
    image: {
        width: 120,
        height: 90,
        borderRadius: theme.borderRadius.md,
    },
    info: {
        flex: 1,
        marginLeft: theme.spacing.md,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        lineHeight: 20,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    tag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: theme.colors.background,
        borderRadius: 4,
    },
    tagText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    bottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    price: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.danger,
    },
    priceUnit: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.normal,
    },
    city: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textLight,
    },
})

export default CarCard

import React, { useState, useEffect, useRef } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    ImageBackground,
    Animated,
} from 'react-native'
import { theme } from '../theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const HERO_HEIGHT = 280

interface HeroSlide {
    image: string
    alt: string
}

interface PlatformStats {
    cars: number
    cities: number
    deals: number
    partners: number
}

interface HeroSectionProps {
    slides: HeroSlide[]
    stats: PlatformStats
    autoplayDelay?: number
}

// 格式化数字
function formatNumber(num: number): string {
    return num.toLocaleString()
}

export function HeroSection({
    slides,
    stats,
    autoplayDelay = 4000,
}: HeroSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const flatListRef = useRef<FlatList>(null)
    const fadeAnim = useRef(new Animated.Value(1)).current

    // 自动轮播
    useEffect(() => {
        if (slides.length <= 1) return

        const timer = setInterval(() => {
            const nextIndex = (currentIndex + 1) % slides.length
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true })
            setCurrentIndex(nextIndex)
        }, autoplayDelay)

        return () => clearInterval(timer)
    }, [currentIndex, slides.length, autoplayDelay])

    // 渲染轮播项
    const renderSlide = ({ item }: { item: HeroSlide }) => (
        <ImageBackground
            source={{ uri: item.image }}
            style={styles.slide}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
        </ImageBackground>
    )

    // 滚动结束时更新索引
    const onMomentumScrollEnd = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH)
        setCurrentIndex(index)
    }

    return (
        <View style={styles.container}>
            {/* 轮播图 */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onMomentumScrollEnd}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
            />

            {/* 内容层 */}
            <View style={styles.content}>
                <Text style={styles.title}>爱车出海</Text>
                <Text style={styles.subtitle}>全球二手车交易平台</Text>

                {/* 统计数据 */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{formatNumber(stats.cars)}+</Text>
                        <Text style={styles.statLabel}>优质车源</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.cities}+</Text>
                        <Text style={styles.statLabel}>覆盖城市</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{formatNumber(stats.deals)}+</Text>
                        <Text style={styles.statLabel}>成交量</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.partners}+</Text>
                        <Text style={styles.statLabel}>合作商家</Text>
                    </View>
                </View>
            </View>

            {/* 轮播指示器 */}
            {slides.length > 1 && (
                <View style={styles.indicators}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                currentIndex === index && styles.indicatorActive,
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        height: HERO_HEIGHT,
        position: 'relative',
    },
    slide: {
        width: SCREEN_WIDTH,
        height: HERO_HEIGHT,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10, 20, 40, 0.75)',
    },
    content: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.white,
        letterSpacing: 4,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.85)',
        letterSpacing: 2,
        marginBottom: theme.spacing.xl,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.white,
    },
    statLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: theme.spacing.sm,
    },
    indicators: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    indicator: {
        width: 20,
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 2,
    },
    indicatorActive: {
        width: 32,
        backgroundColor: theme.colors.white,
    },
})

export default HeroSection
